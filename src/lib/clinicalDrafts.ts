import type { AllergyStatus, IntakeStatus, NoteStatus } from "@/types/telehealth";
import {
  listAnswer,
  textAnswer,
  type IntakeAnswers,
} from "@/data/intakeQuestions";

export type SaveLocation = "database" | "device";

export type SaveResult = {
  location: SaveLocation;
  message: string;
};

export type IntakeDraft = {
  id: string;
  patientId?: string;
  appointmentId?: string;
  answers: IntakeAnswers;
  status: IntakeStatus;
  updatedAt: string;
};

export type SoapDraft = {
  appointmentId: string;
  patientId?: string;
  providerId?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: NoteStatus;
  updatedAt: string;
};

export type SessionDurationLog = {
  appointmentId: string;
  role: "patient" | "provider";
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  videoVendor: string;
};

function deviceResult(message: string): SaveResult {
  return { location: "device", message };
}

function databaseResult(message: string): SaveResult {
  return { location: "database", message };
}

async function getSupabase() {
  const mod = await import("@/integrations/supabase/client");
  return mod.supabase;
}

export async function saveIntakeDraft(draft: IntakeDraft): Promise<SaveResult> {
  const key = `sprymd.intake.${draft.id}`;
  window.localStorage.setItem(key, JSON.stringify(draft));

  if (!draft.patientId) {
    return deviceResult(
      "Draft saved on this device. Sign in so it can sync to your chart.",
    );
  }

  try {
    const supabase = await getSupabase();
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      return deviceResult(
        "Draft saved on this device. Sign in so it can sync to your chart.",
      );
    }

    const allergy = textAnswer(draft.answers, "allergy_status");
    const allergyStatus: AllergyStatus =
      allergy === "none" || allergy === "has_allergies" || allergy === "unknown"
        ? allergy
        : "unknown";

    const { error } = await supabase.from("patient_intakes").upsert({
      id: draft.id,
      patient_id: draft.patientId,
      appointment_id: draft.appointmentId ?? null,
      chief_complaints: listAnswer(draft.answers, "chief_complaints"),
      chief_complaint_detail: textAnswer(draft.answers, "chief_complaint_detail"),
      past_medical_history: listAnswer(draft.answers, "past_medical_history"),
      past_medical_history_notes: textAnswer(
        draft.answers,
        "past_medical_history_notes",
      ),
      allergy_status: allergyStatus,
      allergy_disclosure: textAnswer(draft.answers, "allergy_disclosure"),
      answers: draft.answers,
      status: draft.status,
      updated_at: draft.updatedAt,
    });

    if (error) {
      return deviceResult(
        `Draft saved on this device. Chart sync failed: ${error.message}`,
      );
    }
    return databaseResult("Draft saved to the chart.");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chart sync unavailable.";
    return deviceResult(`Draft saved on this device. ${message}`);
  }
}

export async function saveSoapDraft(draft: SoapDraft): Promise<SaveResult> {
  const key = `sprymd.soap.${draft.appointmentId}`;
  window.localStorage.setItem(key, JSON.stringify(draft));

  if (!draft.patientId || !draft.providerId) {
    return deviceResult(
      "Draft saved on this device. Sign in as the assigned provider to sync the note.",
    );
  }

  try {
    const supabase = await getSupabase();
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      return deviceResult(
        "Draft saved on this device. Sign in as the assigned provider to sync the note.",
      );
    }

    const { error } = await supabase.from("consultation_notes").upsert(
      {
        appointment_id: draft.appointmentId,
        patient_id: draft.patientId,
        provider_id: draft.providerId,
        subjective: draft.subjective,
        objective: draft.objective,
        assessment: draft.assessment,
        plan: draft.plan,
        status: draft.status,
        updated_at: draft.updatedAt,
      },
      { onConflict: "appointment_id" },
    );

    if (error) {
      return deviceResult(
        `Draft saved on this device. Chart sync failed: ${error.message}`,
      );
    }
    return databaseResult("SOAP draft saved to the chart.");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chart sync unavailable.";
    return deviceResult(`Draft saved on this device. ${message}`);
  }
}

export async function logSessionDuration(
  entry: SessionDurationLog,
): Promise<SaveResult> {
  const key = `sprymd.visitSession.${entry.appointmentId}`;
  window.localStorage.setItem(key, JSON.stringify(entry));

  try {
    const supabase = await getSupabase();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      return deviceResult(
        "Session duration saved on this device. Sign in to write it to the visit record.",
      );
    }

    const res = await fetch("/api/visits/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entry),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      return deviceResult(
        body.message ||
          "Session duration saved on this device. The visit record was not updated.",
      );
    }
    return databaseResult("Session duration saved to the visit record.");
  } catch {
    return deviceResult(
      "Session duration saved on this device. The visit record was not updated.",
    );
  }
}

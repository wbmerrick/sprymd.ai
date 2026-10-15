import {
  listAnswer,
  textAnswer,
  type IntakeAnswers,
} from "@/data/intakeQuestions";
import type { IntakeDraft, SaveResult } from "@/lib/clinicalDrafts";

/**
 * Persist a guest post-pay intake via the staff-bypassing API that verifies
 * appointmentId + Stripe Checkout session ownership.
 */
export async function saveGuestIntakeDraft(
  draft: IntakeDraft,
  sessionId: string,
): Promise<SaveResult> {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      `sprymd.intake.${draft.id}`,
      JSON.stringify(draft),
    );
  }

  if (!draft.appointmentId) {
    return {
      location: "device",
      message: "Draft saved on this device. Missing appointment id for chart sync.",
    };
  }
  if (!sessionId.startsWith("cs_")) {
    return {
      location: "device",
      message: "Draft saved on this device. Missing Stripe session for chart sync.",
    };
  }

  const answers = draft.answers as IntakeAnswers;
  const preferredPharmacy =
    answers.preferred_pharmacy &&
    typeof answers.preferred_pharmacy === "object" &&
    !Array.isArray(answers.preferred_pharmacy)
      ? (answers.preferred_pharmacy as Record<string, unknown>)
      : undefined;
  const hardStop =
    answers.hard_stop === true ||
    answers.hard_stop === "true" ||
    Boolean(
      answers.funnel &&
        typeof answers.funnel === "object" &&
        (answers.funnel as { crisis?: boolean; disqualifier?: string })
          .crisis,
    );

  const res = await fetch("/api/intake/guest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appointmentId: draft.appointmentId,
      sessionId,
      draftId: draft.id,
      status: draft.status,
      answers,
      preferredPharmacy,
      hardStop,
      chiefComplaints: listAnswer(answers, "chief_complaints"),
      chiefComplaintDetail: textAnswer(answers, "chief_complaint_detail"),
      pastMedicalHistory: listAnswer(answers, "past_medical_history"),
      pastMedicalHistoryNotes: textAnswer(
        answers,
        "past_medical_history_notes",
      ),
      allergyStatus: textAnswer(answers, "allergy_status") || "unknown",
      allergyDisclosure: textAnswer(answers, "allergy_disclosure"),
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  };
  if (!res.ok) {
    return {
      location: "device",
      message: `Draft saved on this device. Chart sync failed: ${json.message || json.error || res.status}`,
    };
  }
  return {
    location: "database",
    message: json.message || "Intake saved to the chart for your clinician.",
  };
}

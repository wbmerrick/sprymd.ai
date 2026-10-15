import type { SupabaseClient } from "@supabase/supabase-js";
import { akuteConfigured } from "./client";
import { ensureAkutePatient } from "./patients";
import { createTask } from "./tasks";
import { createClinicalNote, formatIntakeNoteSections } from "./notes";

function splitName(fullName: string): { first: string; last: string } {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { first: "Patient", last: "Unknown" };
  if (parts.length === 1) return { first: parts[0], last: "Patient" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

/**
 * After intake is saved: ensure Akute patient, post note + review task, store akute_patient_id.
 */
export async function syncIntakeToAkute(opts: {
  supabase: SupabaseClient;
  patientId: string;
  answers?: Record<string, unknown>;
  chiefComplaint?: string;
  flags?: string[];
  consents?: string[];
  urgent?: boolean;
}): Promise<{ ok: boolean; akutePatientId?: string; skipped?: string; error?: string }> {
  if (!akuteConfigured()) {
    return { ok: false, skipped: "akute_not_configured" };
  }
  const providerId = String(process.env.AKUTE_PROVIDER_ID || "").trim();
  if (!providerId) {
    return { ok: false, skipped: "akute_provider_missing" };
  }

  try {
    const { data: patient, error } = await opts.supabase
      .from("patients")
      .select(
        "id, email, full_name, date_of_birth, phone, state_of_residence, akute_patient_id, preferred_pharmacy",
      )
      .eq("id", opts.patientId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!patient) throw new Error("patient_not_found");

    let akutePatientId = patient.akute_patient_id
      ? String(patient.akute_patient_id)
      : "";

    if (!akutePatientId) {
      const { first, last } = splitName(String(patient.full_name || ""));
      const dob = String(patient.date_of_birth || "1900-01-01").slice(0, 10);
      const ensured = await ensureAkutePatient({
        externalId: String(patient.id),
        firstName: first,
        lastName: last,
        dateOfBirth: dob,
        email: patient.email ? String(patient.email) : undefined,
        phone: patient.phone ? String(patient.phone) : undefined,
        addressState: patient.state_of_residence
          ? String(patient.state_of_residence)
          : undefined,
      });
      akutePatientId = ensured.akutePatientId;
      await opts.supabase
        .from("patients")
        .update({
          akute_patient_id: akutePatientId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", patient.id);
    }

    const pharmacy =
      (patient.preferred_pharmacy as Record<string, unknown> | null) || null;
    const sections = formatIntakeNoteSections({
      answers: opts.answers,
      chiefComplaint: opts.chiefComplaint,
      flags: opts.flags,
      consents: opts.consents,
      preferredPharmacy: pharmacy,
    });

    try {
      await createClinicalNote({
        patientId: akutePatientId,
        authorUserId: providerId,
        sections,
        type: "Progress note",
        status: "preliminary",
      });
    } catch (noteErr) {
      console.warn(
        JSON.stringify({
          event: "akute_note_failed",
          message:
            noteErr instanceof Error ? noteErr.message : String(noteErr),
        }),
      );
    }

    const title = opts.urgent
      ? "SpryMD intake review — URGENT"
      : "SpryMD intake review";
    const description =
      sections.map((s) => `## ${s.title}\n${s.text}`).join("\n\n") +
      `\n\nSupabase patient_id: ${patient.id}`;

    await createTask({
      title,
      description: description.slice(0, 8000),
      patientId: akutePatientId,
      ownerId: providerId,
      priority: opts.urgent ? "p1" : "p2",
      tags: ["SpryMD", "intake"],
    });

    return { ok: true, akutePatientId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ event: "akute_sync_failed", message }));
    return { ok: false, error: message };
  }
}

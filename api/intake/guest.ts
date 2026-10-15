/**
 * POST /api/intake/guest — persist a post-checkout intake for a paid (or
 * session-verified) guest appointment without a Supabase Auth session.
 *
 * Authz: appointmentId + matching Stripe Checkout session_id, and the
 * appointment must be paid / awaiting_payment / completed (not cancelled).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePreflight, applyCors } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import { syncIntakeToAkute } from "../_lib/akute/syncIntake";
import { refundEvaluationForAppointment } from "../_lib/akute/refundEvaluation";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type GuestIntakeBody = {
  appointmentId?: string;
  sessionId?: string;
  draftId?: string;
  status?: string;
  answers?: Record<string, unknown>;
  chiefComplaints?: string[];
  chiefComplaintDetail?: string;
  pastMedicalHistory?: string[];
  pastMedicalHistoryNotes?: string;
  allergyStatus?: string;
  allergyDisclosure?: string;
  preferredPharmacy?: Record<string, unknown>;
  hardStop?: boolean | string;
};

function parseBody(req: VercelRequest): GuestIntakeBody {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}") as GuestIntakeBody;
    } catch {
      return {};
    }
  }
  return req.body as GuestIntakeBody;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v)).filter(Boolean);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = parseBody(req);
  const appointmentId = String(body.appointmentId || "").trim();
  const sessionId = String(body.sessionId || "").trim();
  const answers = (body.answers || {}) as Record<string, unknown>;

  if (!UUID_RE.test(appointmentId)) {
    res.status(400).json({ error: "invalid_appointment_id" });
    return;
  }
  if (!sessionId.startsWith("cs_")) {
    res.status(400).json({ error: "invalid_session_id" });
    return;
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: appointment, error } = await admin
      .from("appointments")
      .select(
        "id, status, patient_id, stripe_checkout_session_id",
      )
      .eq("id", appointmentId)
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: "lookup_failed", message: error.message });
      return;
    }
    if (!appointment) {
      res.status(404).json({ error: "appointment_not_found" });
      return;
    }
    if (
      String(appointment.stripe_checkout_session_id || "") !== sessionId
    ) {
      res.status(403).json({ error: "session_mismatch" });
      return;
    }
    const status = String(appointment.status || "");
    if (!["paid", "awaiting_payment", "completed", "scheduled"].includes(status)) {
      res.status(409).json({
        error: "appointment_not_open",
        status,
        message: "Intake can only be filed on an open paid visit.",
      });
      return;
    }
    if (!appointment.patient_id) {
      res.status(409).json({ error: "missing_patient" });
      return;
    }

    const draftId = String(body.draftId || "").trim() || crypto.randomUUID();
    const chiefComplaints =
      body.chiefComplaints ||
      asStringList(answers.chief_complaints);
    const chiefComplaintDetail =
      body.chiefComplaintDetail ||
      (typeof answers.chief_complaint_detail === "string"
        ? answers.chief_complaint_detail
        : "") ||
      "";
    const pastMedicalHistory =
      body.pastMedicalHistory ||
      asStringList(answers.past_medical_history);
    const pastMedicalHistoryNotes =
      body.pastMedicalHistoryNotes ||
      (typeof answers.past_medical_history_notes === "string"
        ? answers.past_medical_history_notes
        : "") ||
      "";
    const allergyRaw =
      body.allergyStatus ||
      (typeof answers.allergy_status === "string"
        ? answers.allergy_status
        : "unknown");
    const allergyStatus =
      allergyRaw === "none" ||
      allergyRaw === "has_allergies" ||
      allergyRaw === "unknown"
        ? allergyRaw
        : "unknown";
    const allergyDisclosure =
      body.allergyDisclosure ||
      (typeof answers.allergy_disclosure === "string"
        ? answers.allergy_disclosure
        : "") ||
      "";
    const intakeStatus =
      body.status === "draft" || body.status === "submitted"
        ? body.status
        : "submitted";

    const row = {
      id: draftId,
      patient_id: appointment.patient_id,
      appointment_id: appointmentId,
      chief_complaints: chiefComplaints,
      chief_complaint_detail: chiefComplaintDetail,
      past_medical_history: pastMedicalHistory,
      past_medical_history_notes: pastMedicalHistoryNotes,
      allergy_status: allergyStatus,
      allergy_disclosure: allergyDisclosure,
      answers,
      status: intakeStatus,
      updated_at: new Date().toISOString(),
    };

    const { data: saved, error: upsertError } = await admin
      .from("patient_intakes")
      .upsert(row, { onConflict: "id" })
      .select("id, status, appointment_id, patient_id, updated_at")
      .maybeSingle();

    if (upsertError) {
      res.status(500).json({
        error: "intake_upsert_failed",
        message: upsertError.message,
      });
      return;
    }

    if (body.preferredPharmacy && typeof body.preferredPharmacy === "object") {
      await admin
        .from("patients")
        .update({
          preferred_pharmacy: body.preferredPharmacy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment.patient_id);
    }

    const funnel = (answers.funnel || {}) as Record<string, unknown>;
    const hardStop =
      body.hardStop === true ||
      body.hardStop === "true" ||
      funnel.crisis === true ||
      Boolean(funnel.disqualifier);

    let refund: Awaited<ReturnType<typeof refundEvaluationForAppointment>> | null =
      null;
    if (hardStop && intakeStatus === "submitted") {
      refund = await refundEvaluationForAppointment({
        supabase: admin,
        appointmentId,
        reason: "hard_stop",
      });
    } else if (intakeStatus === "submitted") {
      const urgent =
        funnel.crisis === true ||
        String(funnel.kind || "") === "consult";
      await syncIntakeToAkute({
        supabase: admin,
        patientId: String(appointment.patient_id),
        answers,
        chiefComplaint: chiefComplaintDetail || undefined,
        flags: [
          funnel.disqualifier ? `Disqualifier: ${funnel.disqualifier}` : "",
          funnel.crisis ? "CRISIS FLAG" : "",
        ].filter(Boolean),
        consents: ["Telehealth and cash-pay consents recorded at checkout"],
        urgent,
      });
    }

    res.status(200).json({
      ok: true,
      intake: saved,
      location: "database",
      message: hardStop
        ? "Hard-stop recorded. Evaluation fee refund initiated when payment is on file."
        : "Intake saved to the chart for your clinician.",
      refund,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "intake_guest_failed", message });
  }
}

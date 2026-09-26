import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePreflight, applyCors } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import { requireStaff } from "../_lib/staffAuth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STATUSES = new Set([
  "scheduled",
  "awaiting_payment",
  "paid",
  "completed",
  "cancelled",
  "no_show",
]);

type PatchBody = {
  status?: string;
  assignSelf?: boolean | string;
  pharmacyStatus?: string;
  pharmacyNotes?: string;
};

const PHARMACY_STATUSES = new Set(["queued", "sent", "held", "declined", ""]);

function parseBody(req: VercelRequest): PatchBody {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}") as PatchBody;
    } catch {
      return {};
    }
  }
  return req.body as PatchBody;
}

/**
 * GET /api/ops/appointment?id= — detail + payment_events + intake summary
 * PATCH /api/ops/appointment — { id, status?, assignSelf? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  if (handlePreflight(req, res)) return;

  const auth = await requireStaff(req.headers.authorization);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  if (req.method === "GET") {
    await handleGet(req, res);
    return;
  }
  if (req.method === "PATCH") {
    await handlePatch(req, res, auth.staff.providerId);
    return;
  }

  res.status(405).json({ error: "method_not_allowed" });
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id || "").trim();
  if (!UUID_RE.test(id)) {
    res.status(400).json({ error: "invalid_appointment_id" });
    return;
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: appointment, error } = await admin
      .from("appointments")
      .select(
        "id, status, service_tier, amount_cents, currency, paid_at, scheduled_at, created_at, updated_at, stripe_checkout_session_id, stripe_payment_intent_id, patient_id, provider_id, pharmacy_status, pharmacy_notes, pharmacy_sent_at, patients(id, email, full_name, phone, state_of_residence, date_of_birth)",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: "lookup_failed", message: error.message });
      return;
    }
    if (!appointment) {
      res.status(404).json({ error: "appointment_not_found" });
      return;
    }

    const paymentsPromise = admin
      .from("payment_events")
      .select(
        "id, event_type, status, amount_cents, currency, created_at, stripe_checkout_session_id, stripe_payment_intent_id",
      )
      .eq("appointment_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    const intakesPromise = appointment.patient_id
      ? admin
          .from("patient_intakes")
          .select("id, status, chief_complaint_detail, updated_at, answers")
          .eq("patient_id", appointment.patient_id)
          .order("updated_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] as Array<{
          id: string;
          status: string;
          chief_complaint_detail: string;
          updated_at: string;
          answers: unknown;
        }> });

    const [{ data: payments }, { data: intakes }] = await Promise.all([
      paymentsPromise,
      intakesPromise,
    ]);

    const patientRaw = appointment.patients as
      | Record<string, unknown>
      | Record<string, unknown>[]
      | null;
    const patient = Array.isArray(patientRaw) ? patientRaw[0] : patientRaw;

    res.status(200).json({
      appointment: {
        id: appointment.id,
        status: appointment.status,
        serviceTier: appointment.service_tier,
        amountCents: appointment.amount_cents,
        currency: appointment.currency,
        paidAt: appointment.paid_at,
        scheduledAt: appointment.scheduled_at,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at,
        stripeCheckoutSessionId: appointment.stripe_checkout_session_id,
        stripePaymentIntentId: appointment.stripe_payment_intent_id,
        patientId: appointment.patient_id,
        providerId: appointment.provider_id,
        pharmacyStatus: appointment.pharmacy_status || null,
        pharmacyNotes: appointment.pharmacy_notes || null,
        pharmacySentAt: appointment.pharmacy_sent_at || null,
        patient: patient
          ? {
              id: patient.id,
              email: patient.email,
              fullName: patient.full_name,
              phone: patient.phone,
              state: patient.state_of_residence,
              dateOfBirth: patient.date_of_birth,
            }
          : null,
      },
      payments: payments || [],
      intakes: (intakes || []).map((row) => ({
        id: row.id,
        status: row.status,
        summary: row.chief_complaint_detail,
        updatedAt: row.updated_at,
        answers: row.answers,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "lookup_failed", message });
  }
}

async function handlePatch(
  req: VercelRequest,
  res: VercelResponse,
  providerId: string | null,
) {
  const body = parseBody(req);
  const id = String((req.query.id as string) || (body as { id?: string }).id || "").trim();
  if (!UUID_RE.test(id)) {
    res.status(400).json({ error: "invalid_appointment_id" });
    return;
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.status != null) {
    const status = String(body.status).trim().toLowerCase();
    if (!STATUSES.has(status)) {
      res.status(400).json({ error: "invalid_status" });
      return;
    }
    patch.status = status;
  }

  const assignSelf =
    body.assignSelf === true || body.assignSelf === "true";
  if (assignSelf) {
    if (!providerId) {
      res.status(400).json({
        error: "provider_row_required",
        message:
          "Create an active providers row for this staff user before assigning cases.",
      });
      return;
    }
    patch.provider_id = providerId;
  }

  if (body.pharmacyStatus != null) {
    const pharmacyStatus = String(body.pharmacyStatus).trim().toLowerCase();
    if (!PHARMACY_STATUSES.has(pharmacyStatus)) {
      res.status(400).json({ error: "invalid_pharmacy_status" });
      return;
    }
    patch.pharmacy_status = pharmacyStatus || null;
    if (pharmacyStatus === "sent") {
      patch.pharmacy_sent_at = new Date().toISOString();
    }
  }
  if (body.pharmacyNotes != null) {
    patch.pharmacy_notes = String(body.pharmacyNotes).slice(0, 4000);
  }

  if (Object.keys(patch).length <= 1) {
    res.status(400).json({ error: "empty_patch" });
    return;
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("appointments")
      .update(patch)
      .eq("id", id)
      .select("id, status, provider_id, updated_at")
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: "update_failed", message: error.message });
      return;
    }
    if (!data) {
      res.status(404).json({ error: "appointment_not_found" });
      return;
    }

    res.status(200).json({ appointment: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "update_failed", message });
  }
}

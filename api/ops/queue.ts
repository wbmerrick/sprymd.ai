import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePreflight, applyCors } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import { requireStaff } from "../_lib/staffAuth";

const STATUSES = [
  "scheduled",
  "awaiting_payment",
  "paid",
  "completed",
  "cancelled",
  "no_show",
] as const;

/**
 * Ops queue: appointments joined with patient + recent payment events.
 * GET /api/ops/queue?status=paid&limit=50
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (handlePreflight(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const auth = await requireStaff(req.headers.authorization);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const statusParam = String(req.query.status || "").trim().toLowerCase();
  const limitRaw = Number(req.query.limit);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.floor(limitRaw), 1), 200)
    : 75;

  try {
    const admin = getSupabaseAdmin();
    let query = admin
      .from("appointments")
      .select(
        "id, status, service_tier, amount_cents, currency, paid_at, scheduled_at, created_at, updated_at, stripe_checkout_session_id, stripe_payment_intent_id, patient_id, provider_id, patients(id, email, full_name, phone, state_of_residence)",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (statusParam && (STATUSES as readonly string[]).includes(statusParam)) {
      query = query.eq("status", statusParam);
    }

    const { data, error } = await query;
    if (error) {
      res.status(500).json({ error: "queue_query_failed", message: error.message });
      return;
    }

    const rows = (data || []).map((row) => {
      const patientRaw = row.patients as
        | Record<string, unknown>
        | Record<string, unknown>[]
        | null;
      const patient = Array.isArray(patientRaw) ? patientRaw[0] : patientRaw;
      return {
        id: row.id,
        status: row.status,
        serviceTier: row.service_tier,
        amountCents: row.amount_cents,
        currency: row.currency,
        paidAt: row.paid_at,
        scheduledAt: row.scheduled_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        stripeCheckoutSessionId: row.stripe_checkout_session_id,
        stripePaymentIntentId: row.stripe_payment_intent_id,
        patientId: row.patient_id,
        providerId: row.provider_id,
        patient: patient
          ? {
              id: patient.id,
              email: patient.email,
              fullName: patient.full_name,
              phone: patient.phone,
              state: patient.state_of_residence,
            }
          : null,
      };
    });

    res.status(200).json({
      items: rows,
      staff: {
        email: auth.staff.email,
        providerId: auth.staff.providerId,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "queue_failed", message });
  }
}

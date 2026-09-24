import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { handlePreflight, applyCors } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import { requireStaff } from "../_lib/staffAuth";
import {
  checkoutSessionLooksPaid,
  markAppointmentPaidFromSession,
} from "../_lib/markCheckoutPaid";

/**
 * POST /api/ops/reconcile — { appointmentId? , sessionId? }
 * Staff: pull Stripe Checkout state and mark paid if payment cleared
 * (covers webhook lag / missed events).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const auth = await requireStaff(req.headers.authorization);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const body =
    typeof req.body === "string"
      ? (JSON.parse(req.body || "{}") as Record<string, unknown>)
      : ((req.body || {}) as Record<string, unknown>);

  let sessionId = String(body.sessionId || req.query.session_id || "").trim();
  const appointmentId = String(
    body.appointmentId || req.query.appointment_id || "",
  ).trim();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(500).json({ error: "stripe_not_configured" });
    return;
  }

  try {
    const admin = getSupabaseAdmin();

    if (!sessionId && appointmentId) {
      const { data: appt, error } = await admin
        .from("appointments")
        .select("id, stripe_checkout_session_id, status")
        .eq("id", appointmentId)
        .maybeSingle();
      if (error) {
        res.status(500).json({ error: "lookup_failed", message: error.message });
        return;
      }
      if (!appt) {
        res.status(404).json({ error: "appointment_not_found" });
        return;
      }
      sessionId = String(appt.stripe_checkout_session_id || "");
      if (!sessionId) {
        res.status(400).json({ error: "no_stripe_session_on_appointment" });
        return;
      }
      if (appt.status === "paid") {
        res.status(200).json({
          ok: true,
          alreadyPaid: true,
          appointmentId: appt.id,
        });
        return;
      }
    }

    if (!sessionId) {
      res.status(400).json({ error: "missing_session_or_appointment" });
      return;
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSessionLooksPaid(session)) {
      res.status(200).json({
        ok: false,
        unpaid: true,
        paymentStatus: session.payment_status,
        sessionStatus: session.status,
        sessionId: session.id,
      });
      return;
    }

    const result = await markAppointmentPaidFromSession({
      supabase: admin,
      session,
      stripeEventId: `reconcile:${session.id}`,
      eventType: "checkout.session.reconciled",
    });

    res.status(200).json({
      ok: true,
      ...result,
      paymentStatus: session.payment_status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "reconcile_failed", message });
  }
}

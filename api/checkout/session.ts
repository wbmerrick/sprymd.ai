import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { handlePreflight } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import {
  checkoutSessionEligibleToMarkPaid,
  markAppointmentPaidFromSession,
} from "../_lib/markCheckoutPaid";

/**
 * Resolve a Stripe Checkout session id (or appointment id) to visit deep-link
 * data for the post-payment success page. If the row is still awaiting_payment
 * but Stripe says paid, reconcile inline (webhook lag safety net).
 * Never promotes cancelled/refunded/completed rows back to paid.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const sessionId = String(req.query.session_id || "").trim();
  const appointmentIdParam = String(req.query.appointment_id || "").trim();

  if (!sessionId && !appointmentIdParam) {
    res.status(400).json({ error: "missing_session_or_appointment" });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("appointments")
      .select(
        "id, status, service_tier, amount_cents, paid_at, patient_id, stripe_checkout_session_id",
      );

    if (appointmentIdParam) {
      query = query.eq("id", appointmentIdParam);
    } else {
      query = query.eq("stripe_checkout_session_id", sessionId);
    }

    let { data, error } = await query.maybeSingle();
    if (error) {
      res.status(500).json({ error: "lookup_failed", message: error.message });
      return;
    }

    const stripeSessionId =
      sessionId || String(data?.stripe_checkout_session_id || "");

    if (
      data &&
      data.status === "awaiting_payment" &&
      stripeSessionId &&
      process.env.STRIPE_SECRET_KEY
    ) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
          expand: ["payment_intent"],
        });
        if (checkoutSessionEligibleToMarkPaid(session)) {
          await markAppointmentPaidFromSession({
            supabase,
            session,
            stripeEventId: `reconcile:${session.id}`,
            eventType: "checkout.session.reconciled",
          });
          const refreshed = await supabase
            .from("appointments")
            .select(
              "id, status, service_tier, amount_cents, paid_at, patient_id, stripe_checkout_session_id",
            )
            .eq("id", data.id)
            .maybeSingle();
          if (refreshed.data) data = refreshed.data;
        } else {
          // Drop expired / fully-refunded checkouts from the waiting queue
          // when the success page (or ops) looks them up.
          const expired = session.status === "expired";
          const looksPaid =
            session.payment_status === "paid" || session.status === "complete";
          if (expired || looksPaid) {
            const now = new Date().toISOString();
            const { data: cancelled } = await supabase
              .from("appointments")
              .update({ status: "cancelled", updated_at: now })
              .eq("id", data.id)
              .eq("status", "awaiting_payment")
              .select(
                "id, status, service_tier, amount_cents, paid_at, patient_id, stripe_checkout_session_id",
              )
              .maybeSingle();
            if (cancelled) data = cancelled;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          JSON.stringify({
            event: "checkout_session_reconcile_failed",
            sessionId: stripeSessionId,
            message,
          }),
        );
      }
    }

    if (!data) {
      res.status(404).json({ error: "appointment_not_found" });
      return;
    }

    res.status(200).json({
      appointmentId: data.id,
      status: data.status,
      serviceTier: data.service_tier,
      amountCents: data.amount_cents,
      paidAt: data.paid_at,
      visitPath: `/visit/${data.id}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "lookup_failed", message });
  }
}

import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { recordPaymentEvent } from "../ensureCheckoutAppointment";

/**
 * Full refund of the physician evaluation fee for an appointment.
 * Idempotent: if already refunded / cancelled with a prior refund event, no-ops.
 */
export async function refundEvaluationForAppointment(opts: {
  supabase: SupabaseClient;
  appointmentId: string;
  reason: "hard_stop" | "not_clinically_appropriate";
  stripeEventId?: string;
}): Promise<{
  ok: boolean;
  refunded: boolean;
  already?: boolean;
  error?: string;
  refundId?: string;
}> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { ok: false, refunded: false, error: "stripe_not_configured" };
  }

  const { data: appointment, error } = await opts.supabase
    .from("appointments")
    .select(
      "id, status, patient_id, amount_cents, stripe_payment_intent_id, stripe_checkout_session_id",
    )
    .eq("id", opts.appointmentId)
    .maybeSingle();

  if (error) return { ok: false, refunded: false, error: error.message };
  if (!appointment) {
    return { ok: false, refunded: false, error: "appointment_not_found" };
  }

  const { data: prior } = await opts.supabase
    .from("payment_events")
    .select("id")
    .eq("appointment_id", opts.appointmentId)
    .eq("event_type", "evaluation_refund")
    .limit(1)
    .maybeSingle();

  if (prior) {
    return { ok: true, refunded: false, already: true };
  }

  const stripe = new Stripe(stripeKey);
  let paymentIntentId = appointment.stripe_payment_intent_id
    ? String(appointment.stripe_payment_intent_id)
    : "";

  if (!paymentIntentId && appointment.stripe_checkout_session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        String(appointment.stripe_checkout_session_id),
      );
      const pi = session.payment_intent;
      paymentIntentId =
        typeof pi === "string" ? pi : pi && "id" in pi ? String(pi.id) : "";
    } catch {
      /* continue */
    }
  }

  if (!paymentIntentId) {
    return { ok: false, refunded: false, error: "no_payment_intent" };
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        patient_id: appointment.patient_id ? String(appointment.patient_id) : "",
        appointment_id: opts.appointmentId,
        refund_reason: opts.reason,
      },
    });

    await recordPaymentEvent({
      supabase: opts.supabase,
      stripeEventId:
        opts.stripeEventId || `eval_refund_${opts.appointmentId}_${refund.id}`,
      stripeCheckoutSessionId: appointment.stripe_checkout_session_id
        ? String(appointment.stripe_checkout_session_id)
        : null,
      stripePaymentIntentId: paymentIntentId,
      appointmentId: opts.appointmentId,
      patientId: appointment.patient_id ? String(appointment.patient_id) : null,
      eventType: "evaluation_refund",
      amountCents: appointment.amount_cents ?? refund.amount,
      currency: "usd",
      status: refund.status || "succeeded",
      payload: { reason: opts.reason, refundId: refund.id },
    });

    await opts.supabase
      .from("appointments")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", opts.appointmentId)
      .in("status", ["paid", "awaiting_payment", "scheduled", "completed"]);

    return { ok: true, refunded: true, refundId: refund.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/already been refunded|charge_already_refunded/i.test(message)) {
      return { ok: true, refunded: false, already: true };
    }
    return { ok: false, refunded: false, error: message };
  }
}

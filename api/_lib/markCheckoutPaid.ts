import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { checkoutSessionLooksPaid } from "./checkoutPaid";
import { getServiceTier } from "./serviceTiers";
import {
  ensureCheckoutAppointment,
  recordPaymentEvent,
} from "./ensureCheckoutAppointment";

export { checkoutSessionLooksPaid };

export type MarkPaidResult = {
  updated: boolean;
  appointmentId: string;
  patientId: string;
  alreadyPaid: boolean;
};

/**
 * Mark the appointment paid from a completed Stripe Checkout session.
 * Shared by the webhook and success-page / ops reconcile paths.
 */
export async function markAppointmentPaidFromSession(input: {
  supabase: SupabaseClient;
  session: Stripe.Checkout.Session;
  /** Stripe event id when called from webhook; otherwise a stable reconcile key. */
  stripeEventId?: string | null;
  eventType?: string;
}): Promise<MarkPaidResult> {
  const { supabase, session } = input;
  let appointmentId = session.metadata?.appointment_id || "";
  let patientId = session.metadata?.patient_id || "";
  const serviceTierId = session.metadata?.service_tier_id || "";
  const patientEmail =
    session.metadata?.patient_email ||
    session.customer_details?.email ||
    session.customer_email ||
    "";
  const patientName =
    session.metadata?.patient_name || session.customer_details?.name || "";
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  const tier = serviceTierId ? getServiceTier(serviceTierId) : undefined;
  const paidAt = new Date().toISOString();

  if ((!appointmentId || !patientId) && patientEmail && serviceTierId && tier) {
    try {
      const ensured = await ensureCheckoutAppointment({
        supabase,
        appointmentId: appointmentId || undefined,
        patientEmail,
        patientName,
        serviceTierId,
        amountCents: tier.amountCents,
        currency: tier.currency,
        physicalState: session.metadata?.physical_state,
        stripeCheckoutSessionId: session.id,
      });
      appointmentId = ensured.appointmentId;
      patientId = ensured.patientId;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        JSON.stringify({
          event: "mark_paid_ensure_appointment_failed",
          sessionId: session.id,
          message,
        }),
      );
    }
  }

  // Already paid?
  if (appointmentId) {
    const { data: current } = await supabase
      .from("appointments")
      .select("id, status, patient_id")
      .eq("id", appointmentId)
      .maybeSingle();
    if (current?.status === "paid") {
      return {
        updated: false,
        appointmentId: String(current.id),
        patientId: String(current.patient_id || patientId || ""),
        alreadyPaid: true,
      };
    }
  }

  let updated = false;

  if (appointmentId) {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "paid",
        paid_at: paidAt,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        ...(serviceTierId ? { service_tier: serviceTierId } : {}),
        ...(tier ? { amount_cents: tier.amountCents } : {}),
        updated_at: paidAt,
      })
      .eq("id", appointmentId)
      .select("id, patient_id")
      .maybeSingle();

    if (error) {
      console.error(
        JSON.stringify({
          event: "mark_paid_update_failed",
          appointmentId,
          message: error.message,
        }),
      );
    } else if (data) {
      updated = true;
      if (!patientId && data.patient_id) patientId = String(data.patient_id);
    }
  }

  if (!updated) {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "paid",
        paid_at: paidAt,
        stripe_payment_intent_id: paymentIntentId,
        ...(serviceTierId ? { service_tier: serviceTierId } : {}),
        ...(tier ? { amount_cents: tier.amountCents } : {}),
        updated_at: paidAt,
      })
      .eq("stripe_checkout_session_id", session.id)
      .select("id, patient_id")
      .maybeSingle();

    if (error) {
      console.error(
        JSON.stringify({
          event: "mark_paid_update_by_session_failed",
          sessionId: session.id,
          message: error.message,
        }),
      );
    } else if (data) {
      updated = true;
      appointmentId = String(data.id);
      if (!patientId && data.patient_id) patientId = String(data.patient_id);
    }
  }

  await recordPaymentEvent({
    supabase,
    stripeEventId: input.stripeEventId || `reconcile:${session.id}`,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    appointmentId: appointmentId || null,
    patientId: patientId || null,
    eventType: input.eventType || "checkout.session.reconciled",
    amountCents: session.amount_total ?? tier?.amountCents ?? null,
    currency: session.currency || tier?.currency || "usd",
    status: session.payment_status || "paid",
    payload: {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
    },
  });

  return {
    updated,
    appointmentId,
    patientId,
    alreadyPaid: false,
  };
}

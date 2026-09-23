import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Readable } from "node:stream";
import Stripe from "stripe";
import { getServiceTier } from "../_lib/serviceTiers";
import { sendConfirmationEmail } from "../_lib/sendConfirmationEmail";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import {
  ensureCheckoutAppointment,
  recordPaymentEvent,
} from "../_lib/ensureCheckoutAppointment";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    res.status(500).json({ error: "stripe_webhook_not_configured" });
    return;
  }

  const stripe = new Stripe(stripeKey);
  const sig = req.headers["stripe-signature"];

  if (!sig || typeof sig !== "string") {
    res.status(400).json({ error: "missing_stripe_signature" });
    return;
  }

  let event: Stripe.Event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({ event: "stripe_webhook_signature_failed", message }),
    );
    res.status(400).json({ error: "invalid_signature", message });
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        event.id,
      );
    } else if (event.type === "charge.refunded") {
      await handleChargeRefunded(event.data.object as Stripe.Charge, event.id);
    } else if (
      event.type === "payment_intent.payment_failed" ||
      event.type === "charge.failed"
    ) {
      await handlePaymentFailed(event, event.id);
    } else {
      console.log(
        JSON.stringify({
          event: "stripe_webhook_ignored",
          type: event.type,
          id: event.id,
        }),
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({ event: "stripe_webhook_handler_error", message }),
    );
    res.status(500).json({ error: "webhook_handler_failed", message });
    return;
  }

  res.status(200).json({ received: true });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripeEventId: string,
) {
  let appointmentId = session.metadata?.appointment_id || "";
  let patientId = session.metadata?.patient_id || "";
  const serviceTierId = session.metadata?.service_tier_id || "";
  const patientEmail =
    session.metadata?.patient_email ||
    session.customer_details?.email ||
    session.customer_email ||
    "";
  const patientName =
    session.metadata?.patient_name ||
    session.customer_details?.name ||
    "";
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  const tier = serviceTierId ? getServiceTier(serviceTierId) : undefined;
  const paidAt = new Date().toISOString();
  const amountCents = session.amount_total ?? tier?.amountCents ?? null;

  try {
    const supabase = getSupabaseAdmin();
    let updated = false;

    // If checkout ran before migrations (or without an appointment), create one now.
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
            event: "webhook_ensure_appointment_failed",
            sessionId: session.id,
            message,
          }),
        );
      }
    }

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
            event: "appointment_paid_update_failed",
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
            event: "appointment_paid_update_by_session_failed",
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

    const ledger = await recordPaymentEvent({
      supabase,
      stripeEventId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      appointmentId: appointmentId || null,
      patientId: patientId || null,
      eventType: "checkout.session.completed",
      amountCents,
      currency: session.currency || tier?.currency || "usd",
      status: "paid",
      payload: {
        metadata: session.metadata || {},
        customer_email: patientEmail || null,
      },
    });
    if (!ledger.ok) {
      console.error(
        JSON.stringify({
          event: "payment_event_write_failed",
          sessionId: session.id,
          message: ledger.message,
        }),
      );
    }

    if (!updated) {
      console.log(
        JSON.stringify({
          event: "appointment_paid_row_missing",
          appointmentId: appointmentId || null,
          sessionId: session.id,
          note: "No appointment row matched; payment recorded in Stripe (+ ledger if available)",
        }),
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({
        event: "appointment_paid_update_error",
        sessionId: session.id,
        message,
      }),
    );
  }

  if (patientEmail) {
    await sendConfirmationEmail({
      to: patientEmail,
      patientName,
      appointmentId: appointmentId || null,
      sessionId: session.id,
      amountCents,
      serviceTierName: tier?.name ?? null,
    });
  } else {
    console.log(
      JSON.stringify({
        event: "checkout_confirmation_email_no_recipient",
        sessionId: session.id,
      }),
    );
  }
}

async function handleChargeRefunded(charge: Stripe.Charge, stripeEventId: string) {
  const supabase = getSupabaseAdmin();
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id || null;

  let appointmentId: string | null = null;
  let patientId: string | null = null;

  if (paymentIntentId) {
    const { data } = await supabase
      .from("appointments")
      .select("id, patient_id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();
    if (data) {
      appointmentId = String(data.id);
      patientId = data.patient_id ? String(data.patient_id) : null;
      await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);
    }
  }

  await recordPaymentEvent({
    supabase,
    stripeEventId,
    stripePaymentIntentId: paymentIntentId,
    appointmentId,
    patientId,
    eventType: "charge.refunded",
    amountCents: charge.amount_refunded ?? charge.amount ?? null,
    currency: charge.currency || "usd",
    status: "refunded",
    payload: { charge_id: charge.id },
  });
}

async function handlePaymentFailed(event: Stripe.Event, stripeEventId: string) {
  const supabase = getSupabaseAdmin();
  const obj = event.data.object as {
    id?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, string>;
  };
  const paymentIntentId =
    event.type === "payment_intent.payment_failed" ? obj.id || null : null;

  let appointmentId = obj.metadata?.appointment_id || null;
  let patientId = obj.metadata?.patient_id || null;

  if (paymentIntentId && !appointmentId) {
    const { data } = await supabase
      .from("appointments")
      .select("id, patient_id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();
    if (data) {
      appointmentId = String(data.id);
      patientId = data.patient_id ? String(data.patient_id) : null;
    }
  }

  await recordPaymentEvent({
    supabase,
    stripeEventId,
    stripePaymentIntentId: paymentIntentId,
    appointmentId,
    patientId,
    eventType: event.type,
    amountCents: obj.amount ?? null,
    currency: obj.currency || "usd",
    status: "failed",
    payload: { object_id: obj.id || null },
  });
}

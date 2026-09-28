import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Readable } from "node:stream";
import Stripe from "stripe";
import { getServiceTier } from "../_lib/serviceTiers";
import { sendConfirmationEmail } from "../_lib/sendConfirmationEmail";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import { recordPaymentEvent } from "../_lib/ensureCheckoutAppointment";
import {
  checkoutSessionEligibleToMarkPaid,
  markAppointmentPaidFromSession,
} from "../_lib/markCheckoutPaid";
import { expandCheckoutSessionPaymentIntent } from "../_lib/expandCheckoutSession";

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
        stripe,
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
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  stripeEventId: string,
) {
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
  const tier = serviceTierId ? getServiceTier(serviceTierId) : undefined;
  const amountCents = session.amount_total ?? tier?.amountCents ?? null;

  let appointmentId = session.metadata?.appointment_id || "";

  // Webhook payloads usually have payment_intent as a string id. Expand so
  // checkoutSessionEligibleToMarkPaid can reject fully refunded intents
  // (race: charge.refunded before checkout.session.completed).
  let sessionForMark: Stripe.Checkout.Session = session;
  try {
    sessionForMark = (await expandCheckoutSessionPaymentIntent(
      stripe,
      session,
    )) as Stripe.Checkout.Session;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({
        event: "checkout_completed_expand_pi_failed",
        sessionId: session.id,
        message,
      }),
    );
  }

  if (!checkoutSessionEligibleToMarkPaid(sessionForMark)) {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    if (appointmentId) {
      await supabase
        .from("appointments")
        .update({ status: "cancelled", updated_at: now })
        .eq("id", appointmentId)
        .eq("status", "awaiting_payment");
    } else {
      await supabase
        .from("appointments")
        .update({ status: "cancelled", updated_at: now })
        .eq("stripe_checkout_session_id", session.id)
        .eq("status", "awaiting_payment");
    }
    console.log(
      JSON.stringify({
        event: "checkout_completed_skipped_refunded",
        sessionId: session.id,
        appointmentId: appointmentId || null,
      }),
    );
    await recordPaymentEvent({
      supabase,
      stripeEventId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        typeof sessionForMark.payment_intent === "string"
          ? sessionForMark.payment_intent
          : sessionForMark.payment_intent?.id || null,
      appointmentId: appointmentId || null,
      patientId: session.metadata?.patient_id || null,
      eventType: "checkout.session.completed_refunded",
      amountCents,
      currency: session.currency || tier?.currency || "usd",
      status: "refunded",
      payload: {
        id: session.id,
        payment_status: session.payment_status,
        status: session.status,
      },
    });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const result = await markAppointmentPaidFromSession({
      supabase,
      session: sessionForMark,
      stripeEventId,
      eventType: "checkout.session.completed",
    });
    appointmentId = result.appointmentId || appointmentId;

    if (!result.updated && !result.alreadyPaid) {
      console.log(
        JSON.stringify({
          event: "appointment_paid_row_missing",
          appointmentId: appointmentId || null,
          sessionId: session.id,
          note: "No appointment row matched; payment recorded in Stripe (+ ledger if available)",
          skippedRefunded: result.skippedRefunded || false,
          skippedNonAwaiting: result.skippedNonAwaiting || false,
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
        .eq("id", appointmentId)
        .in("status", ["awaiting_payment", "paid", "in_progress", "claimed"]);
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

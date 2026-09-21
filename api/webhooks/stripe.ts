import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Readable } from "node:stream";
import Stripe from "stripe";
import { getServiceTier } from "../../shared/serviceTiers";
import { sendConfirmationEmail } from "../_lib/sendConfirmationEmail";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  } else {
    console.log(
      JSON.stringify({
        event: "stripe_webhook_ignored",
        type: event.type,
        id: event.id,
      }),
    );
  }

  res.status(200).json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const appointmentId = session.metadata?.appointment_id || "";
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

  try {
    const supabase = getSupabaseAdmin();
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
        })
        .eq("id", appointmentId)
        .select("id")
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
        })
        .eq("stripe_checkout_session_id", session.id)
        .select("id")
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
      }
    }

    if (!updated) {
      console.log(
        JSON.stringify({
          event: "appointment_paid_row_missing",
          appointmentId: appointmentId || null,
          sessionId: session.id,
          note: "No appointment row matched; payment recorded in Stripe only",
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
      amountCents: session.amount_total ?? tier?.amountCents ?? null,
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

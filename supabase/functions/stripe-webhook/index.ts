// Stripe webhook receiver.
//
// Deploy with:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// (config.toml also sets verify_jwt = false for this function — Stripe cannot
// send a Supabase JWT; authenticity is proven by signature verification below.)
//
// Handles:
//   - checkout.session.completed      → upsert encounter as paid, then send a
//     payment-confirmation email (optional — requires RESEND_API_KEY; skipped
//     gracefully when unset, and email failures never fail the webhook)
//   - customer.subscription.deleted   → mark encounter cancelled

import type Stripe from "npm:stripe@18.5.0";
import { getStripeClient, stripeCryptoProvider } from "../_shared/stripe.ts";
import { getServiceRoleClient } from "../_shared/supabase-admin.ts";
import { emailTemplates, sendEmail } from "../_shared/email.ts";

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session): Promise<void> => {
  const sessionId = session.client_reference_id ?? session.metadata?.session_id;
  if (!sessionId) {
    console.warn("[stripe-webhook] checkout.session.completed without session id; skipping");
    return;
  }

  const supabase = getServiceRoleClient();

  const row: Record<string, unknown> = {
    session_id: sessionId,
    care_state: "paid",
    paid_at: new Date().toISOString(),
    stripe_session_id: session.id,
    stripe_subscription_id:
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null,
  };

  if (session.customer_details?.email) {
    row.email = session.customer_details.email;
  }
  if (session.metadata?.service_line) {
    row.service_line = session.metadata.service_line;
  }

  const { error } = await supabase
    .from("encounters")
    .upsert(row, { onConflict: "session_id" });

  if (error) {
    throw new Error(`Failed to upsert paid encounter: ${error.message}`);
  }

  // Payment confirmation email — best-effort only. The paid upsert has landed;
  // an email failure must never make the webhook 500 (Stripe would retry and
  // re-run the handler).
  const email = session.customer_details?.email;
  if (email) {
    try {
      const template = emailTemplates.paymentConfirmed();
      await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (err) {
      console.error("[stripe-webhook] Payment confirmation email failed:", err);
    }
  }
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription): Promise<void> => {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("encounters")
    .update({ care_state: "cancelled" })
    .eq("stripe_subscription_id", subscription.id)
    .select("id");

  if (error) {
    throw new Error(`Failed to cancel encounter by subscription id: ${error.message}`);
  }

  // Fallback: older sessions may only be traceable via subscription metadata.
  if ((data ?? []).length === 0 && subscription.metadata?.session_id) {
    const { error: fallbackError } = await supabase
      .from("encounters")
      .update({ care_state: "cancelled" })
      .eq("session_id", subscription.metadata.session_id);

    if (fallbackError) {
      throw new Error(`Failed to cancel encounter by session id: ${fallbackError.message}`);
    }
  }
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
      undefined,
      stripeCryptoProvider,
    );
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        // Unhandled event types are acknowledged so Stripe stops retrying them.
        break;
    }
  } catch (err) {
    console.error(`[stripe-webhook] Handler failed for ${event.type}:`, err);
    // 500 so Stripe retries — the DB write must eventually land.
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

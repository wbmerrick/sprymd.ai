// Creates a subscription-mode Stripe Checkout Session for a quiz session.
// Expects POST { sessionId, serviceLine, email } and returns { url }.

import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getStripeClient } from "../_shared/stripe.ts";

type ServiceLine = "ed" | "weight";

const PRICE_ENV_VARS: Record<ServiceLine, string> = {
  ed: "STRIPE_PRICE_ED",
  weight: "STRIPE_PRICE_WEIGHT",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: { sessionId?: string; serviceLine?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { sessionId, serviceLine, email } = body;

  if (!sessionId || typeof sessionId !== "string") {
    return jsonResponse({ error: "sessionId is required" }, 400);
  }
  if (serviceLine !== "ed" && serviceLine !== "weight") {
    return jsonResponse({ error: "serviceLine must be 'ed' or 'weight'" }, 400);
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return jsonResponse({ error: "A valid email is required" }, 400);
  }

  const priceEnvVar = PRICE_ENV_VARS[serviceLine];
  const priceId = Deno.env.get(priceEnvVar);
  if (!priceId) {
    return jsonResponse(
      { error: `${priceEnvVar} is not configured in function secrets` },
      500,
    );
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "https://sprymd.ai";

  try {
    const stripe = getStripeClient();
    const metadata = { session_id: sessionId, service_line: serviceLine };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: sessionId,
      metadata,
      subscription_data: { metadata },
      success_url: `${siteUrl}/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    });

    return jsonResponse({ url: session.url });
  } catch (err) {
    console.error("[create-checkout-session] Stripe error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return jsonResponse({ error: message }, 500);
  }
});

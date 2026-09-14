import Stripe from "npm:stripe@18.5.0";

export const getStripeClient = (): Stripe => {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set in function secrets");
  }

  return new Stripe(secretKey, {
    // Deno has no Node http stack — use the fetch-based client.
    httpClient: Stripe.createFetchHttpClient(),
  });
};

// SubtleCrypto-based provider so webhook signature verification works in Deno.
export const stripeCryptoProvider = Stripe.createSubtleCryptoProvider();

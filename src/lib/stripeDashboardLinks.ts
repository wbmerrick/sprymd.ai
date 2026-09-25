/**
 * Stripe Dashboard deep links for clinician ops (refund / payment lookup).
 * Prefers PaymentIntent pages (Refund button lives there). Falls back to
 * Dashboard search on the Checkout Session id when PI is missing.
 */

export type StripeDashboardIds = {
  paymentIntentId?: string | null;
  checkoutSessionId?: string | null;
};

export function stripeIsTestModeId(id: string): boolean {
  return /_(test)_/.test(id) || id.includes("_test_");
}

export function stripeDashboardBase(ids: StripeDashboardIds): string {
  const sample = String(ids.paymentIntentId || ids.checkoutSessionId || "");
  const test = sample ? stripeIsTestModeId(sample) : false;
  return test
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com";
}

/** Direct payment page — primary refund surface. */
export function stripePaymentIntentUrl(
  paymentIntentId: string,
  opts?: { testMode?: boolean },
): string {
  const id = paymentIntentId.trim();
  const test =
    opts?.testMode ?? (id ? stripeIsTestModeId(id) : false);
  const base = test
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com";
  return `${base}/payments/${encodeURIComponent(id)}`;
}

/** Search fallback when we only have a Checkout Session id. */
export function stripeCheckoutSessionSearchUrl(
  checkoutSessionId: string,
  opts?: { testMode?: boolean },
): string {
  const id = checkoutSessionId.trim();
  const test =
    opts?.testMode ?? (id ? stripeIsTestModeId(id) : false);
  const base = test
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com";
  return `${base}/search?query=${encodeURIComponent(id)}`;
}

/**
 * Best available link to complete a full refund in Stripe Dashboard.
 * Returns null when no Stripe ids are on the appointment.
 */
export function stripeRefundDeepLink(
  ids: StripeDashboardIds,
): { href: string; kind: "payment_intent" | "checkout_search" } | null {
  const pi = String(ids.paymentIntentId || "").trim();
  if (pi) {
    return { href: stripePaymentIntentUrl(pi), kind: "payment_intent" };
  }
  const cs = String(ids.checkoutSessionId || "").trim();
  if (cs) {
    return {
      href: stripeCheckoutSessionSearchUrl(cs),
      kind: "checkout_search",
    };
  }
  return null;
}

export function openStripeRefundDeepLink(ids: StripeDashboardIds): boolean {
  const link = stripeRefundDeepLink(ids);
  if (!link || typeof window === "undefined") return false;
  window.open(link.href, "_blank", "noopener,noreferrer");
  return true;
}

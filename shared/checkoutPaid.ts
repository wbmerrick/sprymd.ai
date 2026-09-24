/** Pure helper — shared by API reconcile paths and unit tests. */
export function checkoutSessionLooksPaid(session: {
  payment_status?: string | null;
  status?: string | null;
}): boolean {
  return (
    session.payment_status === "paid" ||
    session.status === "complete" ||
    session.payment_status === "no_payment_required"
  );
}

/**
 * Only awaiting_payment rows may be promoted to paid via reconcile.
 * Prevents refunded/cancelled/completed visits from being revived when
 * Stripe Checkout still reports payment_status=paid.
 */
export function appointmentEligibleForPaidReconcile(
  status: string | null | undefined,
): boolean {
  return status === "awaiting_payment";
}

/**
 * Stripe leaves Checkout Session payment_status=paid after refunds.
 * When PaymentIntent is expanded, reject fully-refunded / canceled intents.
 * String ids are treated as unknown here — callers (webhook/reconcile) must
 * expand before relying on this for refund safety.
 */
export function paymentIntentStillCollectible(paymentIntent: {
  status?: string | null;
  amount_received?: number | null;
  amount_refunded?: number | null;
} | string | null | undefined): boolean {
  if (!paymentIntent || typeof paymentIntent === "string") {
    return true;
  }
  if (paymentIntent.status === "canceled") return false;
  const received = Number(paymentIntent.amount_received || 0);
  const refunded = Number(paymentIntent.amount_refunded || 0);
  if (refunded > 0 && received > 0 && refunded >= received) return false;
  return true;
}

/** Session looks paid AND any expanded PaymentIntent is not fully refunded. */
export function checkoutSessionEligibleToMarkPaid(session: {
  payment_status?: string | null;
  status?: string | null;
  payment_intent?:
    | string
    | {
        status?: string | null;
        amount_received?: number | null;
        amount_refunded?: number | null;
      }
    | null;
}): boolean {
  if (!checkoutSessionLooksPaid(session)) return false;
  return paymentIntentStillCollectible(session.payment_intent);
}

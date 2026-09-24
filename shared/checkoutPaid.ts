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

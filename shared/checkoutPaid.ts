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

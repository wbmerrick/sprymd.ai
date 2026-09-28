/**
 * Expand Checkout Session.payment_intent when the webhook payload only
 * includes a string id — required so refund checks can see amount_refunded.
 */
export async function expandCheckoutSessionPaymentIntent(
  stripe: {
    paymentIntents: {
      retrieve: (id: string) => Promise<{
        id: string;
        status?: string | null;
        amount_received?: number | null;
        amount_refunded?: number | null;
      }>;
    };
    checkout: {
      sessions: {
        retrieve: (
          id: string,
          opts: { expand: string[] },
        ) => Promise<{
          id: string;
          payment_intent?: unknown;
          payment_status?: string | null;
          status?: string | null;
          [key: string]: unknown;
        }>;
      };
    };
  },
  session: {
    id: string;
    payment_intent?:
      | string
      | {
          id?: string;
          status?: string | null;
          amount_received?: number | null;
          amount_refunded?: number | null;
        }
      | null;
    [key: string]: unknown;
  },
): Promise<typeof session> {
  if (typeof session.payment_intent === "string" && session.payment_intent) {
    const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
    return { ...session, payment_intent: pi };
  }
  if (!session.payment_intent) {
    return (await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["payment_intent"],
    })) as typeof session;
  }
  return session;
}

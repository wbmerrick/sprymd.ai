import { describe, expect, it, vi } from "vitest";
import { expandCheckoutSessionPaymentIntent } from "../../api/_lib/expandCheckoutSession";
import { checkoutSessionEligibleToMarkPaid } from "@shared/checkoutPaid";

describe("expandCheckoutSessionPaymentIntent", () => {
  it("retrieves PaymentIntent when webhook only has a string id", async () => {
    const retrieve = vi.fn().mockResolvedValue({
      id: "pi_1",
      status: "succeeded",
      amount_received: 9900,
      amount_refunded: 9900,
    });
    const stripe = {
      paymentIntents: { retrieve },
      checkout: { sessions: { retrieve: vi.fn() } },
    };
    const expanded = await expandCheckoutSessionPaymentIntent(stripe, {
      id: "cs_1",
      payment_status: "paid",
      status: "complete",
      payment_intent: "pi_1",
    });
    expect(retrieve).toHaveBeenCalledWith("pi_1");
    expect(
      checkoutSessionEligibleToMarkPaid(
        expanded as {
          payment_status: string;
          status: string;
          payment_intent: {
            status: string;
            amount_received: number;
            amount_refunded: number;
          };
        },
      ),
    ).toBe(false);
  });

  it("leaves already-expanded PaymentIntents alone", async () => {
    const retrieve = vi.fn();
    const stripe = {
      paymentIntents: { retrieve },
      checkout: { sessions: { retrieve: vi.fn() } },
    };
    const session = {
      id: "cs_1",
      payment_status: "paid",
      status: "complete",
      payment_intent: {
        id: "pi_1",
        status: "succeeded",
        amount_received: 9900,
        amount_refunded: 0,
      },
    };
    const expanded = await expandCheckoutSessionPaymentIntent(stripe, session);
    expect(retrieve).not.toHaveBeenCalled();
    expect(expanded).toBe(session);
    expect(checkoutSessionEligibleToMarkPaid(session)).toBe(true);
  });
});

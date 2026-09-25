import { describe, expect, it } from "vitest";
import {
  stripeCheckoutSessionSearchUrl,
  stripeIsTestModeId,
  stripePaymentIntentUrl,
  stripeRefundDeepLink,
} from "./stripeDashboardLinks";

describe("stripeDashboardLinks", () => {
  it("detects test vs live from Stripe ids", () => {
    expect(stripeIsTestModeId("pi_test_abc")).toBe(true);
    expect(stripeIsTestModeId("cs_test_xyz")).toBe(true);
    expect(stripeIsTestModeId("pi_live_abc")).toBe(false);
    expect(stripeIsTestModeId("cs_live_xyz")).toBe(false);
  });

  it("builds live PaymentIntent refund URLs", () => {
    expect(stripePaymentIntentUrl("pi_live_123")).toBe(
      "https://dashboard.stripe.com/payments/pi_live_123",
    );
  });

  it("builds test PaymentIntent refund URLs", () => {
    expect(stripePaymentIntentUrl("pi_test_123")).toBe(
      "https://dashboard.stripe.com/test/payments/pi_test_123",
    );
  });

  it("prefers PaymentIntent over Checkout Session for refund deep link", () => {
    const link = stripeRefundDeepLink({
      paymentIntentId: "pi_live_pay",
      checkoutSessionId: "cs_live_sess",
    });
    expect(link).toEqual({
      href: "https://dashboard.stripe.com/payments/pi_live_pay",
      kind: "payment_intent",
    });
  });

  it("falls back to Dashboard search on Checkout Session id", () => {
    const link = stripeRefundDeepLink({
      paymentIntentId: null,
      checkoutSessionId: "cs_live_sess",
    });
    expect(link?.kind).toBe("checkout_search");
    expect(link?.href).toBe(
      stripeCheckoutSessionSearchUrl("cs_live_sess"),
    );
    expect(link?.href).toContain("cs_live_sess");
  });

  it("returns null when no Stripe ids exist", () => {
    expect(stripeRefundDeepLink({})).toBeNull();
    expect(
      stripeRefundDeepLink({ paymentIntentId: "  ", checkoutSessionId: "" }),
    ).toBeNull();
  });
});

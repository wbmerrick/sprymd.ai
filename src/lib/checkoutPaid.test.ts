import { describe, expect, it } from "vitest";
import {
  appointmentEligibleForPaidReconcile,
  checkoutSessionEligibleToMarkPaid,
  checkoutSessionLooksPaid,
  paymentIntentStillCollectible,
} from "@shared/checkoutPaid";

describe("checkoutSessionLooksPaid", () => {
  it("treats paid / complete sessions as paid", () => {
    expect(
      checkoutSessionLooksPaid({ payment_status: "paid", status: "complete" }),
    ).toBe(true);
    expect(
      checkoutSessionLooksPaid({ payment_status: "unpaid", status: "complete" }),
    ).toBe(true);
    expect(
      checkoutSessionLooksPaid({
        payment_status: "no_payment_required",
        status: "open",
      }),
    ).toBe(true);
  });

  it("rejects open unpaid sessions", () => {
    expect(
      checkoutSessionLooksPaid({ payment_status: "unpaid", status: "open" }),
    ).toBe(false);
  });
});

describe("appointmentEligibleForPaidReconcile", () => {
  it("only allows awaiting_payment", () => {
    expect(appointmentEligibleForPaidReconcile("awaiting_payment")).toBe(true);
    expect(appointmentEligibleForPaidReconcile("paid")).toBe(false);
    expect(appointmentEligibleForPaidReconcile("cancelled")).toBe(false);
    expect(appointmentEligibleForPaidReconcile("completed")).toBe(false);
    expect(appointmentEligibleForPaidReconcile(null)).toBe(false);
  });
});

describe("paymentIntentStillCollectible / checkoutSessionEligibleToMarkPaid", () => {
  it("allows unexpanded payment_intent ids (webhook path)", () => {
    expect(paymentIntentStillCollectible("pi_abc")).toBe(true);
    expect(
      checkoutSessionEligibleToMarkPaid({
        payment_status: "paid",
        status: "complete",
        payment_intent: "pi_abc",
      }),
    ).toBe(true);
  });

  it("rejects fully refunded expanded PaymentIntents", () => {
    expect(
      paymentIntentStillCollectible({
        status: "succeeded",
        amount_received: 7500,
        amount_refunded: 7500,
      }),
    ).toBe(false);
    expect(
      checkoutSessionEligibleToMarkPaid({
        payment_status: "paid",
        status: "complete",
        payment_intent: {
          status: "succeeded",
          amount_received: 7500,
          amount_refunded: 7500,
        },
      }),
    ).toBe(false);
  });

  it("rejects canceled PaymentIntents", () => {
    expect(
      paymentIntentStillCollectible({
        status: "canceled",
        amount_received: 0,
        amount_refunded: 0,
      }),
    ).toBe(false);
  });

  it("allows succeeded intents with no refund", () => {
    expect(
      checkoutSessionEligibleToMarkPaid({
        payment_status: "paid",
        status: "complete",
        payment_intent: {
          status: "succeeded",
          amount_received: 7500,
          amount_refunded: 0,
        },
      }),
    ).toBe(true);
  });
});

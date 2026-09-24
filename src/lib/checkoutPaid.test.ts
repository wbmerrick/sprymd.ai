import { describe, expect, it } from "vitest";
import {
  appointmentEligibleForPaidReconcile,
  checkoutSessionLooksPaid,
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

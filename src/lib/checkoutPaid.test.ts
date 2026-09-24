import { describe, expect, it } from "vitest";
import { checkoutSessionLooksPaid } from "@shared/checkoutPaid";

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

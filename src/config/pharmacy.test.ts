import { describe, expect, it } from "vitest";
import { pharmacyFulfillmentCopy, pharmacyShortCopy } from "./pharmacy";

describe("pharmacy copy (neutral)", () => {
  it("does not steer to a named partner pharmacy", () => {
    expect(pharmacyFulfillmentCopy()).not.toMatch(/our pharmacy partner/i);
    expect(pharmacyFulfillmentCopy()).toMatch(/pharmacy you chose/i);
    expect(pharmacyFulfillmentCopy()).toMatch(/does not sell or set the price/i);
    expect(pharmacyShortCopy()).toMatch(/chosen pharmacy/i);
    expect(pharmacyShortCopy()).not.toMatch(/Empower/i);
  });
});

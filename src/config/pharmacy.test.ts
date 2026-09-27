import { describe, expect, it } from "vitest";
import { pharmacyFulfillmentCopy, pharmacyShortCopy, PHARMACY_NAME } from "./pharmacy";

describe("pharmacyFulfillmentCopy", () => {
  it("falls back to generic wording while PHARMACY_NAME is a placeholder", () => {
    expect(PHARMACY_NAME.startsWith("[")).toBe(true);
    expect(pharmacyFulfillmentCopy()).toMatch(/our pharmacy partner/i);
    expect(pharmacyFulfillmentCopy()).toMatch(/discreetly packaged/i);
    expect(pharmacyShortCopy()).toMatch(/our pharmacy partner/i);
  });
});

import { describe, expect, it } from "vitest";
import {
  SERVICE_TIERS,
  SERVICE_TIERS_BY_ID,
  formatTierPrice,
  getServiceTier,
} from "../../shared/serviceTiers";

describe("service tier catalog", () => {
  it("exposes the three cash-pay tiers with expected ids", () => {
    expect(SERVICE_TIERS.map((t) => t.id)).toEqual([
      "visit_basic",
      "visit_comprehensive",
      "protocol_start",
    ]);
  });

  it("stores prices in cents", () => {
    expect(SERVICE_TIERS_BY_ID.visit_basic.amountCents).toBe(7500);
    expect(SERVICE_TIERS_BY_ID.visit_comprehensive.amountCents).toBe(14900);
    expect(SERVICE_TIERS_BY_ID.protocol_start.amountCents).toBe(9900);
  });

  it("looks up tiers by id and formats currency", () => {
    const basic = getServiceTier("visit_basic");
    expect(basic?.name).toBe("Clinician Visit");
    expect(formatTierPrice(basic!)).toBe("$75.00");
    expect(getServiceTier("not_a_tier")).toBeUndefined();
  });

  it("uses usd for every tier", () => {
    for (const tier of SERVICE_TIERS) {
      expect(tier.currency).toBe("usd");
      expect(tier.amountCents).toBeGreaterThan(0);
      expect(Number.isInteger(tier.amountCents)).toBe(true);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  SERVICE_TIERS_BY_ID,
  getServiceTier,
  formatTierPrice,
} from "../../shared/serviceTiers";
import { fees } from "../../shared/program";

describe("Stripe evaluation product", () => {
  it("single $100 evaluation product (legacy ids alias)", () => {
    expect(fees.evaluation).toBe(10000);
    expect(SERVICE_TIERS_BY_ID.evaluation.amountCents).toBe(10000);
    expect(SERVICE_TIERS_BY_ID.visit_basic.amountCents).toBe(10000);
    expect(SERVICE_TIERS_BY_ID.protocol_start.amountCents).toBe(10000);
    expect(SERVICE_TIERS_BY_ID.evaluation.name).toMatch(/Physician GLP-1 Evaluation/i);
  });

  it("formats evaluation price", () => {
    const tier = getServiceTier("evaluation");
    expect(tier).toBeDefined();
    expect(formatTierPrice(tier!)).toBe("$100.00");
  });
});

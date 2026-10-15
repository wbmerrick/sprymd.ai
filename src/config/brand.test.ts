import { describe, expect, it, vi } from "vitest";
import { getSiteBrand, isConditionAllowed, resolveSiteBrandId } from "../../shared/siteBrand";

describe("site brand profiles", () => {
  it("defaults to sprymd", () => {
    expect(resolveSiteBrandId(undefined)).toBe("sprymd");
    expect(resolveSiteBrandId("")).toBe("sprymd");
    expect(getSiteBrand("sprymd").name).toBe("SpryMD");
  });

  it("resolves glptn as a weight-loss-only brand", () => {
    const brand = getSiteBrand("glptn");
    expect(brand.name).toBe("GLPTN");
    expect(brand.siteUrl).toBe("https://www.glptn.com");
    expect(brand.allowedConditions).toEqual(["weightloss"]);
    expect(brand.primaryConditionId).toBe("weightloss");
    expect(brand.showPcpSection).toBe(false);
    expect(brand.showAudienceFilter).toBe(false);
    expect(isConditionAllowed("weightloss", brand)).toBe(true);
    expect(isConditionAllowed("ed", brand)).toBe(false);
    expect(isConditionAllowed("pcp", brand)).toBe(false);
  });

  it("allows all conditions on sprymd", () => {
    const brand = getSiteBrand("sprymd");
    expect(isConditionAllowed("ed", brand)).toBe(true);
    expect(isConditionAllowed("weightloss", brand)).toBe(true);
  });
});

describe("getGridServices brand filter", () => {
  it("shows only weight loss when brand allows weightloss only", async () => {
    vi.resetModules();
    vi.doMock("./brand", () => ({
      SITE_BRAND: getSiteBrand("glptn"),
      SITE_BRAND_ID: "glptn",
      brandAllowsCondition: (id: string) => id === "weightloss",
    }));
    const { getGridServices, getFooterCarePlanLabels } = await import("./services");
    const grid = getGridServices("all");
    expect(grid.map((s) => s.conditionId)).toEqual(["weightloss"]);
    expect(getFooterCarePlanLabels()).toEqual(["Weight Loss"]);
    vi.doUnmock("./brand");
    vi.resetModules();
  });
});

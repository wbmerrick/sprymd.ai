import { describe, expect, it } from "vitest";
import {
  CARE_SERVICES,
  audienceBadgeLabel,
  getFooterCarePlanLabels,
  getGridServices,
} from "./services";
import { conditions } from "@/data/careCatalog";

describe("CARE_SERVICES shared config", () => {
  it("keeps grid and footer labels aligned with catalog conditions", () => {
    for (const service of CARE_SERVICES) {
      expect(conditions[service.conditionId], service.conditionId).toBeTruthy();
    }
  });

  it("includes Low Testosterone, Anxiety & Depression, and Women's Health in the intake grid", () => {
    const ids = getGridServices().map((s) => s.conditionId);
    expect(ids).toContain("lowt");
    expect(ids).toContain("mentalhealth");
    expect(ids).toContain("womenshealth");
    expect(ids).not.toContain("pcp");
  });

  it("lists the same care plans in the footer that the homepage promotes", () => {
    const labels = getFooterCarePlanLabels();
    expect(labels).toContain("Low Testosterone");
    expect(labels).toContain("Anxiety & Depression");
    expect(labels).toContain("Women's Health");
    expect(labels).toContain("Primary Care");
  });

  it("filters audience chips correctly", () => {
    const men = getGridServices("men").map((s) => s.conditionId);
    const women = getGridServices("women").map((s) => s.conditionId);
    expect(men).toContain("ed");
    expect(men).toContain("lowt");
    expect(men).toContain("weightloss");
    expect(men).not.toContain("womenshealth");
    expect(women).toContain("womenshealth");
    expect(women).toContain("weightloss");
    expect(women).not.toContain("ed");
  });

  it("labels audiences for cards", () => {
    expect(audienceBadgeLabel("all")).toBe("For men & women");
    expect(audienceBadgeLabel("men")).toBe("For men");
    expect(audienceBadgeLabel("women")).toBe("For women");
  });
});

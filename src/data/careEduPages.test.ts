import { describe, expect, it } from "vitest";
import { careEduPages, conditionToEduSlug } from "./careEduPages";
import { conditions } from "./careCatalog";

describe("careEduPages", () => {
  it("maps every homepage care option to an educational page", () => {
    const homepageIds = Object.keys(conditions).filter(
      (id) => !["pcp", "lowt", "mentalhealth"].includes(id),
    );
    for (const id of homepageIds) {
      const slug = conditionToEduSlug[id as keyof typeof conditionToEduSlug];
      expect(slug, `${id} should have an edu slug`).toBeTruthy();
      expect(careEduPages[slug!], `${slug} page missing`).toBeTruthy();
      expect(careEduPages[slug!].conditionId).toBe(id);
      expect(careEduPages[slug!].ctaTarget).toBe("intake");
    }
  });

  it("includes Wingman ED copy essentials", () => {
    const ed = careEduPages.ed;
    expect(ed.eyebrow).toMatch(/Wingman/i);
    expect(ed.title).toMatch(/On-Demand ED/i);
    expect(ed.highlights?.some((h) => /80 mg Sildenafil/i.test(h))).toBe(true);
    const table = ed.sections.flatMap((s) => s.blocks).find((b) => b.type === "table");
    expect(table?.type).toBe("table");
    const faq = ed.sections.flatMap((s) => s.blocks).find((b) => b.type === "faq");
    expect(faq?.type).toBe("faq");
    if (faq?.type === "faq") expect(faq.items.length).toBeGreaterThanOrEqual(3);
  });

  it("does not claim patients pay nothing unless approved", () => {
    const blob = JSON.stringify(careEduPages);
    expect(blob).not.toMatch(/pay nothing unless approved/i);
    expect(blob).toMatch(/visit fee/i);
    expect(blob).toMatch(/never auto-charged at checkout/i);
  });
});

import { describe, expect, it } from "vitest";
import { careEduPages, conditionToEduSlug } from "./careEduPages";
import { getGridServices } from "@/config/services";
import { footerPages } from "@/footerPages";

describe("careEduPages", () => {
  it("maps every homepage grid service to an educational or footer care page", () => {
    for (const { conditionId } of getGridServices()) {
      const slug = conditionToEduSlug[conditionId];
      expect(slug, `${conditionId} should have a care page slug`).toBeTruthy();
      const page = careEduPages[slug!] || (footerPages as Record<string, { conditionId?: string; ctaTarget?: string }>)[slug!];
      expect(page, `${slug} page missing`).toBeTruthy();
      // careEduPages carry conditionId + intake CTA; footer protocol pages may not.
      if (careEduPages[slug!]) {
        expect(careEduPages[slug!].conditionId).toBe(conditionId);
        expect(careEduPages[slug!].ctaTarget).toBe("intake");
      }
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

  it("includes a Women's Health placeholder care page", () => {
    expect(careEduPages["womens-health"]?.conditionId).toBe("womenshealth");
    expect(conditionToEduSlug.womenshealth).toBe("womens-health");
  });
});

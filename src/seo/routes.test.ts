import { describe, expect, it } from "vitest";
import { DISALLOWED_PATHS, metaForPath, NOT_FOUND_META, ROUTE_META, SITEMAP_ROUTES } from "./routes";

describe("route metadata", () => {
  it("resolves exact, prefixed and unknown paths", () => {
    expect(metaForPath("/about").pageTitle).toMatch(/About SpryMD/);
    expect(metaForPath("/about/").path).toBe("/about");
    expect(metaForPath("/dashboard/goals/abc").path).toBe("/dashboard");
    expect(metaForPath("/visit/upcoming").indexable).toBe(false);
    expect(metaForPath("/definitely-not-a-page")).toBe(NOT_FOUND_META);
    expect(metaForPath("/care/not-real")).toBe(NOT_FOUND_META);
    expect(metaForPath("/care/ed").indexable).toBe(true);
  });

  it("gives every public page a unique title and description", () => {
    const titles = SITEMAP_ROUTES.map((r) => r.title ?? r.pageTitle);
    const descriptions = SITEMAP_ROUTES.map((r) => r.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const route of SITEMAP_ROUTES) {
      expect(route.description.length).toBeGreaterThan(50);
      expect(route.description.length).toBeLessThanOrEqual(160);
    }
  });

  it("keeps account and checkout surfaces out of the sitemap and robots allowlist", () => {
    const sitemapPaths = SITEMAP_ROUTES.map((r) => r.path);
    expect(sitemapPaths).toEqual([
      "/",
      "/about",
      "/faq",
      "/contact",
      "/terms",
      "/privacy",
      "/npp",
      "/care/ed",
      "/care/weight-loss",
      "/care/hair-loss",
      "/care/skin",
      "/care/sermorelin",
      "/care/nad-therapy",
    ]);
    for (const path of ["/dashboard", "/checkout", "/intake", "/provider", "/visit", "/oauth", "/ops"]) {
      expect(DISALLOWED_PATHS).toContain(path);
      expect(sitemapPaths).not.toContain(path);
    }
    expect(ROUTE_META.filter((r) => r.prefix).every((r) => !r.indexable)).toBe(true);
  });
});

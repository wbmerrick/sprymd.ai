import { beforeEach, describe, expect, it } from "vitest";
import { applyHead, canonicalUrl, DEFAULT_TITLE, faqJsonLd, formatTitle, SITE_URL } from "./seo";

const meta = (selector: string) => document.head.querySelector<HTMLMetaElement>(selector)?.getAttribute("content") ?? null;

describe("seo helpers", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
  });

  it("formats page titles with the site suffix and falls back to the default", () => {
    expect(formatTitle("About")).toBe("About | SpryMD");
    expect(formatTitle(undefined, "Custom")).toBe("Custom");
    expect(formatTitle()).toBe(DEFAULT_TITLE);
  });

  it("builds canonical URLs on the www host without hashes, queries or trailing slashes", () => {
    expect(canonicalUrl("/")).toBe(`${SITE_URL}/`);
    expect(canonicalUrl("/about/")).toBe(`${SITE_URL}/about`);
    expect(canonicalUrl("/faq?utm=x#q1")).toBe(`${SITE_URL}/faq`);
  });

  it("writes title, description, canonical and social tags", () => {
    applyHead({ pageTitle: "Contact SpryMD", description: "Reach the care team.", path: "/contact" });

    expect(document.title).toBe("Contact SpryMD | SpryMD");
    expect(meta('meta[name="description"]')).toBe("Reach the care team.");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(`${SITE_URL}/contact`);
    expect(meta('meta[property="og:url"]')).toBe(`${SITE_URL}/contact`);
    expect(meta('meta[property="og:title"]')).toBe("Contact SpryMD | SpryMD");
    expect(meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(meta('meta[name="robots"]')).toBeNull();
  });

  it("toggles the robots noindex directive and updates tags in place", () => {
    applyHead({ pageTitle: "Checkout", path: "/checkout", noindex: true });
    expect(meta('meta[name="robots"]')).toBe("noindex, nofollow");
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);

    applyHead({ pageTitle: "About", path: "/about" });
    expect(meta('meta[name="robots"]')).toBeNull();
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(meta('meta[property="og:title"]')).toBe("About | SpryMD");
  });

  it("replaces and clears page-level JSON-LD", () => {
    const faq = faqJsonLd([{ question: "Is this real care?", answer: "Yes." }]);
    applyHead({ path: "/faq", jsonLd: faq });
    const script = document.getElementById("seo-page-jsonld");
    expect(script?.getAttribute("type")).toBe("application/ld+json");
    expect(JSON.parse(script?.textContent ?? "{}")).toMatchObject({ "@type": "FAQPage" });
    expect(JSON.parse(script?.textContent ?? "{}").mainEntity[0].acceptedAnswer.text).toBe("Yes.");

    applyHead({ path: "/about" });
    expect(document.getElementById("seo-page-jsonld")).toBeNull();
  });
});

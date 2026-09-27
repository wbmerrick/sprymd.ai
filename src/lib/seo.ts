/**
 * Lightweight document <head> management for a client-rendered SPA.
 *
 * `index.html` ships the homepage defaults so crawlers and link previews that
 * do not execute JavaScript still get sensible tags; `applyHead` keeps the same
 * tags in sync as the router (or SpryApp's internal views) change.
 */

import { COMPANY, companyTelHref, isConfigured } from "@/config/company";

export const SITE_URL = "https://www.sprymd.ai";
export const SITE_NAME = "SpryMD";
export const DEFAULT_TITLE = "SpryMD — Telehealth for Tennessee. Feel better. Stay strong.";
export const DEFAULT_DESCRIPTION =
  "Licensed Tennessee doctors online for weight loss, ED, low T, sleep, mood, and primary care. Private visits, clear plans, medicine shipped to your door.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/sprymd-og-share.jpg`;
export const DEFAULT_OG_IMAGE_ALT = "SpryMD — sunlit alpine peaks reflected in a dark teal lake";

export type JsonLd = Record<string, unknown>;

export interface HeadMeta {
  /** Full document title. Use `pageTitle` to get the "<page> | SpryMD" form instead. */
  title?: string;
  pageTitle?: string;
  description?: string;
  /** Route path (e.g. "/about"). Used for the canonical URL and og:url. */
  path?: string;
  /** Adds `<meta name="robots" content="noindex, nofollow">`. */
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  /** Page-level structured data. Replaced on every call; omit to clear it. */
  jsonLd?: JsonLd | JsonLd[] | null;
}

const PAGE_JSON_LD_ID = "seo-page-jsonld";

export function formatTitle(pageTitle?: string, title?: string): string {
  if (title) return title;
  if (pageTitle) return `${pageTitle} | ${SITE_NAME}`;
  return DEFAULT_TITLE;
}

export function canonicalUrl(path = "/"): string {
  const clean = path.split("#")[0].split("?")[0] || "/";
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  // Keep the homepage as "/" and strip trailing slashes elsewhere.
  const normalized = withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
  return `${SITE_URL}${normalized}`;
}

function upsertMeta(attr: "name" | "property", key: string, content: string | null): void {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (content === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setPageJsonLd(data: HeadMeta["jsonLd"]): void {
  const existing = document.getElementById(PAGE_JSON_LD_ID);
  if (!data || (Array.isArray(data) && data.length === 0)) {
    existing?.remove();
    return;
  }
  const script = existing ?? document.createElement("script");
  script.id = PAGE_JSON_LD_ID;
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
}

export function applyHead(meta: HeadMeta = {}): void {
  if (typeof document === "undefined") return;

  const title = formatTitle(meta.pageTitle, meta.title);
  const description = meta.description ?? DEFAULT_DESCRIPTION;
  const url = canonicalUrl(meta.path ?? window.location.pathname);
  const image = meta.image ?? DEFAULT_OG_IMAGE;
  const imageAlt = meta.imageAlt ?? DEFAULT_OG_IMAGE_ALT;

  document.title = title;
  upsertMeta("name", "description", description);
  upsertLink("canonical", url);
  upsertMeta("name", "robots", meta.noindex ? "noindex, nofollow" : null);

  upsertMeta("property", "og:type", meta.type ?? "website");
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:image:alt", imageAlt);

  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", image);
  upsertMeta("name", "twitter:image:alt", imageAlt);

  setPageJsonLd(meta.jsonLd ?? null);
}

/** Site-wide organization graph. Mirrors the static block in index.html. */
export function organizationJsonLd(): JsonLd {
  const graph: JsonLd = {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "Organization"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "SpryMD.ai",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icons/icon-512.png`,
    image: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    email: COMPANY.SUPPORT_EMAIL,
    areaServed: { "@type": "State", name: COMPANY.AREA_SERVED },
    founder: { "@type": ["Physician", "Person"], name: "Dr. William Merrick, DO", honorificSuffix: "DO" },
    availableService: { "@type": "MedicalProcedure", name: "Telehealth consultation", procedureType: "Noninvasive" },
  };

  const tel = companyTelHref();
  if (tel) graph.telephone = tel.replace(/^tel:/, "");

  if (isConfigured(COMPANY.ADDRESS)) {
    // Best-effort parse: "Street, City, ST ZIP" — refine when real address is set.
    const parts = COMPANY.ADDRESS.split(",").map((p) => p.trim());
    const street = parts[0] || COMPANY.ADDRESS;
    const city = parts[1] || "";
    const stateZip = (parts[2] || "").split(/\s+/).filter(Boolean);
    const region = stateZip[0] || "";
    const postal = stateZip.slice(1).join(" ") || "";
    graph.address = {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: city || undefined,
      addressRegion: region || undefined,
      postalCode: postal || undefined,
      addressCountry: "US",
    };
  }

  return graph;
}

export function faqJsonLd(items: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

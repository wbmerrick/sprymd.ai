// Relative import (not "@/") so vite.config.ts can load this table for sitemap generation.
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../lib/seo";

export interface RouteMeta {
  /** Exact path, or a prefix when `prefix` is true (e.g. "/dashboard"). */
  path: string;
  prefix?: boolean;
  /** Full title (homepage) or page title that gets the " | SpryMD" suffix. */
  title?: string;
  pageTitle?: string;
  description: string;
  /** Public marketing/legal pages are indexable and listed in sitemap.xml. */
  indexable: boolean;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
}

/**
 * Single source of truth for per-route <head> metadata, robots directives and
 * the generated sitemap.xml. Add public pages here when new routes ship.
 */
export const ROUTE_META: RouteMeta[] = [
  {
    path: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    indexable: true,
    changefreq: "weekly",
    priority: 1,
  },
  {
    path: "/about",
    pageTitle: "About SpryMD — Physician-founded telehealth in Tennessee",
    description:
      "SpryMD is a telehealth practice founded by a Tennessee hospitalist. A licensed clinician reviews every case; treatment ships only when clinically appropriate.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/faq",
    pageTitle: "Frequently Asked Questions",
    description:
      "How SpryMD telehealth works: physician review, prescriptions, pricing, privacy, shipping, and what to expect after your visit.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/contact",
    pageTitle: "Contact SpryMD",
    description: "Questions about a visit, shipping, or your account? Contact the SpryMD care team. We respond within one business day.",
    indexable: true,
    changefreq: "yearly",
    priority: 0.6,
  },
  {
    path: "/terms",
    pageTitle: "Terms and Conditions",
    description: "The terms and conditions that govern use of SpryMD telehealth services.",
    indexable: true,
    changefreq: "yearly",
    priority: 0.3,
  },
  {
    path: "/privacy",
    pageTitle: "Privacy Policy",
    description: "How SpryMD collects, uses, and protects your personal and health information.",
    indexable: true,
    changefreq: "yearly",
    priority: 0.3,
  },
  {
    path: "/npp",
    pageTitle: "Notice of Privacy Practices",
    description: "SpryMD's HIPAA Notice of Privacy Practices: how protected health information may be used and disclosed, and your rights.",
    indexable: true,
    changefreq: "yearly",
    priority: 0.3,
  },
  {
    path: "/care/ed",
    pageTitle: "Wingman — On-Demand ED Treatment",
    description:
      "Wingman by spryMD.ai: 80 mg sildenafil + 20 mg tadalafil. Online clinician review, discreet shipping in Tennessee.",
    indexable: true,
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/care/weight-loss",
    pageTitle: "Doctor-Guided Weight Loss",
    description:
      "Clinician-titrated GLP-1 and dual-agonist therapy from SpryMD. Tennessee telehealth with discreet shipping.",
    indexable: true,
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/care/hair-loss",
    pageTitle: "Hair Loss Treatment",
    description:
      "Clinician-guided oral and topical hair restore protocols. Finasteride, minoxidil, and compounded options.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.85,
  },
  {
    path: "/care/skin",
    pageTitle: "Prescription Skin Care",
    description:
      "Therapeutic tretinoin complexes and acne gels — clinician-guided and compounded for tolerability.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.85,
  },
  {
    path: "/care/sermorelin",
    pageTitle: "Sermorelin Peptide Therapy",
    description:
      "Clinician-supervised sermorelin for recovery, sleep, and lean muscle — compounded and cold-shipped.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.85,
  },
  {
    path: "/care/nad-therapy",
    pageTitle: "NAD+ Therapy",
    description:
      "Clinic-grade NAD+ by injection or nasal spray. Fight fatigue and brain fog with clinician oversight.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.85,
  },
  // Unknown /care/:slug values fall through to NOT_FOUND_META (no catch-all prefix —
  // that previously titled bogus care URLs "Care options" while the SPA still matched).
  // Transactional / account surfaces: titled for the tab, kept out of the index.
  { path: "/quiz", pageTitle: "Start your visit", description: DEFAULT_DESCRIPTION, indexable: false },
  { path: "/intake", pageTitle: "Medical intake", description: DEFAULT_DESCRIPTION, indexable: false },
  { path: "/checkout", pageTitle: "Checkout", description: DEFAULT_DESCRIPTION, indexable: false },
  { path: "/checkout/success", pageTitle: "Payment confirmed", description: DEFAULT_DESCRIPTION, indexable: false },
  { path: "/dashboard", prefix: true, pageTitle: "Patient dashboard", description: DEFAULT_DESCRIPTION, indexable: false },
  { path: "/provider", prefix: true, pageTitle: "Provider notes", description: DEFAULT_DESCRIPTION, indexable: false },
  { path: "/visit", prefix: true, pageTitle: "Visit room", description: DEFAULT_DESCRIPTION, indexable: false },
  { path: "/oauth", prefix: true, pageTitle: "Connect a device", description: DEFAULT_DESCRIPTION, indexable: false },
  { path: "/ops", prefix: true, pageTitle: "Clinical ops", description: DEFAULT_DESCRIPTION, indexable: false },
];

export const NOT_FOUND_META: RouteMeta = {
  path: "*",
  pageTitle: "Page not found",
  description: DEFAULT_DESCRIPTION,
  indexable: false,
};

function normalizePath(pathname: string): string {
  const clean = pathname.split("?")[0].split("#")[0] || "/";
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

/** Resolve metadata for a pathname; unknown routes get the not-found entry. */
export function metaForPath(pathname: string): RouteMeta {
  const path = normalizePath(pathname);
  const exact = ROUTE_META.find((r) => !r.prefix && r.path === path);
  if (exact) return exact;
  const prefixed = ROUTE_META.find((r) => r.prefix && (path === r.path || path.startsWith(`${r.path}/`)));
  return prefixed ?? NOT_FOUND_META;
}

export const SITEMAP_ROUTES = ROUTE_META.filter((r) => r.indexable);

/** Paths crawlers should not index; kept in sync with public/robots.txt. */
export const DISALLOWED_PATHS = ROUTE_META.filter((r) => !r.indexable && r.path !== "/quiz").map((r) => r.path);

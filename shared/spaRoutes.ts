/**
 * SPA paths that must rewrite to /index.html on Vercel (filesystem misses).
 * Keep in sync with react-router routes in src/App.tsx.
 * Unknown paths must NOT be rewritten — Vercel then serves public/404.html with HTTP 404.
 */
export type SpaRewrite = {
  /** Vercel rewrite `source` pattern */
  source: string;
  /** Human note for reviews / tests */
  note?: string;
};

/** Exact or parameterized SPA routes (order does not matter for Vercel matching). */
export const SPA_REWRITES: SpaRewrite[] = [
  { source: "/", note: "homepage + SpryApp funnel views" },
  { source: "/quiz", note: "legacy CTA → Navigate to /?view=start" },
  { source: "/care/:slug", note: "condition edu / footer protocol pages" },
  { source: "/about" },
  { source: "/faq" },
  { source: "/contact" },
  { source: "/terms" },
  { source: "/privacy" },
  { source: "/npp" },
  { source: "/intake" },
  { source: "/checkout" },
  { source: "/checkout/success" },
  { source: "/dashboard" },
  { source: "/dashboard/:path*" },
  { source: "/staff" },
  { source: "/staff/:path*" },
  { source: "/master" },
  { source: "/master/:path*" },
  { source: "/provider/notes" },
  { source: "/visit/:appointmentId" },
  { source: "/ops" },
  { source: "/ops/:appointmentId" },
  { source: "/oauth/authorize" },
  { source: "/oauth/callback" },
];

/** Patterns that must never appear — they force soft-404 (HTTP 200) for every unknown URL. */
export const FORBIDDEN_SPA_CATCHALL_SOURCES = [
  "/((?!api/|assets/).*)",
  "/(.*)",
  "/:path*",
  "/*",
];

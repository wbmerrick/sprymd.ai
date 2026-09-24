import type { VercelRequest, VercelResponse } from "@vercel/node";

const DEFAULT_ORIGINS = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:3000",
];

export function applyCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin || "";
  const appUrl = process.env.APP_URL || "";
  const allowed = new Set(
    [...DEFAULT_ORIGINS, appUrl].filter(Boolean).map((u) => u.replace(/\/$/, "")),
  );

  if (origin && (allowed.has(origin) || allowed.has(origin.replace(/\/$/, "")))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (appUrl) {
    res.setHeader("Access-Control-Allow-Origin", appUrl.replace(/\/$/, ""));
  } else if (origin) {
    // Same-deployment SPA previews: reflect origin when APP_URL unset
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Stripe-Signature",
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

export function handlePreflight(
  req: VercelRequest,
  res: VercelResponse,
): boolean {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

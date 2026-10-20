import type { VercelRequest } from "@vercel/node";
import { timingSafeEqual } from "node:crypto";

/**
 * Shared-secret auth for operator endpoints under /api/cron.
 * Accepts `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this when
 * CRON_SECRET is set) or `x-cron-secret: <CRON_SECRET>` (GitHub Actions, curl).
 */
export function cronAuthorized(req: VercelRequest): boolean {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const auth = String(req.headers.authorization || "");
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = String(req.headers["x-cron-secret"] || "").trim();
  const presented = bearer || header;
  if (!presented) return false;
  const a = Buffer.from(presented);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePreflight } from "./_lib/cors";

/** Proves local _lib imports resolve in the Vercel serverless bundle. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  handlePreflight(req, res);
  res.status(200).json({
    ok: true,
    node: process.version,
    corsLoaded: true,
  });
}

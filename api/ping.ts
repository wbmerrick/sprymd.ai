import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Proves local _lib imports resolve in the Vercel serverless bundle. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "method_not_allowed" });
      return;
    }
    const { handlePreflight } = await import("./_lib/cors");
    handlePreflight(req, res);
    res.status(200).json({
      ok: true,
      node: process.version,
      corsLoaded: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: message });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  res.status(200).json({
    ok: true,
    stripeType: typeof Stripe,
    canConstruct: typeof Stripe === "function",
  });
}

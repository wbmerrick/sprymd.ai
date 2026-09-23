import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceTier } from "../shared/serviceTiers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  const tier = getServiceTier("visit_basic");
  res.status(200).json({
    ok: true,
    tierName: tier?.name ?? null,
    amountCents: tier?.amountCents ?? null,
  });
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { akute, akuteConfigured, list } from "../_lib/akute/client";
import { cronAuthorized } from "../_lib/cronAuth";

/**
 * Operator view of Akute's own webhook delivery log (GET /v1/webhooks), so
 * "did Akute call us, and what did we answer?" has an answer without guessing
 * from our side of the wire.
 *
 * Auth: same as the sweep (CRON_SECRET).
 * Query: ?hours=24 (max 168) or ?since=<ISO>&until=<ISO>; ?resource=task filters
 * by resource type; ?recipient=sprymd filters recipients containing the text.
 *
 * The response never includes delivery payloads — only the envelope, recipient
 * and status — so it is safe to paste into a ticket.
 */

export const config = { maxDuration: 30 };

type Delivery = Record<string, unknown> & {
  id?: string;
  timestamp?: string;
  resource_type?: string;
  recipient?: string;
  status?: string;
  response_code?: number | string | null;
  payload?: Record<string, unknown> | null;
};

function isoOrNull(v: unknown): string | null {
  const t = Date.parse(String(v || ""));
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  if (!cronAuthorized(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (!akuteConfigured()) {
    res.status(503).json({ error: "akute_not_configured" });
    return;
  }

  const hours = Math.min(Math.max(Number(req.query.hours) || 24, 1), 168);
  const until = isoOrNull(req.query.until) || new Date().toISOString();
  const since = isoOrNull(req.query.since) || new Date(Date.parse(until) - hours * 3_600_000).toISOString();
  const resourceFilter = String(req.query.resource || "").trim().toLowerCase();
  const recipientFilter = String(req.query.recipient || "").trim().toLowerCase();

  let deliveries: Delivery[];
  try {
    deliveries = list(
      await akute(`/webhooks?${new URLSearchParams({ start_time: since, end_time: until })}`),
    ) as Delivery[];
  } catch (e) {
    res.status(502).json({ error: "akute_webhook_log_failed", message: (e as Error).message });
    return;
  }

  const rows = deliveries
    .map((d) => {
      const payload = (d.payload || {}) as Record<string, unknown>;
      return {
        id: d.id ?? null,
        timestamp: d.timestamp ?? null,
        resource: String(d.resource_type || payload.resource_type || "").toLowerCase() || null,
        eventType: String(payload.event_type || "").toLowerCase() || null,
        recipient: d.recipient ?? null,
        status: d.status ?? null,
        responseCode: d.response_code ?? null,
        resourceId: payload.id ?? null,
        payloadKeys: Object.keys(payload).slice(0, 40),
      };
    })
    .filter((r) => !resourceFilter || (r.resource || "").includes(resourceFilter))
    .filter((r) => !recipientFilter || String(r.recipient || "").toLowerCase().includes(recipientFilter))
    .sort((a, b) => String(b.timestamp || "").localeCompare(String(a.timestamp || "")));

  const byOutcome: Record<string, number> = {};
  for (const r of rows) {
    const key = `${r.recipient || "?"} ${r.status || "?"} ${r.responseCode ?? "?"}`;
    byOutcome[key] = (byOutcome[key] || 0) + 1;
  }

  res.status(200).json({ ok: true, since, until, count: rows.length, byOutcome, deliveries: rows.slice(0, 200) });
}

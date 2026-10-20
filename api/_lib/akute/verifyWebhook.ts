import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Akute webhook signature: header `x-akute-signature: t=<unix>,v1=<hex>`
 * Expected HMAC-SHA256 over `${timestamp}.${rawBody}` with webhook secret.
 * Docs: developer.akutehealth.com / Postman SignatureHeader.
 */
export function parseAkuteSignatureHeader(
  header: string | undefined | null,
): { timestamp: string; signature: string } | null {
  if (!header || typeof header !== "string") return null;
  const parts = header.split(",").reduce(
    (accum, item) => {
      const kv = item.split("=");
      if (kv[0] === "t") accum.timestamp = kv[1] || "";
      if (kv[0] === "v1") accum.signature = kv[1] || "";
      return accum;
    },
    { timestamp: "", signature: "" },
  );
  if (!parts.timestamp || !parts.signature) return null;
  return parts;
}

export function verifyAkuteWebhookSignature(opts: {
  rawBody: string | Buffer;
  signatureHeader: string | undefined | null;
  secret: string;
  /** Max age of t= timestamp in seconds (default 5 minutes) */
  toleranceSec?: number;
}): { ok: true } | { ok: false; reason: string } {
  const secret = String(opts.secret || "");
  if (!secret) return { ok: false, reason: "missing_secret" };

  const parsed = parseAkuteSignatureHeader(opts.signatureHeader);
  if (!parsed) return { ok: false, reason: "missing_or_malformed_signature" };

  const raw =
    typeof opts.rawBody === "string"
      ? opts.rawBody
      : opts.rawBody.toString("utf8");
  const payload = `${parsed.timestamp}.${raw}`;
  const expected = createHmac("sha256", secret).update(payload, "utf8").digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(parsed.signature, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, reason: "signature_mismatch" };
    }
  } catch {
    return { ok: false, reason: "signature_mismatch" };
  }

  const tolerance = opts.toleranceSec ?? 300;
  const ts = Number(parsed.timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad_timestamp" };
  // The documented example is unix seconds; be lenient if a sender uses milliseconds.
  const tsSec = ts > 1e11 ? ts / 1000 : ts;
  const age = Math.abs(Date.now() / 1000 - tsSec);
  if (age > tolerance) return { ok: false, reason: "timestamp_stale" };

  return { ok: true };
}

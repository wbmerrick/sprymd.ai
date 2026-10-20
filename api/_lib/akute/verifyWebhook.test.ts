import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  parseAkuteSignatureHeader,
  verifyAkuteWebhookSignature,
} from "./verifyWebhook";

const SECRET = "test_webhook_secret";

function sign(rawBody: string, ts = String(Math.floor(Date.now() / 1000))) {
  const hex = createHmac("sha256", SECRET)
    .update(`${ts}.${rawBody}`, "utf8")
    .digest("hex");
  return { header: `t=${ts},v1=${hex}`, ts };
}

describe("Akute webhook signature", () => {
  it("rejects missing signature", () => {
    const r = verifyAkuteWebhookSignature({
      rawBody: "{}",
      signatureHeader: undefined,
      secret: SECRET,
    });
    expect(r.ok).toBe(false);
  });

  it("rejects bad signature", () => {
    const r = verifyAkuteWebhookSignature({
      rawBody: '{"event_id":"e1"}',
      signatureHeader: "t=1,v1=deadbeef",
      secret: SECRET,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("signature_mismatch");
  });

  it("accepts valid HMAC", () => {
    const body = '{"event_id":"evt_1","resource":"medications"}';
    const { header } = sign(body);
    const r = verifyAkuteWebhookSignature({
      rawBody: body,
      signatureHeader: header,
      secret: SECRET,
    });
    expect(r).toEqual({ ok: true });
  });

  it("accepts a millisecond timestamp when judging staleness", () => {
    const body = '{"event_id":"evt_2"}';
    const { header } = sign(body, String(Date.now()));
    expect(verifyAkuteWebhookSignature({ rawBody: body, signatureHeader: header, secret: SECRET })).toEqual({
      ok: true,
    });
  });

  it("rejects a stale timestamp", () => {
    const body = '{"event_id":"evt_3"}';
    const { header } = sign(body, String(Math.floor(Date.now() / 1000) - 3600));
    const r = verifyAkuteWebhookSignature({ rawBody: body, signatureHeader: header, secret: SECRET });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("timestamp_stale");
  });

  it("parses t= and v1=", () => {
    const p = parseAkuteSignatureHeader("t=1492774577,v1=abc");
    expect(p).toEqual({ timestamp: "1492774577", signature: "abc" });
  });
});

/**
 * Shape of an Akute webhook delivery (developer.akutehealth.com → Webhooks →
 * "Search for Webhooks" example). The body is flat: the envelope fields sit next
 * to the resource's own fields.
 *
 *   {
 *     "event_id": "evt-56aa2808…",
 *     "event_type": "create",          // or "update"
 *     "resource_type": "Task",         // "Patient", "Appointment", "Note", "Medication", …
 *     "id": "657ba43e…",               // the resource id
 *     "patient_id": "…",               // on patient-scoped resources
 *     …resource fields
 *   }
 *
 * Older integrations guessed `resource` / `event` / `type`, so those are still
 * accepted as fallbacks.
 */
export type AkuteWebhookBody = {
  event_id?: string;
  event_type?: string;
  resource_type?: string;
  id?: string;
  resource?: string;
  event?: string;
  type?: string;
  data?: Record<string, unknown>;
  patient_id?: string;
  external_patient_id?: string;
  status?: string;
  [key: string]: unknown;
};

export function eventIdOf(body: AkuteWebhookBody): string | null {
  const id = body.event_id || body.id;
  return id != null && String(id).trim() ? String(id).trim() : null;
}

/** Lower-cased resource name, e.g. "task", "patient", "diagnosticreport". */
export function resourceOf(body: AkuteWebhookBody): string {
  return String(body.resource_type || body.resource || body.type || "unknown").toLowerCase();
}

/** "create" | "update" | "" */
export function eventOf(body: AkuteWebhookBody): string {
  return String(body.event_type || body.event || "").toLowerCase();
}

/**
 * Akute signs `${timestamp}.${JSON.stringify(request.body)}`. That is normally
 * byte-identical to the raw body, but if a proxy or the sender ever re-serialises
 * the JSON (whitespace, key order is preserved by JSON.stringify), this is the
 * second string worth checking before rejecting a delivery.
 */
export function canonicalJson(rawBody: string): string | null {
  try {
    const canonical = JSON.stringify(JSON.parse(rawBody));
    return canonical === rawBody ? null : canonical;
  } catch {
    return null;
  }
}

/** Seconds between now and the `t=` value in an x-akute-signature header, or null. */
export function signatureAgeSec(signatureHeader: string | undefined | null, now = Date.now()): number | null {
  if (!signatureHeader) return null;
  const t = signatureHeader
    .split(",")
    .map((kv) => kv.split("="))
    .find((kv) => kv[0] === "t")?.[1];
  const ts = Number(t);
  if (!Number.isFinite(ts)) return null;
  // Tolerate millisecond timestamps when judging age.
  const sec = ts > 1e11 ? ts / 1000 : ts;
  return Math.round(now / 1000 - sec);
}

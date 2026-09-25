/**
 * Lightweight conversion hooks. Pushes to `window.dataLayer` when GTM (or
 * similar) is present; no-ops otherwise. Safe to call without any pixel IDs.
 */
export type ConversionPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackConversion(event: string, payload: ConversionPayload = {}): void {
  if (typeof window === "undefined") return;
  const row = {
    event,
    ...payload,
    sprymd_ts: new Date().toISOString(),
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(row);
  if (import.meta.env.DEV) {
    console.debug("[sprymd:conversion]", row);
  }
}

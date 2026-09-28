/**
 * Public company contact details for footer, Contact page, and Organization JSON-LD.
 * Replace bracketed placeholders before hard open. Leave a field as a `[PLACEHOLDER]`
 * (or empty) to omit it from structured data while still showing the Contact block.
 */

export const COMPANY = {
  NAME: "SpryMD",
  LEGAL_NAME: "SpryMD Inc.",
  SUPPORT_EMAIL: "support@sprymd.ai",
  /** Street address line — e.g. "123 Main St, Suite 100" */
  ADDRESS: "[STREET], [CITY], [STATE] [ZIP]",
  /** Clickable customer-service number — e.g. "(615) 555-0100" */
  PHONE: "[(XXX) XXX-XXXX]",
  /** Displayed next to phone/email in the footer Contact block. */
  SUPPORT_HOURS: "[Mon–Fri, 9am–5pm CT]",
  AREA_SERVED: "Tennessee",
} as const;

/** True when a config string is a real value (not empty / not a `[placeholder]`). */
export function isConfigured(value: string | null | undefined): boolean {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 && !trimmed.startsWith("[");
}

/** Digits-only tel: href, or null when PHONE is still a placeholder. */
export function companyTelHref(): string | null {
  if (!isConfigured(COMPANY.PHONE)) return null;
  const digits = COMPANY.PHONE.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

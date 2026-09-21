/**
 * Company / legal-entity constants used across legal pages, the footer, and
 * contact flows. Values are read from Vite env vars so production values can
 * be supplied without code changes; the fallbacks are intentionally visible
 * placeholders (e.g. "[Street address — pending]") so missing values are
 * obvious during review rather than silently wrong.
 */

// Cast to a plain string record: ImportMetaEnv typing for custom keys is
// owned by another module and may not declare these vars.
const env = import.meta.env as Record<string, string | undefined>;

export const COMPANY = {
  /** Registered legal entity name. */
  legalName: env.VITE_COMPANY_LEGAL_NAME || "SpryMD, PLLC",
  /** Mailing address, line 1 (street). */
  addressLine1: env.VITE_COMPANY_ADDRESS_LINE1 || "[Street address — pending]",
  /** City portion of the mailing address. */
  city: env.VITE_COMPANY_CITY || "Nashville",
  /** State portion of the mailing address. */
  state: env.VITE_COMPANY_STATE || "TN",
  /** ZIP portion of the mailing address. */
  zip: env.VITE_COMPANY_ZIP || "[ZIP — pending]",
  /** Contact phone number. */
  phone: env.VITE_COMPANY_PHONE || "[Phone — pending]",
  /** General support / care email. */
  email: env.VITE_CONTACT_EMAIL || "care@sprymd.ai",
  /** Privacy officer email. */
  privacyEmail: env.VITE_PRIVACY_EMAIL || "privacy@sprymd.ai",
  /** Card statement descriptor shown on patient billing statements. */
  billingDescriptor: env.VITE_PAYMENT_STATEMENT_DESCRIPTOR || "SPRYMD",
} as const;

/**
 * Composed "City, ST ZIP" line. If VITE_COMPANY_ADDRESS_LINE2 is provided it
 * is used verbatim; otherwise the line is composed from city/state/zip.
 */
export const COMPANY_CITY_STATE_ZIP =
  env.VITE_COMPANY_ADDRESS_LINE2 ||
  `${COMPANY.city}, ${COMPANY.state} ${COMPANY.zip}`;

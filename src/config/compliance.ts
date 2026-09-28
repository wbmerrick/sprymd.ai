/**
 * Compliance / trust-badge flags. A badge renders ONLY when its flag is true.
 * Default every unverified claim to `false` — flip after legal/ops confirmation.
 */

export const COMPLIANCE = {
  /** Show "HIPAA-Compliant Platform" badge. */
  HIPAA_COMPLIANT: true,
  /** Show "Secure, Encrypted Checkout" badge. */
  SECURE_CHECKOUT: true,
  /** Show "100% Confidential" badge. */
  CONFIDENTIAL: true,
  /** Show "Licensed U.S. Providers" badge. */
  LICENSED_PROVIDERS: true,
  /**
   * LegitScript certification. Keep false until the official seal is issued.
   * When true, TrustBadges renders the official embed slot (never a homemade image).
   */
  LEGITSCRIPT_CERTIFIED: false,
  /**
   * Optional official LegitScript seal script URL provided by LegitScript.
   * Example: "https://static.legitscript.com/seals/XXXXX.js"
   * Leave empty until certification is complete.
   */
  LEGITSCRIPT_SEAL_SCRIPT_URL: "",
} as const;

export type ComplianceFlags = typeof COMPLIANCE;

/**
 * Compliance / trust-badge flags. A badge renders ONLY when its flag is true.
 * Default every unverified claim to `false` — flip after legal/ops confirmation.
 *
 * Do not enable HIPAA_COMPLIANT until counsel confirms BAA posture and marketing
 * wording. Prefer secure-transport / clinician-review language instead.
 */

export const COMPLIANCE = {
  /**
   * Show a "HIPAA-Compliant Platform" badge.
   * Keep false — we do not claim HIPAA certification or platform-wide HIPAA
   * compliance in marketing until counsel clears it.
   */
  HIPAA_COMPLIANT: false,
  /** Show secure Stripe checkout badge (TLS to Stripe-hosted checkout). */
  SECURE_CHECKOUT: true,
  /** Show discreet / private-care badge (not a confidentiality guarantee). */
  CONFIDENTIAL: true,
  /** Show licensed clinician review badge. */
  LICENSED_PROVIDERS: true,
  /** Show clinician chart-review badge. */
  CLINICIAN_REVIEW: true,
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

/**
 * Patient-facing pharmacy copy — pharmacy-neutral (no partner steering).
 * Partner pharmacy config archived at archive/pharmacy-partner/.
 */

import { PHARMACY_PAY_DISCLOSURE } from "@/data/program";

export { PHARMACY_PAY_DISCLOSURE };

/** How medication reaches the patient after clinical approval. */
export function pharmacyFulfillmentCopy(): string {
  return `If a prescription is medically appropriate, your clinician sends it to the pharmacy you chose. ${PHARMACY_PAY_DISCLOSURE}`;
}

/** Shorter variant for plan/checkout callouts. */
export function pharmacyShortCopy(): string {
  return "If approved, your clinician e-prescribes to your chosen pharmacy. You pay that pharmacy directly — SpryMD does not sell medication.";
}

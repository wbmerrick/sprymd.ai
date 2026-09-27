/**
 * Named pharmacy partner used in fulfillment copy.
 * Leave empty or as a `[PLACEHOLDER]` to fall back to generic "our pharmacy partner" wording.
 */

import { isConfigured } from "./company";

export const PHARMACY_NAME = "[PARTNER PHARMACY NAME]";
/** e.g. "licensed U.S. compounding pharmacy" or "licensed U.S. retail pharmacy" */
export const PHARMACY_TYPE = "[licensed U.S. compounding / retail pharmacy]";

/**
 * Patient-facing fulfillment sentence for how-it-works, plan, and FAQ surfaces.
 * Uses the named partner when configured; otherwise keeps the current generic wording.
 */
export function pharmacyFulfillmentCopy(): string {
  if (!isConfigured(PHARMACY_NAME)) {
    return "Once treatment is approved, your prescription is filled by our pharmacy partner, discreetly packaged, and shipped to your door.";
  }
  const type = isConfigured(PHARMACY_TYPE) ? PHARMACY_TYPE : "licensed U.S. pharmacy";
  return `Prescriptions are filled by ${PHARMACY_NAME}, a ${type}, and shipped discreetly to your door.`;
}

/** Shorter variant for plan/checkout callouts. */
export function pharmacyShortCopy(): string {
  if (!isConfigured(PHARMACY_NAME)) {
    return "If approved, compounded at our pharmacy partner and shipped discreetly.";
  }
  const type = isConfigured(PHARMACY_TYPE) ? PHARMACY_TYPE : "licensed U.S. pharmacy";
  return `If approved, filled by ${PHARMACY_NAME} (${type}) and shipped discreetly.`;
}

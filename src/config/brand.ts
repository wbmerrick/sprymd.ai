/**
 * Active site brand for the Vite client bundle.
 * Override with `VITE_SITE_BRAND=glptn` at build time for the GLPTN site.
 */

import {
  getSiteBrand,
  isConditionAllowed,
  resolveSiteBrandId,
  type SiteBrand,
  type SiteBrandId,
} from "../../shared/siteBrand";

export type { SiteBrand, SiteBrandId };

function readClientBrandEnv(): string {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_BRAND) {
      return String(import.meta.env.VITE_SITE_BRAND);
    }
  } catch {
    /* Node loading this module via vite.config */
  }
  if (typeof process !== "undefined" && process.env?.VITE_SITE_BRAND) {
    return String(process.env.VITE_SITE_BRAND);
  }
  return "sprymd";
}

export const SITE_BRAND_ID: SiteBrandId = resolveSiteBrandId(readClientBrandEnv());
export const SITE_BRAND: SiteBrand = getSiteBrand(SITE_BRAND_ID);

export function brandAllowsCondition(conditionId: string): boolean {
  return isConditionAllowed(conditionId, SITE_BRAND);
}

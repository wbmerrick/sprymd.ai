/**
 * Discreet card-statement fragment for cash-pay visits.
 * Used as Stripe `payment_intent_data.statement_descriptor_suffix`
 * (banks may show ACCOUNT*SPRYMD or ACCOUNT*GLPTN). Never put ED / drug names here.
 * Stripe suffix limit: ≤22 characters; at least one letter.
 *
 * Vercel API routes must import the mirror at `api/_lib/statementDescriptor.ts`
 * (NFT does not include `../shared` in Lambda bundles).
 */

import { getSiteBrand, resolveSiteBrandId } from "./siteBrand";

const brand = getSiteBrand(
  resolveSiteBrandId(
    typeof process !== "undefined" ? process.env.VITE_SITE_BRAND ?? process.env.SITE_BRAND : undefined,
  ),
);

export const STATEMENT_DESCRIPTOR = brand.statementDescriptor;

/** Patient-facing FAQ / marketing copy of the same descriptor. */
export const STATEMENT_DESCRIPTOR_DISPLAY = brand.statementDescriptor;

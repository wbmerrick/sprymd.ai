/** Mirrored from /shared for Vercel API bundling — keep in sync with shared/statementDescriptor.ts + shared/siteBrand.ts. */
/**
 * Discreet card-statement fragment for cash-pay visits.
 * Used as Stripe `payment_intent_data.statement_descriptor_suffix`
 * (banks may show ACCOUNT*SPRYMD or ACCOUNT*GLPTN). Never put ED / drug names here.
 * Stripe suffix limit: ≤22 characters; at least one letter.
 */
const brandId = String(process.env.VITE_SITE_BRAND ?? process.env.SITE_BRAND ?? "sprymd")
  .trim()
  .toLowerCase();

export const STATEMENT_DESCRIPTOR = brandId === "glptn" ? "GLPTN" : "SPRYMD";

/** Patient-facing FAQ / marketing copy of the same descriptor. */
export const STATEMENT_DESCRIPTOR_DISPLAY = STATEMENT_DESCRIPTOR;

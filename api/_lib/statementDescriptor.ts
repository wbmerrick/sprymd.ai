/** Mirrored from /shared for Vercel API bundling — keep in sync with shared/statementDescriptor.ts. */
/**
 * Discreet card-statement fragment for cash-pay visits.
 * Used as Stripe `payment_intent_data.statement_descriptor_suffix`
 * (banks may show ACCOUNT*SPRYMD). Never put ED / drug names here.
 * Stripe suffix limit: ≤22 characters; at least one letter.
 */
export const STATEMENT_DESCRIPTOR = "SPRYMD";

/** Patient-facing FAQ / marketing copy of the same descriptor. */
export const STATEMENT_DESCRIPTOR_DISPLAY = "SPRYMD";

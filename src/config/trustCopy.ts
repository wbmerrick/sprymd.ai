/**
 * Editable trust / payment microcopy shown near intake CTAs and pricing.
 * Keep short — these render as inline pills, not a new section.
 */

export const PAYMENT_TRUST = {
  NO_INSURANCE: "No insurance needed",
  TRANSPARENT_PRICING: "Transparent pricing, with no hidden fees",
  /** Editable — update when visit fee packaging changes. */
  SIMPLE_PRICE: "One simple price that covers your visit",
} as const;

/**
 * Cash-pay catalog — single Physician GLP-1 Evaluation product.
 * Legacy tier ids alias to evaluation so older clients still charge $100.
 * Multi-tier history: archive/billing-membership/serviceTiers.ts
 */

import { EVALUATION_PRODUCT } from "./program";

export type ServiceTierId =
  | "evaluation"
  | "visit_basic"
  | "visit_comprehensive"
  | "protocol_start";

export type ServiceTier = {
  id: ServiceTierId;
  name: string;
  description: string;
  amountCents: number;
  currency: "usd";
};

const evaluation: ServiceTier = {
  id: "evaluation",
  name: EVALUATION_PRODUCT.name,
  description: EVALUATION_PRODUCT.description,
  amountCents: EVALUATION_PRODUCT.amountCents,
  currency: "usd",
};

/** All public SKUs resolve to the same $100 evaluation. */
export const SERVICE_TIERS: ServiceTier[] = [evaluation];

export const SERVICE_TIERS_BY_ID: Record<ServiceTierId, ServiceTier> = {
  evaluation,
  visit_basic: { ...evaluation, id: "visit_basic" },
  visit_comprehensive: { ...evaluation, id: "visit_comprehensive" },
  protocol_start: { ...evaluation, id: "protocol_start" },
};

export function getServiceTier(id: string): ServiceTier | undefined {
  if (!id) return evaluation;
  return SERVICE_TIERS_BY_ID[id as ServiceTierId] ?? evaluation;
}

export function formatTierPrice(tier: ServiceTier): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: tier.currency.toUpperCase(),
  }).format(tier.amountCents / 100);
}

export const DEFAULT_SERVICE_TIER_ID: ServiceTierId = "evaluation";

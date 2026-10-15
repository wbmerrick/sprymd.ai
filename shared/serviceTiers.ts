/**
 * Cash-pay catalog — SpryMD Physician GLP-1 Evaluation ($100) plus iSpry membership.
 * Legacy SpryMD visit tier ids alias to evaluation.
 * Multi-tier history: archive/billing-membership/serviceTiers.ts
 */

import { EVALUATION_PRODUCT } from "./program";

export type ServiceTierId =
  | "evaluation"
  | "visit_basic"
  | "visit_comprehensive"
  | "protocol_start"
  | "ispry_membership";

export type ServiceTierBilling = "one_time" | "subscription";

export type ServiceTier = {
  id: ServiceTierId;
  name: string;
  description: string;
  amountCents: number;
  currency: "usd";
  billing: ServiceTierBilling;
  /** Shown next to price for subscriptions (e.g. "/month") */
  priceSuffix?: string;
  /** Brand surface this tier belongs to (default SpryMD). */
  brand?: "sprymd" | "ispry";
};

const evaluation: ServiceTier = {
  id: "evaluation",
  name: EVALUATION_PRODUCT.name,
  description: EVALUATION_PRODUCT.description,
  amountCents: EVALUATION_PRODUCT.amountCents,
  currency: "usd",
  billing: "one_time",
  brand: "sprymd",
};

const ispryMembership: ServiceTier = {
  id: "ispry_membership",
  name: "iSpry Membership",
  description:
    "Physician-led telehealth membership for Tennessee. Up to 3 visits/month, up to 3 problems per visit, Spry AI intake included.",
  amountCents: 10000,
  currency: "usd",
  billing: "subscription",
  priceSuffix: "/month",
  brand: "ispry",
};

/** Public catalog: SpryMD evaluation + iSpry membership. */
export const SERVICE_TIERS: ServiceTier[] = [evaluation, ispryMembership];

/** Visit tiers shown on the default SpryMD cash-pay checkout. */
export const SPRYMD_VISIT_TIERS: ServiceTier[] = SERVICE_TIERS.filter(
  (tier) => tier.brand !== "ispry",
);

export const SERVICE_TIERS_BY_ID: Record<ServiceTierId, ServiceTier> = {
  evaluation,
  visit_basic: { ...evaluation, id: "visit_basic" },
  visit_comprehensive: { ...evaluation, id: "visit_comprehensive" },
  protocol_start: { ...evaluation, id: "protocol_start" },
  ispry_membership: ispryMembership,
};

export function getServiceTier(id: string): ServiceTier | undefined {
  if (!id) return evaluation;
  return SERVICE_TIERS_BY_ID[id as ServiceTierId] ?? evaluation;
}

export function formatTierPrice(tier: ServiceTier): string {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: tier.currency.toUpperCase(),
  }).format(tier.amountCents / 100);
  return tier.priceSuffix ? `${amount}${tier.priceSuffix}` : amount;
}

export const DEFAULT_SERVICE_TIER_ID: ServiceTierId = "evaluation";

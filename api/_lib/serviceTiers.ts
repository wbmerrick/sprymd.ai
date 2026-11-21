/**
 * Mirrored from /shared for Vercel API bundling — keep in sync with shared/.
 *
 * Do NOT import from ../../shared here. /api builds as CommonJS (api/package.json)
 * while /shared builds as ESM (root package.json "type": "module"), so a
 * cross-import crashes every function that loads this file with ERR_REQUIRE_ESM.
 */

/** Mirror of EVALUATION_PRODUCT in shared/program.ts — keep the two in sync. */
const EVALUATION_PRODUCT = {
  name: "Physician GLP-1 Evaluation",
  description:
    "$100 physician evaluation. Prescription only if medically appropriate. Full refund if not.",
  amountCents: 10000,
} as const;

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
  priceSuffix?: string;
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

export const SERVICE_TIERS: ServiceTier[] = [evaluation, ispryMembership];

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

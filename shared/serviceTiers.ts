/**
 * Cash-pay telehealth service tier catalog.
 * Shared by Vercel API routes and the React SPA — keep prices in cents.
 */

export type ServiceTierId =
  | "visit_basic"
  | "visit_comprehensive"
  | "protocol_start"
  | "ispry_membership";

export type ServiceTierBilling = "one_time" | "subscription";

export type ServiceTier = {
  id: ServiceTierId;
  name: string;
  description: string;
  /** Price in USD cents for Stripe Checkout line items */
  amountCents: number;
  currency: "usd";
  billing: ServiceTierBilling;
  /** Shown next to price for subscriptions (e.g. "/month") */
  priceSuffix?: string;
  /** Brand surface this tier belongs to (default SpryMD). */
  brand?: "sprymd" | "ispry";
};

export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: "visit_basic",
    name: "Clinician Visit",
    description: "One-time clinician visit for focused telehealth care.",
    amountCents: 7500,
    currency: "usd",
    billing: "one_time",
  },
  {
    id: "visit_comprehensive",
    name: "Comprehensive Visit",
    description: "Extended clinician review with a fuller care plan.",
    amountCents: 14900,
    currency: "usd",
    billing: "one_time",
  },
  {
    id: "protocol_start",
    name: "Protocol Start Visit",
    description: "Kickoff visit to begin a treatment protocol.",
    amountCents: 9900,
    currency: "usd",
    billing: "one_time",
  },
  {
    id: "ispry_membership",
    name: "iSpry Membership",
    description:
      "Physician-led telehealth membership for Tennessee. Up to 3 visits/month, up to 3 problems per visit, Spry AI intake included.",
    amountCents: 10000,
    currency: "usd",
    billing: "subscription",
    priceSuffix: "/month",
    brand: "ispry",
  },
];

/** Visit tiers shown on the default SpryMD cash-pay checkout. */
export const SPRYMD_VISIT_TIERS: ServiceTier[] = SERVICE_TIERS.filter(
  (tier) => tier.brand !== "ispry",
);

export const SERVICE_TIERS_BY_ID: Record<ServiceTierId, ServiceTier> =
  Object.fromEntries(SERVICE_TIERS.map((tier) => [tier.id, tier])) as Record<
    ServiceTierId,
    ServiceTier
  >;

export function getServiceTier(id: string): ServiceTier | undefined {
  return SERVICE_TIERS_BY_ID[id as ServiceTierId];
}

export function formatTierPrice(tier: ServiceTier): string {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: tier.currency.toUpperCase(),
  }).format(tier.amountCents / 100);
  return tier.priceSuffix ? `${amount}${tier.priceSuffix}` : amount;
}

/** Mirrored from /shared for Vercel API bundling — keep in sync with shared/. */
/**
 * Cash-pay telehealth service tier catalog.
 * Shared by Vercel API routes and the React SPA — keep prices in cents.
 */

export type ServiceTierId =
  | "visit_basic"
  | "visit_comprehensive"
  | "protocol_start";

export type ServiceTier = {
  id: ServiceTierId;
  name: string;
  description: string;
  /** Price in USD cents for Stripe Checkout line items */
  amountCents: number;
  currency: "usd";
};

export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: "visit_basic",
    name: "Clinician Visit",
    description: "One-time clinician visit for focused telehealth care.",
    amountCents: 7500,
    currency: "usd",
  },
  {
    id: "visit_comprehensive",
    name: "Comprehensive Visit",
    description: "Extended clinician review with a fuller care plan.",
    amountCents: 14900,
    currency: "usd",
  },
  {
    id: "protocol_start",
    name: "Protocol Start Visit",
    description: "Kickoff visit to begin a treatment protocol.",
    amountCents: 9900,
    currency: "usd",
  },
];

export const SERVICE_TIERS_BY_ID: Record<ServiceTierId, ServiceTier> =
  Object.fromEntries(SERVICE_TIERS.map((tier) => [tier.id, tier])) as Record<
    ServiceTierId,
    ServiceTier
  >;

export function getServiceTier(id: string): ServiceTier | undefined {
  return SERVICE_TIERS_BY_ID[id as ServiceTierId];
}

export function formatTierPrice(tier: ServiceTier): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: tier.currency.toUpperCase(),
  }).format(tier.amountCents / 100);
}

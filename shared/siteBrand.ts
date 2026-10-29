/**
 * Multi-site brand profiles. Default is SpryMD.
 * Set `VITE_SITE_BRAND=glptn` (build/runtime) for the GLPTN weight-loss practice.
 *
 * Keep this file free of React / Vite-only APIs so api/ and vite.config can import it.
 */

export type SiteBrandId = "sprymd" | "glptn";

/** Mirrors ConditionId in careCatalog — keep in sync when adding conditions. */
export type BrandConditionId =
  | "weightloss"
  | "ed"
  | "hairloss"
  | "skincare"
  | "sermorelin"
  | "nad"
  | "lowt"
  | "mentalhealth"
  | "womenshealth"
  | "pcp";

export type SiteBrand = {
  id: SiteBrandId;
  name: string;
  legalName: string;
  siteUrl: string;
  supportEmail: string;
  statementDescriptor: string;
  defaultTitle: string;
  defaultDescription: string;
  ogImagePath: string;
  ogImageAlt: string;
  /** Conditions shown in care grids / footer. null = use CARE_SERVICES flags as-is. */
  allowedConditions: readonly BrandConditionId[] | null;
  /** Primary CTA condition for single-offer brands. */
  primaryConditionId: BrandConditionId;
  showAudienceFilter: boolean;
  showPcpSection: boolean;
  heroHeadline: string;
  heroSupport: string;
  heroCtaLabel: string;
};

const SPRYMD: SiteBrand = {
  id: "sprymd",
  name: "SpryMD",
  legalName: "SpryMD Inc.",
  siteUrl: "https://www.sprymd.ai",
  supportEmail: "support@sprymd.ai",
  statementDescriptor: "SPRYMD",
  defaultTitle: "SpryMD — Telehealth for Tennessee. Feel better. Stay strong.",
  defaultDescription:
    "Licensed Tennessee doctors online for weight loss, ED, low T, sleep, mood, and primary care. Private visits, clear plans, medicine shipped to your door.",
  ogImagePath: "/brand/sprymd-og-share.jpg",
  ogImageAlt: "SpryMD — sunlit alpine peaks reflected in a dark teal lake",
  allowedConditions: null,
  primaryConditionId: "weightloss",
  showAudienceFilter: true,
  showPcpSection: true,
  heroHeadline: "Feel better. Stay strong.",
  heroSupport: "Licensed Tennessee doctors online — private visits, clear plans.",
  heroCtaLabel: "Start your confidential visit",
};

const GLPTN: SiteBrand = {
  id: "glptn",
  name: "GLPTN",
  legalName: "GLPTN",
  siteUrl: "https://www.glptn.com",
  supportEmail: "support@glptn.com",
  statementDescriptor: "GLPTN",
  defaultTitle: "GLPTN — Doctor-guided weight loss for Tennessee",
  defaultDescription:
    "Licensed Tennessee clinicians for physician-guided GLP-1 weight-loss care. $100 evaluation. Prescription only if medically appropriate. You pay your pharmacy directly.",
  ogImagePath: "/brand/sprymd-og-share.jpg",
  ogImageAlt: "GLPTN — doctor-guided weight loss",
  allowedConditions: ["weightloss"],
  primaryConditionId: "weightloss",
  showAudienceFilter: false,
  showPcpSection: false,
  heroHeadline: "Doctor-guided weight loss.",
  heroSupport:
    "$100 physician evaluation. Prescription only if medically appropriate. Full refund if not. You pay your pharmacy directly for medication.",
  heroCtaLabel: "Start your weight-loss evaluation",
};

const BRANDS: Record<SiteBrandId, SiteBrand> = {
  sprymd: SPRYMD,
  glptn: GLPTN,
};

export function resolveSiteBrandId(raw?: string | null): SiteBrandId {
  const normalized = (raw ?? "sprymd").trim().toLowerCase();
  if (normalized === "glptn") return "glptn";
  return "sprymd";
}

export function getSiteBrand(id?: SiteBrandId | string | null): SiteBrand {
  return BRANDS[resolveSiteBrandId(typeof id === "string" ? id : undefined)];
}

export function isConditionAllowed(
  conditionId: string,
  brand: SiteBrand,
): boolean {
  if (!brand.allowedConditions) return true;
  return (brand.allowedConditions as readonly string[]).includes(conditionId);
}

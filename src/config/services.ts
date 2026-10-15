/**
 * Single source of truth for homepage intake-grid cards and footer "Care plans".
 * Condition clinical data (plans, intake questions) lives in `data/careCatalog.ts`;
 * this file controls nav labels, grid visibility, and display order so the two
 * surfaces cannot drift apart again.
 */

import { conditions, type Condition, type ConditionId } from "@/data/careCatalog";
import { brandAllowsCondition } from "@/config/brand";

export type Audience = "men" | "women" | "all";

export type CareService = {
  conditionId: ConditionId;
  /** Footer / nav label (may differ slightly from catalog clinical name). */
  footerLabel: string;
  audience: Audience;
  /** Show in "What can we help you with?" + Care options grids. */
  showInGrid: boolean;
  /** Show under footer "Care plans". */
  showInFooter: boolean;
};

/**
 * Ordered care-plan list. Edit here — both the hero/care grids and the footer
 * Care plans column read from this array.
 */
export const CARE_SERVICES: readonly CareService[] = [
  { conditionId: "weightloss", footerLabel: "Weight Loss", audience: "all", showInGrid: true, showInFooter: true },
  { conditionId: "ed", footerLabel: "ED", audience: "men", showInGrid: true, showInFooter: true },
  { conditionId: "lowt", footerLabel: "Low Testosterone", audience: "men", showInGrid: true, showInFooter: true },
  { conditionId: "womenshealth", footerLabel: "Women's Health", audience: "women", showInGrid: true, showInFooter: true },
  { conditionId: "sermorelin", footerLabel: "Sermorelin", audience: "all", showInGrid: true, showInFooter: true },
  { conditionId: "nad", footerLabel: "NAD+ Therapy", audience: "all", showInGrid: true, showInFooter: true },
  { conditionId: "mentalhealth", footerLabel: "Anxiety & Depression", audience: "all", showInGrid: true, showInFooter: true },
  { conditionId: "hairloss", footerLabel: "Hair Loss", audience: "all", showInGrid: true, showInFooter: true },
  { conditionId: "skincare", footerLabel: "Skin", audience: "all", showInGrid: true, showInFooter: true },
  { conditionId: "pcp", footerLabel: "Primary Care", audience: "all", showInGrid: false, showInFooter: true },
] as const;

export type GridService = CareService & { condition: Condition };

export function getGridServices(audienceFilter: Audience | "all" = "all"): GridService[] {
  return CARE_SERVICES.filter((s) => {
    if (!s.showInGrid) return false;
    if (!brandAllowsCondition(s.conditionId)) return false;
    if (audienceFilter === "all") return true;
    return s.audience === "all" || s.audience === audienceFilter;
  })
    .map((s) => {
      const condition = conditions[s.conditionId];
      return condition ? { ...s, condition } : null;
    })
    .filter((s): s is GridService => Boolean(s));
}

export function getFooterCarePlanLabels(): string[] {
  return CARE_SERVICES.filter((s) => s.showInFooter && brandAllowsCondition(s.conditionId)).map(
    (s) => s.footerLabel,
  );
}

export function audienceBadgeLabel(audience: Audience): string {
  if (audience === "men") return "For men";
  if (audience === "women") return "For women";
  return "For men & women";
}

export function getServiceByConditionId(id: ConditionId): CareService | undefined {
  return CARE_SERVICES.find((s) => s.conditionId === id);
}

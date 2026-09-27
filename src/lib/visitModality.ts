/**
 * Visit modality policy: live video is for primary-care (PCP) visits only.
 * Specialty / protocol care (ED, weight loss, etc.) is async chart review.
 */

export const LIVE_VIDEO_CONDITION_IDS = ["pcp"] as const;

export type LiveVideoConditionId = (typeof LIVE_VIDEO_CONDITION_IDS)[number];

export function requiresLiveVideoVisit(
  conditionId: string | null | undefined,
): boolean {
  if (!conditionId) return false;
  return (LIVE_VIDEO_CONDITION_IDS as readonly string[]).includes(
    conditionId.trim().toLowerCase(),
  );
}

export function visitModalityLabel(
  conditionId: string | null | undefined,
): "live_video" | "async_chart_review" {
  return requiresLiveVideoVisit(conditionId)
    ? "live_video"
    : "async_chart_review";
}

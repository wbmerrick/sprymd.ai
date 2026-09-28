import { describe, expect, it } from "vitest";
import {
  requiresLiveVideoVisit,
  visitModalityLabel,
} from "@/lib/visitModality";

describe("visitModality", () => {
  it("requires live video only for PCP visits", () => {
    expect(requiresLiveVideoVisit("pcp")).toBe(true);
    expect(requiresLiveVideoVisit("PCP")).toBe(true);
    expect(requiresLiveVideoVisit("ed")).toBe(false);
    expect(requiresLiveVideoVisit("weightloss")).toBe(false);
    expect(requiresLiveVideoVisit(null)).toBe(false);
    expect(requiresLiveVideoVisit(undefined)).toBe(false);
  });

  it("labels modalities for ops copy", () => {
    expect(visitModalityLabel("pcp")).toBe("live_video");
    expect(visitModalityLabel("ed")).toBe("async_chart_review");
  });
});

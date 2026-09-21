import { describe, expect, it } from "vitest";
import {
  CARE_STATE_LABELS,
  CARE_STATE_ORDER,
  canTransition,
  getCareStateIndex,
  getTimelineSteps,
  isTerminalCareState,
  type CareState,
} from "@/lib/care-states";

describe("CARE_STATE_ORDER", () => {
  it("lists the happy-path states in pipeline order", () => {
    expect(CARE_STATE_ORDER).toEqual([
      "draft_intake",
      "paid",
      "under_review",
      "prescribed",
      "fulfilled",
      "active_care",
      "refill_due",
    ]);
  });

  it("excludes terminal states", () => {
    expect(CARE_STATE_ORDER).not.toContain("declined");
    expect(CARE_STATE_ORDER).not.toContain("cancelled");
  });
});

describe("isTerminalCareState", () => {
  it("is true for declined and cancelled", () => {
    expect(isTerminalCareState("declined")).toBe(true);
    expect(isTerminalCareState("cancelled")).toBe(true);
  });

  it("is false for every ordered pipeline state", () => {
    for (const state of CARE_STATE_ORDER) {
      expect(isTerminalCareState(state)).toBe(false);
    }
  });
});

describe("getCareStateIndex", () => {
  it("returns each ordered state's pipeline position", () => {
    CARE_STATE_ORDER.forEach((state, index) => {
      expect(getCareStateIndex(state)).toBe(index);
    });
  });

  it("returns 0 for states outside the pipeline (terminal states)", () => {
    expect(getCareStateIndex("declined")).toBe(0);
    expect(getCareStateIndex("cancelled")).toBe(0);
  });
});

describe("canTransition", () => {
  it("allows moving forward in the pipeline", () => {
    expect(canTransition("paid", "under_review")).toBe(true);
    expect(canTransition("draft_intake", "refill_due")).toBe(true);
  });

  it("allows staying in the same state", () => {
    expect(canTransition("under_review", "under_review")).toBe(true);
  });

  it("rejects moving backward in the pipeline", () => {
    expect(canTransition("prescribed", "paid")).toBe(false);
    expect(canTransition("refill_due", "draft_intake")).toBe(false);
  });

  it("rejects any transition out of a terminal state", () => {
    for (const to of [...CARE_STATE_ORDER, "declined", "cancelled"] as CareState[]) {
      expect(canTransition("declined", to)).toBe(false);
      expect(canTransition("cancelled", to)).toBe(false);
    }
  });

  it("allows any non-terminal state to move to a terminal state", () => {
    for (const from of CARE_STATE_ORDER) {
      expect(canTransition(from, "declined")).toBe(true);
      expect(canTransition(from, "cancelled")).toBe(true);
    }
  });
});

describe("getTimelineSteps", () => {
  it("returns a single active step for a terminal state", () => {
    const steps = getTimelineSteps("declined");
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      key: "declined",
      label: CARE_STATE_LABELS.declined,
      status: "active",
    });
    expect(steps[0].description.length).toBeGreaterThan(0);
  });

  it("returns one step per pipeline state for a non-terminal state", () => {
    const steps = getTimelineSteps("under_review");
    expect(steps.map((s) => s.key)).toEqual(CARE_STATE_ORDER);
  });

  it("marks earlier steps complete, the current step active, later steps pending", () => {
    const steps = getTimelineSteps("prescribed");
    const currentIndex = getCareStateIndex("prescribed");
    steps.forEach((step, index) => {
      if (index < currentIndex) expect(step.status).toBe("complete");
      else if (index === currentIndex) expect(step.status).toBe("active");
      else expect(step.status).toBe("pending");
    });
  });

  it("marks the first step active and the rest pending at the start of the pipeline", () => {
    const steps = getTimelineSteps("draft_intake");
    expect(steps[0].status).toBe("active");
    expect(steps.slice(1).every((s) => s.status === "pending")).toBe(true);
  });

  it("marks every step complete except the last at the end of the pipeline", () => {
    const steps = getTimelineSteps("refill_due");
    expect(steps[steps.length - 1].status).toBe("active");
    expect(steps.slice(0, -1).every((s) => s.status === "complete")).toBe(true);
  });

  it("carries a label and description on every step", () => {
    for (const step of getTimelineSteps("paid")) {
      expect(step.label.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  MESSAGE_URGENCY_OPTIONS,
  normalizeUrgency,
  sortThreadsByUrgency,
  toUiThreadStatus,
} from "@/lib/messaging";

describe("toUiThreadStatus", () => {
  it("flags awaiting_staff as action_required for chips", () => {
    expect(toUiThreadStatus("awaiting_staff")).toBe("action_required");
  });

  it("flags awaiting_patient / unread as action_required", () => {
    expect(toUiThreadStatus("awaiting_patient")).toBe("action_required");
    expect(toUiThreadStatus("open", true)).toBe("action_required");
  });

  it("maps closed/open without unread to no_action", () => {
    expect(toUiThreadStatus("closed")).toBe("no_action");
    expect(toUiThreadStatus("open", false)).toBe("no_action");
  });
});

describe("message urgency", () => {
  it("exposes three selectable urgency levels", () => {
    expect(MESSAGE_URGENCY_OPTIONS.map((o) => o.value)).toEqual(["routine", "soon", "urgent"]);
  });

  it("normalizes unknown values to routine", () => {
    expect(normalizeUrgency("bogus")).toBe("routine");
    expect(normalizeUrgency("urgent")).toBe("urgent");
  });

  it("sorts urgent before soon before routine", () => {
    const sorted = sortThreadsByUrgency([
      { urgency: "routine" as const, updatedAt: "2026-01-03T00:00:00Z", id: "r" },
      { urgency: "urgent" as const, updatedAt: "2026-01-01T00:00:00Z", id: "u" },
      { urgency: "soon" as const, updatedAt: "2026-01-02T00:00:00Z", id: "s" },
    ]);
    expect(sorted.map((t) => t.id)).toEqual(["u", "s", "r"]);
  });
});

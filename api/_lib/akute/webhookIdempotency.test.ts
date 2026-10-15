import { describe, expect, it } from "vitest";

/**
 * Mirrors the insert-first idempotency used by api/webhooks/akute.ts:
 * unique event_id → duplicate deliveries return 200 without reprocessing.
 */
function claimEvent(
  store: Set<string>,
  eventId: string,
): "claimed" | "duplicate" {
  if (store.has(eventId)) return "duplicate";
  store.add(eventId);
  return "claimed";
}

describe("Akute webhook event_id idempotency", () => {
  it("ignores duplicate event_id", () => {
    const store = new Set<string>();
    expect(claimEvent(store, "evt_1")).toBe("claimed");
    expect(claimEvent(store, "evt_1")).toBe("duplicate");
    expect(claimEvent(store, "evt_2")).toBe("claimed");
  });
});

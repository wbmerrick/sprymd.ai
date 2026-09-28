import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { trackConversion } from "./conversionTrack";

describe("trackConversion", () => {
  beforeEach(() => {
    // @ts-expect-error test shim
    window.dataLayer = [];
  });
  afterEach(() => {
    // @ts-expect-error cleanup
    delete window.dataLayer;
  });

  it("pushes checkout events for GTM to pick up later", () => {
    trackConversion("checkout_completed", {
      value: 99,
      currency: "USD",
      appointment_id: "appt_1",
    });
    expect(window.dataLayer?.length).toBe(1);
    expect(window.dataLayer?.[0]).toMatchObject({
      event: "checkout_completed",
      value: 99,
      currency: "USD",
      appointment_id: "appt_1",
    });
  });
});

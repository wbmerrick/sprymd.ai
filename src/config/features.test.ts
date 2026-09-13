import { describe, expect, it } from "vitest";
import { FEATURES } from "@/config/features";

describe("FEATURES launch gates", () => {
  it("keeps shop and device dashboard off until product is ready", () => {
    expect(FEATURES.enableShop).toBe(false);
    expect(FEATURES.enableDeviceDashboard).toBe(false);
  });
});

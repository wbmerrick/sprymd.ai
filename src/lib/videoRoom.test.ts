import { describe, expect, it } from "vitest";
import {
  isAppointmentId,
  liveVideoFallbackMessage,
  selectLiveVendor,
  visitRoomName,
} from "../../shared/videoRoom";

describe("live video room selection", () => {
  it("prefers Daily when that key is set, otherwise Twilio", () => {
    expect(selectLiveVendor({})).toBeNull();
    expect(selectLiveVendor({ DAILY_API_KEY: "daily-key" })).toBe("daily");
    expect(
      selectLiveVendor({
        TWILIO_ACCOUNT_SID: "AC",
        TWILIO_API_KEY: "SK",
        TWILIO_API_SECRET: "secret",
      }),
    ).toBe("twilio");
    expect(
      selectLiveVendor({
        VIDEO_VENDOR: "twilio",
        DAILY_API_KEY: "daily-key",
        TWILIO_ACCOUNT_SID: "AC",
        TWILIO_API_KEY: "SK",
        TWILIO_API_SECRET: "secret",
      }),
    ).toBe("twilio");
    expect(selectLiveVendor({ VIDEO_VENDOR: "off", DAILY_API_KEY: "daily-key" })).toBeNull();
  });

  it("builds a private room name from the appointment id", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(isAppointmentId(id)).toBe(true);
    expect(isAppointmentId("demo-visit")).toBe(false);
    expect(visitRoomName(id)).toBe(`sprymd-${id}`);
  });

  it("explains why a visit stayed on the local preview", () => {
    expect(liveVideoFallbackMessage("auth_required")).toMatch(/sign in/i);
    expect(liveVideoFallbackMessage("video_not_configured")).toMatch(/not configured/i);
    expect(liveVideoFallbackMessage("not_a_participant")).toMatch(/not on your account/i);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import {
  appendContinuousTick,
  emptyBodyProfile,
  getPatientCare,
  importWearableUpload,
  linkMarketplacePurchaseToWearables,
  recordCartCheckout,
  setWearableSyncMode,
  unlockWearableDevice,
  updateVitalsProfile,
  upsertBodyGoal,
} from "@/lib/patientCareStore";
import { computeBmi, MARKETPLACE_DEVICE_MAP } from "@/data/wearables";

const EMAIL = "terminal.pt@example.com";

beforeEach(() => {
  localStorage.clear();
});

describe("bioinformatic wearables store", () => {
  it("maps marketplace SKUs to wearable kinds", () => {
    expect(MARKETPLACE_DEVICE_MAP.p13).toBe("oura_ring");
    expect(MARKETPLACE_DEVICE_MAP.p17).toBe("cgm");
  });

  it("unlocks devices from cart checkout productId", () => {
    recordCartCheckout({
      email: EMAIL,
      items: [{ name: "Oura Ring 4", qty: 1, price: 349, productId: "p13" }],
      total: 349,
    });
    const care = getPatientCare(EMAIL);
    const oura = care.wearableDevices.find((d) => d.id === "oura_ring");
    expect(oura?.owned).toBe(true);
    expect(oura?.enabled).toBe(true);
  });

  it("parses CSV uploads into readings", () => {
    unlockWearableDevice(EMAIL, "pulse_oximeter");
    const care = importWearableUpload(
      EMAIL,
      "pulse_oximeter",
      "sample.csv",
      "spo2,pulse\n98,72\n97,70\n",
    );
    expect(care.wearableReadings.length).toBeGreaterThanOrEqual(2);
    expect(care.wearableReadings[0].source).toBe("upload");
  });

  it("appends continuous ticks without flooding notifications", () => {
    unlockWearableDevice(EMAIL, "cgm");
    setWearableSyncMode(EMAIL, "cgm", "continuous");
    const before = getPatientCare(EMAIL).notifications.length;
    appendContinuousTick(EMAIL, "cgm");
    appendContinuousTick(EMAIL, "cgm");
    const after = getPatientCare(EMAIL);
    expect(after.wearableReadings.filter((r) => r.source === "continuous").length).toBeGreaterThanOrEqual(2);
    expect(after.notifications.length - before).toBeLessThanOrEqual(1);
  });

  it("updates body profile height/weight and BMI inputs", () => {
    updateVitalsProfile(EMAIL, { heightCm: 180, weightLb: 200, targetWeightLb: 180 });
    const profile = getPatientCare(EMAIL).bodyProfile || emptyBodyProfile();
    expect(profile.heightCm).toBe(180);
    expect(profile.weightLb).toBe(200);
    expect(computeBmi(profile.heightCm, profile.weightLb)).toBeTruthy();
    upsertBodyGoal(EMAIL, {
      title: "Reach 180 lb",
      metric: "weight",
      targetValue: 180,
      unit: "lb",
    });
    expect(getPatientCare(EMAIL).bodyGoals[0].currentValue).toBe(200);
  });

  it("links purchases by product name hints", () => {
    linkMarketplacePurchaseToWearables(EMAIL, [{ name: "Dexcom G7 CGM Kit" }]);
    expect(getPatientCare(EMAIL).wearableDevices.find((d) => d.id === "cgm")?.owned).toBe(true);
  });
});

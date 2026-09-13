import { beforeEach, describe, expect, it } from "vitest";
import { isMasterEmail, MASTER_EMAILS } from "@/lib/masterAccount";
import { bootstrapMasterCare, getPatientCare } from "@/lib/patientCareStore";

beforeEach(() => {
  localStorage.clear();
});

describe("master account", () => {
  it("recognizes the master email", () => {
    expect(MASTER_EMAILS).toContain("wbmerrick@gmail.com");
    expect(isMasterEmail("wbmerrick@gmail.com")).toBe(true);
    expect(isMasterEmail("WBMerrick@gmail.com")).toBe(true);
    expect(isMasterEmail("other@example.com")).toBe(false);
  });

  it("unlocks the full wearable rack for master", () => {
    bootstrapMasterCare("wbmerrick@gmail.com");
    const care = getPatientCare("wbmerrick@gmail.com");
    expect(care.wearableDevices.length).toBeGreaterThan(5);
    expect(care.wearableDevices.every((d) => d.owned)).toBe(true);
    expect(care.bodyProfile.heightCm).toBeTruthy();
    expect(care.bodyGoals.length).toBeGreaterThan(0);
  });

  it("does not unlock wearables for non-master emails", () => {
    bootstrapMasterCare("other@example.com");
    const care = getPatientCare("other@example.com");
    expect(care.wearableDevices.every((d) => d.owned)).toBe(false);
    expect(care.bodyProfile.heightCm).toBeFalsy();
  });
});

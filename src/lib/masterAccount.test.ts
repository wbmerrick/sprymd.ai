import { beforeEach, describe, expect, it } from "vitest";
import {
  isClinicianEmail,
  isMasterEmail,
  isOwnerEmail,
  isStaffAllowlistEmail,
  MASTER_EMAILS,
  OWNER_EMAILS,
  STAFF_EMAILS,
} from "@/lib/masterAccount";
import { bootstrapMasterCare, getPatientCare } from "@/lib/patientCareStore";

beforeEach(() => {
  localStorage.clear();
});

describe("master / staff roles", () => {
  it("treats wbmerrick@sprymd.ai as owner/master", () => {
    expect(OWNER_EMAILS).toContain("wbmerrick@sprymd.ai");
    expect(MASTER_EMAILS).toContain("wbmerrick@sprymd.ai");
    expect(isOwnerEmail("wbmerrick@sprymd.ai")).toBe(true);
    expect(isMasterEmail("wbmerrick@sprymd.ai")).toBe(true);
    expect(isClinicianEmail("wbmerrick@sprymd.ai")).toBe(true);
  });

  it("treats staff@sprymd.ai as staff clinician, not owner", () => {
    expect(STAFF_EMAILS).toContain("staff@sprymd.ai");
    expect(isStaffAllowlistEmail("staff@sprymd.ai")).toBe(true);
    expect(isClinicianEmail("staff@sprymd.ai")).toBe(true);
    expect(isOwnerEmail("staff@sprymd.ai")).toBe(false);
    expect(isMasterEmail("staff@sprymd.ai")).toBe(false);
  });

  it("unlocks the full wearable rack for owner", () => {
    bootstrapMasterCare("wbmerrick@sprymd.ai");
    const care = getPatientCare("wbmerrick@sprymd.ai");
    expect(care.wearableDevices.length).toBeGreaterThan(5);
    expect(care.wearableDevices.every((d) => d.owned)).toBe(true);
  });

  it("does not unlock wearables for non-owner emails", () => {
    bootstrapMasterCare("other@example.com");
    const care = getPatientCare("other@example.com");
    expect(care.wearableDevices.every((d) => d.owned)).toBe(false);
  });
});

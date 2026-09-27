import { describe, expect, it } from "vitest";
import {
  isMasterDashboardEmail,
  isStaffDashboardEmail,
  postAuthDashboardPath,
} from "@/lib/dashboardRole";

describe("dashboardRole", () => {
  it("routes owner to /master", () => {
    expect(postAuthDashboardPath("wbmerrick@sprymd.ai")).toBe("/master");
    expect(isMasterDashboardEmail("wbmerrick@sprymd.ai")).toBe(true);
  });

  it("routes staff to /staff", () => {
    expect(postAuthDashboardPath("staff@sprymd.ai")).toBe("/staff");
    expect(isStaffDashboardEmail("staff@sprymd.ai")).toBe(true);
    expect(isMasterDashboardEmail("staff@sprymd.ai")).toBe(false);
  });

  it("routes patients to /dashboard", () => {
    expect(postAuthDashboardPath("patient@example.com")).toBe("/dashboard");
    expect(isStaffDashboardEmail("patient@example.com")).toBe(false);
  });
});

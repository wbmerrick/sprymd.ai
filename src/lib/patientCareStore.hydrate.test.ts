import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/patientCareRemote", () => ({
  migrateLegacyLocalCare: vi.fn(async () => null),
  fetchPatientCareFromDb: vi.fn(async (email: string) => ({
    email,
    treatments: [
      {
        id: "t1",
        medicationName: "Test Rx",
        dosage: "1mg",
        goal: "Feel better",
        category: "Protocol",
        startDate: "2026-01-01",
        status: "active",
        refillsRemaining: 1,
        sideEffects: [],
      },
    ],
    notifications: [],
    shipments: [],
    subscriptions: [],
    messages: [],
    transactions: [],
    clinicalCases: [],
    wearableDevices: [],
    wearableReadings: [],
    bodyProfile: { heightCm: null, weightLb: null, targetWeightLb: null, updatedAt: "" },
    bodyGoals: [],
    updatedAt: new Date().toISOString(),
  })),
  persistPatientCareToDb: vi.fn(async () => ({ ok: true })),
  fetchClinicalCasesForReview: vi.fn(async () => []),
  updateClinicalCaseStatus: vi.fn(async () => undefined),
  resolvePatientId: vi.fn(async () => "p1"),
}));

import { buildDashboardForEmail, getPatientCare, hydratePatientCare } from "@/lib/patientCareStore";

describe("patientCareStore hydrate", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydratePatientCare fills memory cache used by getPatientCare", async () => {
    const remote = await hydratePatientCare("patient@example.com");
    expect(remote.treatments[0]?.medicationName).toBe("Test Rx");
    expect(getPatientCare("patient@example.com").treatments[0]?.medicationName).toBe("Test Rx");
    const dash = buildDashboardForEmail("patient@example.com");
    expect(dash?.treatments[0]?.medicationName).toBe("Test Rx");
  });

  it("does not leave sprymd_patient_care_v1 after hydrate", async () => {
    await hydratePatientCare("patient@example.com");
    expect(localStorage.getItem("sprymd_patient_care_v1")).toBeNull();
  });
});

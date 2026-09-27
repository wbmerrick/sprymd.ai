import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
const authGetSession = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: (...args: unknown[]) => authGetSession(...args) },
    from: (...args: unknown[]) => fromMock(...args),
    rpc: vi.fn(async () => ({ data: null, error: null })),
  },
}));

import { migrateLegacyLocalCare, resolvePatientId } from "@/lib/patientCareRemote";

function chain(result: { data: unknown; error: null }) {
  const api: Record<string, unknown> = {};
  const self = new Proxy(api, {
    get(target, prop) {
      if (prop === "then") return undefined;
      if (prop === "maybeSingle" || prop === "single") return async () => result;
      target[prop as string] = vi.fn(() => self);
      return target[prop as string];
    },
  });
  return self;
}

describe("patientCareRemote", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authGetSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
  });

  it("resolvePatientId uses auth user_id", async () => {
    fromMock.mockReturnValue(chain({ data: { id: "patient-1" }, error: null }));
    await expect(resolvePatientId("a@example.com")).resolves.toBe("patient-1");
  });

  it("migrateLegacyLocalCare clears local key after upsert path when patient exists", async () => {
    localStorage.setItem(
      "sprymd_patient_care_v1",
      JSON.stringify({
        "a@example.com": {
          email: "a@example.com",
          treatments: [],
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
        },
      }),
    );

    // resolvePatientId → patients select; persist hits many from() calls — stub broadly
    fromMock.mockImplementation(() =>
      chain({ data: { id: "patient-1" }, error: null }),
    );

    const legacy = await migrateLegacyLocalCare("a@example.com");
    expect(legacy?.email).toBe("a@example.com");
    expect(localStorage.getItem("sprymd_patient_care_v1")).toBeNull();
  });
});

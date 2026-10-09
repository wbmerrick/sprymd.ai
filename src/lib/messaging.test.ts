import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  MESSAGE_URGENCY_OPTIONS,
  normalizeUrgency,
  sortThreadsByUrgency,
  toUiThreadStatus,
  createStaffOutboundThread,
  listPatientContacts,
} from "@/lib/messaging";

const rpc = vi.fn();
const from = vi.fn();
const getSession = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: (...args: unknown[]) => getSession(...args) },
    rpc: (...args: unknown[]) => rpc(...args),
    from: (...args: unknown[]) => from(...args),
  },
}));

vi.mock("@/lib/masterAccount", () => ({
  isClinicianEmail: () => true,
}));

vi.mock("@/lib/hipaaCompliance", () => ({
  logPhiAccess: vi.fn(),
}));

describe("toUiThreadStatus", () => {
  it("flags awaiting_staff as action_required for chips", () => {
    expect(toUiThreadStatus("awaiting_staff")).toBe("action_required");
  });

  it("flags awaiting_patient / unread as action_required", () => {
    expect(toUiThreadStatus("awaiting_patient")).toBe("action_required");
    expect(toUiThreadStatus("open", true)).toBe("action_required");
  });

  it("maps closed/open without unread to no_action", () => {
    expect(toUiThreadStatus("closed")).toBe("no_action");
    expect(toUiThreadStatus("open", false)).toBe("no_action");
  });
});

describe("message urgency", () => {
  it("exposes three selectable urgency levels", () => {
    expect(MESSAGE_URGENCY_OPTIONS.map((o) => o.value)).toEqual(["routine", "soon", "urgent"]);
  });

  it("normalizes unknown values to routine", () => {
    expect(normalizeUrgency("bogus")).toBe("routine");
    expect(normalizeUrgency("urgent")).toBe("urgent");
  });

  it("sorts urgent before soon before routine", () => {
    const sorted = sortThreadsByUrgency([
      { urgency: "routine" as const, updatedAt: "2026-01-03T00:00:00Z", id: "r" },
      { urgency: "urgent" as const, updatedAt: "2026-01-01T00:00:00Z", id: "u" },
      { urgency: "soon" as const, updatedAt: "2026-01-02T00:00:00Z", id: "s" },
    ]);
    expect(sorted.map((t) => t.id)).toEqual(["u", "s", "r"]);
  });
});

describe("staff outbound / contacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "wbm22@sprymd.ai" } } },
    });
    // ensureProviderRow path: providers select → existing row
    from.mockImplementation((table: string) => {
      if (table === "providers") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: "prov-1" }, error: null }),
            }),
          }),
        };
      }
      if (table === "patients") {
        return {
          select: () => ({
            order: async () => ({
              data: [
                {
                  id: "pat-1",
                  email: "jane@example.com",
                  full_name: "Jane Doe",
                  phone: "",
                  state_of_residence: "TN",
                  created_at: "2026-01-01T00:00:00Z",
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "message_threads") {
        return {
          select: () => ({
            neq: () => ({
              order: async () => ({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
          order: async () => ({ data: [], error: null }),
        }),
      };
    });
  });

  it("lists patient contacts for staff", async () => {
    const contacts = await listPatientContacts();
    expect(contacts).toHaveLength(1);
    expect(contacts[0]).toMatchObject({
      id: "pat-1",
      email: "jane@example.com",
      fullName: "Jane Doe",
      openThreadCount: 0,
    });
  });

  it("creates outbound threads via RPC", async () => {
    rpc.mockResolvedValue({ data: "thr-99", error: null });
    const result = await createStaffOutboundThread({
      patientId: "pat-1",
      subject: "Lab results",
      body: "Your labs look good.",
      urgency: "routine",
    });
    expect(result).toEqual({ ok: true, threadId: "thr-99" });
    expect(rpc).toHaveBeenCalledWith(
      "create_staff_outbound_thread",
      expect.objectContaining({
        p_patient_id: "pat-1",
        p_body: "Your labs look good.",
      }),
    );
  });
});

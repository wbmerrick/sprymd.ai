import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
const rpcMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
    rpc: (...args: unknown[]) => rpcMock(...args),
  },
}));

describe("bootstrapClinicalPatient", () => {
  beforeEach(() => {
    fromMock.mockReset();
    rpcMock.mockReset();
  });

  it("returns existing patient for user_id via claim RPC when already linked", async () => {
    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { id: "p-existing" }, error: null }),
        }),
      }),
    });
    rpcMock.mockResolvedValueOnce({ data: "p-existing", error: null });

    const { bootstrapClinicalPatient } = await import("./bootstrapClinicalPatient");
    const result = await bootstrapClinicalPatient({
      userId: "u1",
      email: "a@b.com",
    });
    expect(result).toEqual({ patientId: "p-existing", linkedGuest: false });
  });

  it("claims a guest row through claim_or_create_patient", async () => {
    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    });
    rpcMock.mockResolvedValueOnce({ data: "guest-1", error: null });

    const { bootstrapClinicalPatient } = await import("./bootstrapClinicalPatient");
    const result = await bootstrapClinicalPatient({
      userId: "u1",
      email: "guest@example.com",
      fullName: "Guest",
    });
    expect(result).toEqual({ patientId: "guest-1", linkedGuest: true });
    expect(rpcMock).toHaveBeenCalledWith(
      "claim_or_create_patient",
      expect.objectContaining({ p_email: "guest@example.com" }),
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

describe("bootstrapClinicalPatient", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("returns existing patient for user_id", async () => {
    fromMock.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { id: "p-existing" }, error: null }),
        }),
      }),
    });
    const { bootstrapClinicalPatient } = await import("./bootstrapClinicalPatient");
    const result = await bootstrapClinicalPatient({
      userId: "u1",
      email: "a@b.com",
    });
    expect(result).toEqual({ patientId: "p-existing", linkedGuest: false });
  });

  it("links a guest row (null user_id) to the auth user", async () => {
    fromMock
      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: () => ({
          ilike: () => ({
            maybeSingle: async () => ({
              data: { id: "guest-1", user_id: null },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: { id: "guest-1" }, error: null }),
            }),
          }),
        }),
      });

    const { bootstrapClinicalPatient } = await import("./bootstrapClinicalPatient");
    const result = await bootstrapClinicalPatient({
      userId: "u1",
      email: "guest@example.com",
      fullName: "Guest",
    });
    expect(result).toEqual({ patientId: "guest-1", linkedGuest: true });
  });
});

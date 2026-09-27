import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const restoreCustomerSession = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSession(...args),
    },
  },
}));

vi.mock("@/lib/customerAccounts", () => ({
  restoreCustomerSession: (...args: unknown[]) => restoreCustomerSession(...args),
}));

describe("resolveClinicalAuthSession", () => {
  beforeEach(() => {
    getSession.mockReset();
    restoreCustomerSession.mockReset();
  });

  it("returns supabase session when present", async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: "u1", email: "wbmerrick@sprymd.ai" },
        },
      },
    });
    const { resolveClinicalAuthSession } = await import("@/lib/clinicalSession");
    await expect(resolveClinicalAuthSession()).resolves.toEqual({
      email: "wbmerrick@sprymd.ai",
      userId: "u1",
    });
    expect(restoreCustomerSession).not.toHaveBeenCalled();
  });

  it("rejects local-only restore without supabase session", async () => {
    getSession
      .mockResolvedValueOnce({ data: { session: null } })
      .mockResolvedValueOnce({ data: { session: null } });
    restoreCustomerSession.mockResolvedValue({
      email: "wbmerrick@gmail.com",
      authProvider: "local",
    });
    const { resolveClinicalAuthSession } = await import("@/lib/clinicalSession");
    await expect(resolveClinicalAuthSession()).resolves.toBeNull();
  });
});

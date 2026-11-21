import { beforeEach, describe, expect, it, vi } from "vitest";

const isLocalAccountFallbackEnabled = vi.fn();
const localAuthDisabledError = vi.fn((action?: string) => {
  const err = new Error(`${action || "Local account"} disabled`) as Error & {
    code?: string;
  };
  err.code = "local_auth_disabled";
  return err;
});

vi.mock("@/lib/localAccountGate", () => ({
  isLocalAccountFallbackEnabled: (...args: unknown[]) =>
    isLocalAccountFallbackEnabled(...args),
  localAuthDisabledError: (...args: unknown[]) =>
    localAuthDisabledError(...(args as [string?])),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

vi.mock("@/lib/masterAccount", () => ({
  isMasterEmail: () => false,
  isClinicianEmail: () => false,
}));

describe("customerAccounts local fallback gate", () => {
  beforeEach(() => {
    localStorage.clear();
    isLocalAccountFallbackEnabled.mockReset();
    localAuthDisabledError.mockClear();
  });

  it("registerLocalAccount throws in production (gate off)", async () => {
    isLocalAccountFallbackEnabled.mockReturnValue(false);
    const { registerLocalAccount } = await import("@/lib/customerAccounts");
    await expect(
      registerLocalAccount({
        email: "pat@example.com",
        password: "password123",
        name: "Pat",
        dob: "1990-01-01",
      }),
    ).rejects.toMatchObject({ code: "local_auth_disabled" });
  });

  it("registerLocalAccount works when gate allows (dev/demo)", async () => {
    isLocalAccountFallbackEnabled.mockReturnValue(true);
    const { registerLocalAccount, getStoredAccount } = await import(
      "@/lib/customerAccounts"
    );
    const profile = await registerLocalAccount({
      email: "demo@example.com",
      password: "password123",
      name: "Demo",
      dob: "1990-01-01",
    });
    expect(profile.email).toBe("demo@example.com");
    expect(getStoredAccount("demo@example.com")?.passwordHash).toBeTruthy();
  });

  it("signInLocalAccount throws when gate is off", async () => {
    isLocalAccountFallbackEnabled.mockReturnValue(false);
    const { signInLocalAccount } = await import("@/lib/customerAccounts");
    await expect(
      signInLocalAccount({
        email: "pat@example.com",
        password: "password123",
      }),
    ).rejects.toMatchObject({ code: "local_auth_disabled" });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Flags are computed at module-evaluation time, so each test resets the
 * module registry, stubs env, and dynamically re-imports the module.
 */
const FLAG_ENV_VARS = [
  "VITE_CRYPTO_PAYMENTS_ENABLED",
  "VITE_FEATURE_WEIGHT_LOSS",
  "VITE_FEATURE_MESSAGING",
  "VITE_FEATURE_REFILLS",
] as const;

const loadFlags = () => import("@/lib/flags");

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  for (const name of FLAG_ENV_VARS) {
    vi.stubEnv(name, "");
  }
});

describe("flags", () => {
  it("defaults every flag to off when env vars are unset", async () => {
    const { flags } = await loadFlags();
    expect(flags).toEqual({
      cryptoPayments: false,
      weightLossLine: false,
      messaging: false,
      refills: false,
    });
  });

  it("enables a flag only when its env var is exactly \"true\"", async () => {
    vi.stubEnv("VITE_FEATURE_MESSAGING", "true");
    const { flags } = await loadFlags();
    expect(flags.messaging).toBe(true);
    expect(flags.cryptoPayments).toBe(false);
    expect(flags.weightLossLine).toBe(false);
    expect(flags.refills).toBe(false);
  });

  it("treats truthy-looking variants as off (strict parsing)", async () => {
    vi.stubEnv("VITE_CRYPTO_PAYMENTS_ENABLED", "TRUE");
    vi.stubEnv("VITE_FEATURE_WEIGHT_LOSS", "1");
    vi.stubEnv("VITE_FEATURE_MESSAGING", "yes");
    vi.stubEnv("VITE_FEATURE_REFILLS", " true");
    const { flags } = await loadFlags();
    expect(flags.cryptoPayments).toBe(false);
    expect(flags.weightLossLine).toBe(false);
    expect(flags.messaging).toBe(false);
    expect(flags.refills).toBe(false);
  });

  it("maps each flag to its own env var independently", async () => {
    vi.stubEnv("VITE_CRYPTO_PAYMENTS_ENABLED", "true");
    vi.stubEnv("VITE_FEATURE_REFILLS", "true");
    const { flags } = await loadFlags();
    expect(flags.cryptoPayments).toBe(true);
    expect(flags.refills).toBe(true);
    expect(flags.weightLossLine).toBe(false);
    expect(flags.messaging).toBe(false);
  });
});

describe("getFlag", () => {
  it("returns the same value as the flags map for every flag", async () => {
    vi.stubEnv("VITE_FEATURE_WEIGHT_LOSS", "true");
    const { flags, getFlag } = await loadFlags();
    for (const name of Object.keys(flags) as (keyof typeof flags)[]) {
      expect(getFlag(name)).toBe(flags[name]);
    }
  });

  it("reflects an enabled flag", async () => {
    vi.stubEnv("VITE_FEATURE_REFILLS", "true");
    const { getFlag } = await loadFlags();
    expect(getFlag("refills")).toBe(true);
    expect(getFlag("messaging")).toBe(false);
  });
});

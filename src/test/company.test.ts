import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * COMPANY is computed at module-evaluation time, so each test resets the
 * module registry, stubs env, and dynamically re-imports the module.
 */
const COMPANY_ENV_VARS = [
  "VITE_COMPANY_LEGAL_NAME",
  "VITE_COMPANY_ADDRESS_LINE1",
  "VITE_COMPANY_ADDRESS_LINE2",
  "VITE_COMPANY_CITY",
  "VITE_COMPANY_STATE",
  "VITE_COMPANY_ZIP",
  "VITE_COMPANY_PHONE",
  "VITE_CONTACT_EMAIL",
  "VITE_PRIVACY_EMAIL",
  "VITE_PAYMENT_STATEMENT_DESCRIPTOR",
] as const;

const loadCompany = () => import("@/lib/company");

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  for (const name of COMPANY_ENV_VARS) {
    vi.stubEnv(name, "");
  }
});

describe("COMPANY", () => {
  it("falls back to defaults and visible placeholders when env vars are unset", async () => {
    const { COMPANY } = await loadCompany();
    expect(COMPANY.legalName).toBe("SpryMD, PLLC");
    expect(COMPANY.addressLine1).toBe("[Street address — pending]");
    expect(COMPANY.city).toBe("Nashville");
    expect(COMPANY.state).toBe("TN");
    expect(COMPANY.zip).toBe("[ZIP — pending]");
    expect(COMPANY.phone).toBe("[Phone — pending]");
    expect(COMPANY.email).toBe("care@sprymd.ai");
    expect(COMPANY.privacyEmail).toBe("privacy@sprymd.ai");
    expect(COMPANY.billingDescriptor).toBe("SPRYMD");
  });

  it("uses env overrides when provided", async () => {
    vi.stubEnv("VITE_COMPANY_LEGAL_NAME", "Acme Health, PLLC");
    vi.stubEnv("VITE_COMPANY_ADDRESS_LINE1", "123 Main St, Suite 4");
    vi.stubEnv("VITE_COMPANY_PHONE", "(615) 555-0100");
    vi.stubEnv("VITE_CONTACT_EMAIL", "hello@acme.health");
    vi.stubEnv("VITE_PRIVACY_EMAIL", "privacy@acme.health");
    vi.stubEnv("VITE_PAYMENT_STATEMENT_DESCRIPTOR", "ACMEHEALTH");
    const { COMPANY } = await loadCompany();
    expect(COMPANY.legalName).toBe("Acme Health, PLLC");
    expect(COMPANY.addressLine1).toBe("123 Main St, Suite 4");
    expect(COMPANY.phone).toBe("(615) 555-0100");
    expect(COMPANY.email).toBe("hello@acme.health");
    expect(COMPANY.privacyEmail).toBe("privacy@acme.health");
    expect(COMPANY.billingDescriptor).toBe("ACMEHEALTH");
  });
});

describe("COMPANY_CITY_STATE_ZIP", () => {
  it("composes City, ST ZIP from the individual parts", async () => {
    vi.stubEnv("VITE_COMPANY_CITY", "Memphis");
    vi.stubEnv("VITE_COMPANY_STATE", "TN");
    vi.stubEnv("VITE_COMPANY_ZIP", "38103");
    const { COMPANY_CITY_STATE_ZIP } = await loadCompany();
    expect(COMPANY_CITY_STATE_ZIP).toBe("Memphis, TN 38103");
  });

  it("uses VITE_COMPANY_ADDRESS_LINE2 verbatim when provided", async () => {
    vi.stubEnv("VITE_COMPANY_ADDRESS_LINE2", "Nashville, TN 37201-1234");
    vi.stubEnv("VITE_COMPANY_CITY", "Memphis");
    const { COMPANY_CITY_STATE_ZIP } = await loadCompany();
    expect(COMPANY_CITY_STATE_ZIP).toBe("Nashville, TN 37201-1234");
  });

  it("composes from defaults (with placeholder ZIP) when nothing is set", async () => {
    const { COMPANY_CITY_STATE_ZIP } = await loadCompany();
    expect(COMPANY_CITY_STATE_ZIP).toBe("Nashville, TN [ZIP — pending]");
  });
});

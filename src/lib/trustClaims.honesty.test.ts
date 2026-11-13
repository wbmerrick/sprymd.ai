import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { COMPLIANCE } from "@/config/compliance";

const root = process.cwd();

/** Marketing / auth surfaces that must not overclaim HIPAA certification. */
const PATIENT_FACING = [
  "src/SpryApp.jsx",
  "src/pages/FAQ.tsx",
  "src/pages/About.tsx",
  "src/pages/Index.tsx",
  "src/pages/Checkout.tsx",
  "src/pages/Confirmed.tsx",
  "src/pages/CashPayCheckout.tsx",
  "src/components/TrustBadges.tsx",
  "src/footerPages.js",
];

describe("trust claims honesty (P0-8)", () => {
  it("keeps the HIPAA-compliant marketing badge flag off", () => {
    expect(COMPLIANCE.HIPAA_COMPLIANT).toBe(false);
    expect(COMPLIANCE.CLINICIAN_REVIEW).toBe(true);
    expect(COMPLIANCE.SECURE_CHECKOUT).toBe(true);
  });

  it("removes the sign-in HIPAA-COMPLIANT · ENCRYPTED badge", () => {
    const src = readFileSync(join(root, "src/SpryApp.jsx"), "utf8");
    expect(src).not.toMatch(/HIPAA-COMPLIANT\s*·\s*ENCRYPTED\s*·\s*PER-CUSTOMER/);
    expect(src).toMatch(/SECURE CONNECTION\s*·\s*CLINICIAN REVIEW\s*·\s*PRIVATE ACCOUNT/);
  });

  it("does not ship overstated HIPAA / encryption marketing copy", () => {
    for (const rel of PATIENT_FACING) {
      const src = readFileSync(join(root, rel), "utf8");
      expect(src, rel).not.toMatch(/HIPAA-COMPLIANT/i);
      expect(src, rel).not.toMatch(/HIPAA-Compliant Platform/);
      expect(src, rel).not.toMatch(/HIPAA-Secure/i);
      expect(src, rel).not.toMatch(/HIPAA Secure/i);
      expect(src, rel).not.toMatch(/HIPAA Encrypted/i);
      expect(src, rel).not.toMatch(/HIPAA-compliant encryption/i);
      expect(src, rel).not.toMatch(/HIPAA-compliant practice/i);
      expect(src, rel).not.toMatch(/HIPAA-oriented/i);
      expect(src, rel).not.toMatch(/HIPAA-compliant infrastructure/i);
      expect(src, rel).not.toMatch(/stored on encrypted servers/i);
      expect(src, rel).not.toMatch(/100% Confidential/);
    }
  });

  it("TrustBadges uses secure-transport / clinician-review labels", () => {
    const src = readFileSync(join(root, "src/components/TrustBadges.tsx"), "utf8");
    expect(src).toMatch(/Secure Stripe checkout/);
    expect(src).toMatch(/Licensed clinician review/);
    expect(src).toMatch(/Discreet by design/);
  });
});

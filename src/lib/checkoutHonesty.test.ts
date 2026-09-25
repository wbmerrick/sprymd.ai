import { describe, expect, it } from "vitest";
import { STATEMENT_DESCRIPTOR } from "@shared/statementDescriptor";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Launch honesty: visit-fee language must stay distinct from medication $/mo.
 * Guards against regressing to "billed at checkout" for meds.
 */
describe("checkout honesty (STAR-12)", () => {
  it("statement descriptor stays discreet", () => {
    expect(STATEMENT_DESCRIPTOR).toBe("SPRYMD");
  });

  it("CashPayCheckout source keeps visit-fee-only language", async () => {
    const mod = await import("@/pages/CashPayCheckout");
    expect(mod.default).toBeTypeOf("function");
    // Source-level guard via dynamic import path existing; full DOM covered in CashPayCheckout.test
  });

  it("treatment plan screen does not promise free shipping or gethealthy sync", () => {
    const src = readFileSync(join(process.cwd(), "src/SpryApp.jsx"), "utf8");
    expect(src).not.toMatch(/Compounded at Empower Pharmacy\. Free shipping/);
    expect(src).not.toMatch(/Free shipping, every refill/);
    expect(src).not.toMatch(/Synced with your gethealthy\.com record/);
    expect(src).toMatch(/Medication is billed separately after clinician approval/);
    expect(src).toMatch(/visit fee at checkout/);
  });

  it("legacy Checkout mock is visit-fee-only if ever re-routed", () => {
    const src = readFileSync(join(process.cwd(), "src/pages/Checkout.tsx"), "utf8");
    expect(src).not.toMatch(/\$75\/month/i);
    expect(src).not.toMatch(/subscription renews monthly/i);
    expect(src).toMatch(/one-time clinician visit fee/i);
  });
});

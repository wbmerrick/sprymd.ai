import { describe, expect, it } from "vitest";
import { STATEMENT_DESCRIPTOR } from "@shared/statementDescriptor";
import { EVALUATION_FEE_COPY } from "@/data/program";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Launch honesty: evaluation fee language must stay distinct from selling Rx.
 */
describe("checkout honesty (evaluation fee)", () => {
  it("statement descriptor stays discreet", () => {
    expect(STATEMENT_DESCRIPTOR).toBe("SPRYMD");
  });

  it("approved evaluation framing is defined", () => {
    expect(EVALUATION_FEE_COPY).toMatch(/\$100 physician evaluation/i);
    expect(EVALUATION_FEE_COPY).toMatch(/Full refund if not/i);
  });

  it("bans Rx-sales phrasing across patient-facing surfaces", () => {
    const files = [
      "src/SpryApp.jsx",
      "src/pages/FAQ.tsx",
      "src/pages/CashPayCheckout.tsx",
      "src/data/program.ts",
    ];
    for (const rel of files) {
      const src = readFileSync(join(process.cwd(), rel), "utf8");
      expect(src).not.toMatch(/Buy a prescription/i);
      expect(src).not.toMatch(/\$100 Rx/i);
      expect(src).not.toMatch(/guaranteed prescription/i);
    }
    // compliance-notes.md lists the banned phrases on purpose
    expect(
      readFileSync(join(process.cwd(), "compliance-notes.md"), "utf8"),
    ).toMatch(/Banned phrasing/);
  });

  it("treatment plan screen frames evaluation fee and pharmacy pay", () => {
    const src = readFileSync(join(process.cwd(), "src/SpryApp.jsx"), "utf8");
    expect(src).not.toMatch(/Compounded at Empower Pharmacy\. Free shipping/);
    expect(src).not.toMatch(/Free shipping, every refill/);
    expect(src).toMatch(/\$100 physician evaluation/i);
    expect(src).toMatch(/pay your pharmacy directly/i);
  });

  it("refill flow does not fake Empower API or card capture", () => {
    const src = readFileSync(join(process.cwd(), "src/SpryApp.jsx"), "utf8");
    expect(src).not.toMatch(/Querying Empower medication database/);
    expect(src).not.toMatch(/Pulled live from the Empower medication database/);
    expect(src).not.toMatch(/Pay \$\{total\.toFixed\(2\)\} & e-prescribe/);
    expect(src).toMatch(/Submit refill request/);
    expect(src).toMatch(/NO CARD CHARGE ON THIS STEP/);
  });

  it("legacy Checkout mock is visit-fee-only if ever re-routed", () => {
    const src = readFileSync(join(process.cwd(), "src/pages/Checkout.tsx"), "utf8");
    expect(src).not.toMatch(/\$75\/month/i);
    expect(src).not.toMatch(/subscription renews monthly/i);
    expect(src).toMatch(/one-time clinician visit fee/i);
  });
});

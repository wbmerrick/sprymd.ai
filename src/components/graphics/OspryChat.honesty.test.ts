import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("iSpry soft-launch honesty", () => {
  const src = readFileSync(join(process.cwd(), "src/components/graphics/OspryChat.jsx"), "utf8");

  it("pricing reply describes visit fee, not meds-included monthly", () => {
    expect(src).toMatch(/one-time clinician visit fee/i);
    expect(src).not.toMatch(/Shipping is included when medicine is prescribed/);
    expect(src).not.toMatch(/Plans start at \$49\/mo/);
  });
});

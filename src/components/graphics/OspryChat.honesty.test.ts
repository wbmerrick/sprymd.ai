import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("iSpry evaluation-fee honesty", () => {
  const src = readFileSync(join(process.cwd(), "src/components/graphics/OspryChat.jsx"), "utf8");

  it("pricing reply describes $100 evaluation and pharmacy-direct med pay", () => {
    expect(src).toMatch(/\$100 physician evaluation/i);
    expect(src).toMatch(/pay your pharmacy directly/i);
    expect(src).not.toMatch(/Shipping is included when medicine is prescribed/);
    expect(src).not.toMatch(/Plans start at \$49\/mo/);
    expect(src).not.toMatch(/Buy a prescription/i);
  });

  it("matches cost questions before generic how-it-works", () => {
    const priceIdx = src.indexOf('q.includes("price")');
    const howIdx = src.indexOf('q.includes("how")');
    expect(priceIdx).toBeGreaterThan(-1);
    expect(howIdx).toBeGreaterThan(-1);
    expect(priceIdx).toBeLessThan(howIdx);
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("FAQ evaluation-fee honesty", () => {
  const src = readFileSync(join(process.cwd(), "src/pages/FAQ.tsx"), "utf8");

  it("frames the $100 physician evaluation and pharmacy-direct med pay", () => {
    expect(src).toMatch(/\$100 physician evaluation/i);
    expect(src).toMatch(/pay your pharmacy directly/i);
    expect(src).not.toMatch(/Buy a prescription/i);
    expect(src).not.toMatch(/guaranteed prescription/i);
  });

  it("describes async specialty care and PCP video when needed", () => {
    expect(src).toMatch(/asynchronous chart review/i);
    expect(src).toMatch(/Primary-care \(PCP\) visits may include a live video/i);
    expect(src).not.toMatch(/Live video can be added later when clinically useful/i);
  });
});

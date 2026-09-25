import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("FAQ soft-launch honesty", () => {
  const src = readFileSync(join(process.cwd(), "src/pages/FAQ.tsx"), "utf8");

  it("does not claim medication is included in a monthly visit fee", () => {
    expect(src).not.toMatch(/\$75\/month\s*—\s*includes physician review, prescription/i);
    expect(src).toMatch(/one-time cash-pay clinician visit fee/i);
    expect(src).toMatch(/does not auto-charge medication at checkout/i);
  });

  it("describes async chart review, not required video", () => {
    expect(src).toMatch(/asynchronous/i);
    expect(src).toMatch(/No scheduled appointment or required video call/i);
  });
});

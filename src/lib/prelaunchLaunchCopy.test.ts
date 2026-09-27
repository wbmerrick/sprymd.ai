import { describe, expect, it } from "vitest";
import {
  STATEMENT_DESCRIPTOR,
  STATEMENT_DESCRIPTOR_DISPLAY,
} from "@shared/statementDescriptor";
import { guidance, nextActionLabel } from "@/pages/ops/opsHelpers";

describe("statementDescriptor", () => {
  it("is discreet, Stripe-safe, and matches FAQ display text", () => {
    expect(STATEMENT_DESCRIPTOR).toBe("SPRYMD");
    expect(STATEMENT_DESCRIPTOR_DISPLAY).toBe(STATEMENT_DESCRIPTOR);
    expect(STATEMENT_DESCRIPTOR.length).toBeGreaterThan(0);
    expect(STATEMENT_DESCRIPTOR.length).toBeLessThanOrEqual(22);
    expect(/[A-Za-z]/.test(STATEMENT_DESCRIPTOR)).toBe(true);
    expect(/ED|erectile|tadalafil|sildenafil/i.test(STATEMENT_DESCRIPTOR)).toBe(
      false,
    );
  });
});

describe("ops async launch copy", () => {
  it("routes paid cases to chart review, not video-first", () => {
    expect(nextActionLabel({ status: "paid", providerId: null })).toMatch(
      /claim & review/i,
    );
    expect(
      nextActionLabel({ status: "paid", providerId: "p1" }),
    ).toMatch(/review chart/i);
    const tip = guidance("paid", false);
    expect(tip.title).toMatch(/claim this case, then review/i);
    expect(tip.body).toMatch(/refund|pharmacy/i);
  });
});

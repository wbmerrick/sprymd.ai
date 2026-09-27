import { describe, expect, it } from "vitest";
import {
  canProceedToPayment,
  complianceBlockReason,
} from "../../shared/complianceGate";

describe("compliance gate", () => {
  const ready = {
    cashPayTermsAccepted: true,
    telehealthLimitationsAcknowledged: true,
    physicalState: "TN",
  };

  it("blocks payment until both acknowledgements and a licensed state are set", () => {
    expect(
      complianceBlockReason({
        ...ready,
        cashPayTermsAccepted: false,
      }),
    ).toMatch(/cash-pay terms/i);
    expect(
      complianceBlockReason({
        ...ready,
        telehealthLimitationsAcknowledged: false,
      }),
    ).toMatch(/limitations/i);
    expect(
      complianceBlockReason({ ...ready, physicalState: "" }),
    ).toMatch(/physically located/i);
    expect(complianceBlockReason({ ...ready, physicalState: "CA" })).toMatch(
      /not licensed in California/i,
    );
    expect(canProceedToPayment(ready)).toBe(true);
  });
});

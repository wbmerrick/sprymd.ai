import { describe, it, expect } from "vitest";
import { CASH_PAY_PLANS, generateCashPayReceipt } from "@/lib/stripeBilling";
import { logPhiAccess, getPhiAuditLogs, sanitizePhiForTelemetry } from "@/lib/hipaaCompliance";
import { hasUsablePreferredPharmacy } from "@/lib/pharmacyFulfillment";
import { fees, EVALUATION_FEE_COPY } from "@/data/program";

describe("HIPAA Compliance & Security", () => {
  it("sanitizes PHI fields for telemetry and external monitoring", () => {
    const rawData = {
      patientName: "John Doe",
      email: "john@example.com",
      phone: "615-555-0199",
      conditions: ["High Blood Pressure"],
      systemStatus: "healthy",
      timestamp: "2026-09-21T00:00:00Z",
    };

    const sanitized = sanitizePhiForTelemetry(rawData);
    expect(sanitized.patientName).toBe("[REDACTED_PHI]");
    expect(sanitized.email).toBe("[REDACTED_PHI]");
    expect(sanitized.phone).toBe("[REDACTED_PHI]");
    expect(sanitized.systemStatus).toBe("healthy");
  });

  it("creates immutable audit entries for PHI access", () => {
    const entry = logPhiAccess({
      actorId: "test_doc_1",
      actorRole: "clinician",
      actorEmail: "dr.smith@sprymd.ai",
      action: "view_chart",
      patientId: "patient_123@sprymd.ai",
      resourceType: "clinical_case",
      resourceId: "case_abc",
    });

    expect(entry.id).toContain("audit_");
    expect(entry.action).toBe("view_chart");
    const logs = getPhiAuditLogs({ patientId: "patient_123@sprymd.ai" });
    expect(logs.length).toBeGreaterThan(0);
  });
});

describe("Evaluation fee (not medication billing)", () => {
  it("charges $100 physician evaluation only", () => {
    expect(fees.evaluation).toBe(10000);
    expect(EVALUATION_FEE_COPY).toMatch(/physician evaluation/i);
    expect(EVALUATION_FEE_COPY).not.toMatch(/guaranteed prescription/i);
  });

  it("legacy cash-pay plan catalog still exports for archived receipts", () => {
    expect(CASH_PAY_PLANS.pcp.priceMonthly).toBe(120);
    const receipt = generateCashPayReceipt({
      patientName: "Jane Doe",
      patientEmail: "jane@sprymd.ai",
      planKey: "weightloss",
      cardLast4: "1234",
    });
    expect(receipt.receiptNumber).toContain("SPRY-INV-");
  });
});

describe("Preferred pharmacy", () => {
  it("requires name, phone, and address for e-prescribe handoff", () => {
    expect(
      hasUsablePreferredPharmacy({
        name: "Local Pharmacy",
        phone: "6155550199",
        address: {
          line1: "1 Main St",
          city: "Nashville",
          state: "TN",
          zip: "37201",
        },
        medicationType: "brand_name",
      }),
    ).toBe(true);
    expect(
      hasUsablePreferredPharmacy({
        name: "",
        phone: "615",
        address: { line1: "", city: "", state: "", zip: "" },
        medicationType: "compounded",
      }),
    ).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { CASH_PAY_PLANS, generateCashPayReceipt } from "@/lib/stripeBilling";
import { dispatchPrescriptionToPharmacy, calculateNextBusinessDayDelivery } from "@/lib/pharmacyFulfillment";
import { logPhiAccess, getPhiAuditLogs, sanitizePhiForTelemetry } from "@/lib/hipaaCompliance";

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

describe("Direct Cash-Pay Billing & Stripe Plans", () => {
  it("defines standard 100% cash-pay plans with zero insurance dependencies", () => {
    expect(CASH_PAY_PLANS.pcp.priceMonthly).toBe(120);
    expect(CASH_PAY_PLANS.weightloss.priceMonthly).toBe(200);
    expect(CASH_PAY_PLANS.ed.priceMonthly).toBe(75);
    expect(CASH_PAY_PLANS.lowt.priceMonthly).toBe(99);
  });

  it("generates itemized cash-pay receipts with NPI for HSA/FSA reimbursement", () => {
    const receipt = generateCashPayReceipt({
      patientName: "Jane Doe",
      patientEmail: "jane@sprymd.ai",
      planKey: "weightloss",
      cardLast4: "1234",
    });

    expect(receipt.receiptNumber).toContain("SPRY-INV-");
    expect(receipt.amount).toBe(200);
    expect(receipt.providerDetails.npi).toBe("1982736450");
    expect(receipt.disclaimer).toContain("100% DIRECT CASH-PAY RECEIPT");
  });
});

describe("Pharmacy Fulfillment & Tennessee Next-Day SLA", () => {
  it("calculates next-business-day target dates", () => {
    const target = calculateNextBusinessDayDelivery();
    expect(typeof target).toBe("string");
    expect(target.length).toBe(10);
  });

  it("dispatches approved prescriptions with cold-chain detection", async () => {
    const result = await dispatchPrescriptionToPharmacy({
      patientEmail: "patient@example.com",
      medicationName: "Tirzepatide Injection 10mg",
      dosage: "10mg subQ weekly",
      chilled: true,
    });

    expect(result.success).toBe(true);
    expect(result.coldChainRequired).toBe(true);
    expect(result.carrier).toContain("Cold Chain");
    expect(result.trackingNumber).toBeDefined();
  });
});

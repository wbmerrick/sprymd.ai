import { describe, expect, it } from "vitest";
import { buildCheckoutSessionMetadata } from "../../api/_lib/checkoutSessionMetadata";

describe("buildCheckoutSessionMetadata", () => {
  it("preserves existing keys and defaults empty plan/condition", () => {
    const meta = buildCheckoutSessionMetadata({
      appointmentId: "appt-1",
      patientId: "pat-1",
      serviceTierId: "evaluation",
      source: "sprymd",
    });

    expect(meta).toEqual({
      appointment_id: "appt-1",
      patient_id: "pat-1",
      service_tier_id: "evaluation",
      source: "sprymd",
      condition_id: "",
      plan_id: "",
      treatment_id: "",
    });
  });

  it("adds condition_id, plan_id, and treatment_id from funnel ids", () => {
    const meta = buildCheckoutSessionMetadata({
      appointmentId: "appt-2",
      patientId: "pat-2",
      serviceTierId: "evaluation",
      source: "sprymd",
      conditionId: "ED",
      planId: "tada-daily",
      treatmentId: "tada-daily",
    });

    expect(meta.condition_id).toBe("ed");
    expect(meta.plan_id).toBe("tada-daily");
    expect(meta.treatment_id).toBe("tada-daily");
    // Existing keys unchanged
    expect(meta.appointment_id).toBe("appt-2");
    expect(meta.patient_id).toBe("pat-2");
    expect(meta.service_tier_id).toBe("evaluation");
    expect(meta.source).toBe("sprymd");
  });

  it("maps treatmentId alone into both plan_id and treatment_id", () => {
    const meta = buildCheckoutSessionMetadata({
      serviceTierId: "evaluation",
      conditionId: "weightloss",
      treatmentId: "semaglutide-monthly",
    });

    expect(meta.condition_id).toBe("weightloss");
    expect(meta.plan_id).toBe("semaglutide-monthly");
    expect(meta.treatment_id).toBe("semaglutide-monthly");
    expect(meta.source).toBe("sprymd");
    expect(meta.appointment_id).toBe("");
    expect(meta.patient_id).toBe("");
  });

  it("uses planId when treatmentId is absent", () => {
    const meta = buildCheckoutSessionMetadata({
      serviceTierId: "ispry_membership",
      source: "ispry",
      planId: "ispry_membership",
    });

    expect(meta.plan_id).toBe("ispry_membership");
    expect(meta.treatment_id).toBe("ispry_membership");
    expect(meta.source).toBe("ispry");
  });

  it("exposes a stable key set for Stripe Dashboard / webhook readers", () => {
    const keys = Object.keys(
      buildCheckoutSessionMetadata({ serviceTierId: "evaluation" }),
    ).sort();

    expect(keys).toEqual([
      "appointment_id",
      "condition_id",
      "patient_id",
      "plan_id",
      "service_tier_id",
      "source",
      "treatment_id",
    ]);
  });
});

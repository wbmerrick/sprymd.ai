/**
 * Stripe Checkout Session / PaymentIntent / Subscription metadata for cash-pay.
 *
 * No PHI — ids and product flags only. Keys are snake_case and stable; readers
 * (webhook, reconcile, ops) must treat new keys as optional/additive.
 *
 * Existing keys (unchanged):
 * - appointment_id
 * - patient_id
 * - service_tier_id
 * - source
 *
 * Added (plan/condition handoff):
 * - condition_id  — care catalog condition (e.g. ed, weightloss, pcp)
 * - plan_id       — selected funnel plan id (same as `?plan=` / treatmentId)
 * - treatment_id  — catalog treatment id (same value as plan_id when set)
 *
 * `plan_id` and `treatment_id` are intentionally both set from the request
 * treatment/plan id so Stripe Dashboard and ops can filter by either product
 * language (funnel "plan") or clinical language ("treatment").
 */
export type CheckoutSessionMetadataInput = {
  appointmentId?: string | null;
  patientId?: string | null;
  serviceTierId: string;
  source?: string | null;
  conditionId?: string | null;
  /** Funnel plan id and/or catalog treatment id (same value in current product). */
  planId?: string | null;
  treatmentId?: string | null;
};

export type CheckoutSessionMetadata = {
  appointment_id: string;
  patient_id: string;
  service_tier_id: string;
  source: string;
  condition_id: string;
  plan_id: string;
  treatment_id: string;
};

function trimId(value: string | null | undefined): string {
  return value ? String(value).trim() : "";
}

export function buildCheckoutSessionMetadata(
  input: CheckoutSessionMetadataInput,
): CheckoutSessionMetadata {
  const conditionId = trimId(input.conditionId).toLowerCase();
  // Prefer explicit planId; fall back to treatmentId (client body uses treatmentId).
  const planOrTreatment =
    trimId(input.planId) || trimId(input.treatmentId);
  const treatmentId = trimId(input.treatmentId) || planOrTreatment;

  return {
    appointment_id: trimId(input.appointmentId),
    patient_id: trimId(input.patientId),
    service_tier_id: trimId(input.serviceTierId),
    source: trimId(input.source) || "sprymd",
    condition_id: conditionId,
    plan_id: planOrTreatment,
    treatment_id: treatmentId,
  };
}

/**
 * Thin compatibility shim: the provider data layer was merged into
 * `@/lib/encounters` (single Supabase-first layer with localStorage demo
 * fallback). Provider pages keep importing from this module unchanged.
 */
export {
  PROVIDER_QUEUE_STATES,
  INTAKE_FIELD_LABELS,
  fetchReviewQueue,
  fetchEncounterById,
  updateEncounterCareState,
  formatEncounterRef,
  formatIntakeValue,
} from "@/lib/encounters";

export type {
  Encounter,
  ProviderEncounter,
  IntakeAnswers,
  ServiceLine,
} from "@/lib/encounters";

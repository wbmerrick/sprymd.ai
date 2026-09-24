import {
  NONE_OF_THE_ABOVE,
  conditions,
  getCondition,
  intakes,
  type CompoundField,
  type ConditionId,
  type IntakeQuestion,
  type Treatment,
} from "@/data/careCatalog";
import { isLicensedState, licensedStateNames } from "../../shared/licensedStates";
import { stateName } from "../../shared/usStates";

/**
 * Pure logic for the homepage intake funnel (SpryApp `Intake` + `Plan`).
 * No React, no storage side effects except the explicitly named
 * `*Progress` / `*Selection` helpers, so everything here is unit-testable.
 */

export type IntakeAnswerValue = string | string[];
export type FunnelAnswers = Record<string, IntakeAnswerValue | undefined>;

export const ELIGIBILITY_STATE_KEY = "eligibility_state";
export const ELIGIBILITY_ADULT_KEY = "eligibility_adult";
export const ADULT_YES = "Yes, I'm 18 or older";
export const ADULT_NO = "No, I'm under 18";

export const ELIGIBILITY_STEP: IntakeQuestion = {
  key: "eligibility",
  type: "eligibility",
  title: "Before we start — where are you right now?",
  sub: `SpryMD clinicians are licensed in ${licensedStateNames().join(", ")}. You must be physically located there during your visit and be 18 or older.`,
};

export const CRISIS_LINE_NUMBER = "988";
export const EMERGENCY_NUMBER = "911";

export function isKnownCondition(id: string | null | undefined): id is ConditionId {
  return !!id && id in intakes;
}

/** Eligibility gate first, then the condition's clinical questions. */
export function buildIntakeSteps(conditionId: string | null | undefined): IntakeQuestion[] {
  if (!isKnownCondition(conditionId)) return [];
  return [ELIGIBILITY_STEP, ...intakes[conditionId]];
}

export function listValue(answers: FunnelAnswers, key: string): string[] {
  const value = answers[key];
  return Array.isArray(value) ? value : [];
}

export function textValue(answers: FunnelAnswers, key: string): string {
  const value = answers[key];
  return typeof value === "string" ? value : "";
}

/** Why the visitor cannot be seen, or null when the eligibility answers pass. */
export function eligibilityBlockReason(answers: FunnelAnswers): string | null {
  const adult = textValue(answers, ELIGIBILITY_ADULT_KEY);
  if (adult === ADULT_NO) {
    return "You must be 18 or older to use SpryMD. If you're under 18, please talk with a parent, guardian, or your pediatrician.";
  }
  const state = textValue(answers, ELIGIBILITY_STATE_KEY).trim().toUpperCase();
  if (state && !isLicensedState(state)) {
    const name = stateName(state) ?? state;
    return `SpryMD can't see patients located in ${name} yet. Our clinicians are licensed in ${licensedStateNames().join(", ")}, and telehealth rules require you to be physically there during your visit.`;
  }
  return null;
}

export function eligibilityAnswered(answers: FunnelAnswers): boolean {
  return (
    textValue(answers, ELIGIBILITY_STATE_KEY).trim().length > 0 &&
    textValue(answers, ELIGIBILITY_ADULT_KEY).trim().length > 0
  );
}

/** Validation message for one height/weight field, or null when it is valid. */
export function compoundFieldError(field: CompoundField, raw: string | undefined): string | null {
  const text = (raw ?? "").trim();
  if (!text) return null;
  const value = Number(text);
  if (!Number.isFinite(value)) return `Enter a number for ${field.label.toLowerCase()}.`;
  if (value < field.min || value > field.max) {
    return `Enter a value between ${field.min} and ${field.max} ${field.unit}.`;
  }
  return null;
}

export function compoundComplete(step: IntakeQuestion, answers: FunnelAnswers): boolean {
  return (step.fields ?? []).every((field) => {
    const raw = textValue(answers, field.key).trim();
    return raw.length > 0 && compoundFieldError(field, raw) === null;
  });
}

export function canAdvanceStep(step: IntakeQuestion, answers: FunnelAnswers): boolean {
  switch (step.type) {
    case "eligibility":
      return eligibilityAnswered(answers) && eligibilityBlockReason(answers) === null;
    case "single":
      return textValue(answers, step.key).length > 0;
    case "multi":
      return listValue(answers, step.key).length > 0;
    case "compound":
      return compoundComplete(step, answers);
    default:
      return false;
  }
}

function normalize(option: string): string {
  return option.trim().toLowerCase();
}

/** "None of the above" style answers clear every other selection. */
export function isExclusiveOption(step: IntakeQuestion, option: string): boolean {
  if ((step.exclusive ?? []).some((o) => normalize(o) === normalize(option))) return true;
  return normalize(option) === normalize(NONE_OF_THE_ABOVE);
}

export function toggleMultiOption(step: IntakeQuestion, current: string[], option: string): string[] {
  const checked = current.includes(option);
  if (isExclusiveOption(step, option)) return checked ? [] : [option];
  const withoutExclusive = current.filter((o) => !isExclusiveOption(step, o));
  return checked ? withoutExclusive.filter((o) => o !== option) : [...withoutExclusive, option];
}

function selectedFrom(step: IntakeQuestion, answers: FunnelAnswers, pool: string[] | undefined): string[] {
  if (!pool?.length) return [];
  const selected = step.type === "multi" ? listValue(answers, step.key) : [textValue(answers, step.key)];
  return selected.filter((o) => pool.includes(o));
}

export function stepDisqualifiers(step: IntakeQuestion, answers: FunnelAnswers): string[] {
  return selectedFrom(step, answers, step.disqualify);
}

export function stepCrisisHits(step: IntakeQuestion, answers: FunnelAnswers): string[] {
  return selectedFrom(step, answers, step.crisis);
}

export function stepUrgentHits(step: IntakeQuestion, answers: FunnelAnswers): string[] {
  return selectedFrom(step, answers, step.urgent);
}

export type Disqualifier = { stepKey: string; option: string };

/** First answer that blocks an asynchronous prescription, or null. */
export function findDisqualifier(steps: IntakeQuestion[], answers: FunnelAnswers): Disqualifier | null {
  for (const step of steps) {
    const hit = stepDisqualifiers(step, answers)[0];
    if (hit) return { stepKey: step.key, option: hit };
  }
  return null;
}

export type SafetyFlags = { crisis: boolean; urgent: boolean };

export function safetyFlags(steps: IntakeQuestion[], answers: FunnelAnswers): SafetyFlags {
  return {
    crisis: steps.some((step) => stepCrisisHits(step, answers).length > 0),
    urgent: steps.some((step) => stepUrgentHits(step, answers).length > 0),
  };
}

function pick(conditionId: ConditionId, id: string): Treatment | undefined {
  return conditions[conditionId].treatments.find((t) => t.id === id);
}

/**
 * Which plan the Plan screen leads with. A tier the visitor explicitly chose
 * on the landing page (`treatmentId`) wins unless the intake preference
 * clearly asks for something else.
 */
export function recommendTreatment(conditionId: ConditionId, answers: FunnelAnswers): Treatment {
  const condition = conditions[conditionId];
  let recommended = condition.treatments[0];
  const pref = textValue(answers, "preference");
  const chosen = pick(conditionId, textValue(answers, "treatmentId"));
  const undecided = !pref || /not sure|recommend for me|open to either/i.test(pref);
  if (chosen && undecided) return chosen;

  if (conditionId === "weightloss" && pref) {
    if (pref.includes("Oral")) recommended = pick(conditionId, "tirz-odt") || recommended;
    else if (pref.includes("Injection")) recommended = pick(conditionId, "tirz-mid") || recommended;
  }
  if (conditionId === "ed" && pref) {
    if (pref.includes("Daily")) recommended = pick(conditionId, "tada-daily") || recommended;
    else if (pref.includes("Fast-melt")) recommended = pick(conditionId, "sild-odt") || recommended;
    else if (pref.includes("As needed")) recommended = pick(conditionId, "sild-prn") || recommended;
  }
  if (conditionId === "sermorelin" && pref) {
    if (pref.includes("Sleep-focused")) recommended = pick(conditionId, "serm-gly") || recommended;
    else if (pref.includes("Maximum")) recommended = pick(conditionId, "serm-hi") || recommended;
    else if (pref.includes("Standard")) recommended = pick(conditionId, "serm-std") || recommended;
    else if (listValue(answers, "goal").includes("Deeper sleep")) recommended = pick(conditionId, "serm-gly") || recommended;
  }
  if (conditionId === "nad" && pref) {
    if (pref.includes("Nasal spray")) recommended = pick(conditionId, "nad-spray") || recommended;
    else if (pref.includes("Injection")) recommended = pick(conditionId, "nad-inj") || recommended;
  }
  if (conditionId === "lowt" && pref) {
    const fertility = textValue(answers, "fertility");
    if (/injection/i.test(pref)) recommended = pick(conditionId, "t-cyp") || recommended;
    else if (/oral/i.test(pref)) recommended = pick(conditionId, "enclo") || recommended;
    else if (/cream|topical/i.test(pref)) recommended = pick(conditionId, "t-cream") || recommended;
    else if (fertility.includes("Yes") || fertility.includes("Maybe")) recommended = pick(conditionId, "enclo") || recommended;
  }
  if (conditionId === "mentalhealth" && pref) {
    if (pref.includes("anxiety") && !pref.includes("depression")) recommended = pick(conditionId, "escitalopram") || recommended;
    else if (pref.includes("depression") && !pref.includes("anxiety")) recommended = pick(conditionId, "sertraline") || recommended;
    else if (pref.includes("energy") || pref.includes("sexual")) recommended = pick(conditionId, "bupropion") || recommended;
    else if (pref.includes("gentle")) recommended = pick(conditionId, "buspirone") || recommended;
  }
  if (conditionId === "pcp") {
    if (pref.includes("Yearly")) recommended = pick(conditionId, "pcp-yearly") || recommended;
    else if (pref.includes("Monthly")) recommended = pick(conditionId, "pcp-monthly") || recommended;
    else if (pref.includes("Acute")) recommended = pick(conditionId, "pcp-acute") || recommended;
    else if (chosen) recommended = chosen;
  }
  return recommended;
}

/** Roughly 20 seconds per remaining question, phrased so it visibly counts down. */
export function timeLeftLabel(stepIndex: number, totalSteps: number): string {
  const remaining = Math.max(0, totalSteps - stepIndex);
  if (remaining <= 1) return "Last question";
  const seconds = remaining * 20;
  if (seconds <= 60) return "Under a minute left";
  const minutes = Math.round(seconds / 60);
  return minutes <= 1 ? "About a minute left" : `About ${minutes} minutes left`;
}

/** Sign-up date-of-birth check: a real date, not in the future, 18+. */
export function dobError(dob: string, today: Date = new Date()): string | null {
  if (!dob) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob.trim());
  if (!match) return "Enter your date of birth as YYYY-MM-DD.";
  const [, y, m, d] = match.map(Number);
  const birth = new Date(Date.UTC(y, m - 1, d));
  if (birth.getUTCFullYear() !== y || birth.getUTCMonth() !== m - 1 || birth.getUTCDate() !== d) {
    return "Enter a valid date of birth.";
  }
  const now = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  if (birth > now) return "Date of birth can't be in the future.";
  const eighteenth = new Date(Date.UTC(y + 18, m - 1, d));
  if (eighteenth > now) return "You must be 18 or older to create a SpryMD account.";
  if (y < 1900) return "Enter a valid date of birth.";
  return null;
}

export function isAdultDob(dob: string, today: Date = new Date()): boolean {
  return !!dob && dobError(dob, today) === null;
}

// ---------------------------------------------------------------------------
// Save-and-resume (sessionStorage) — survives refresh, cleared when the tab closes.
// ---------------------------------------------------------------------------

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const PROGRESS_KEY = "sprymd_intake_progress_v1";
const SELECTION_KEY = "sprymd_checkout_selection_v1";

export type IntakeProgress = {
  conditionId: ConditionId;
  step: number;
  answers: FunnelAnswers;
  updatedAt: string;
};

function defaultStorage(): StorageLike | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function readJson<T>(storage: StorageLike | null, key: string): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: StorageLike | null, key: string, value: unknown) {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — resume is best effort */
  }
}

export function loadIntakeProgress(conditionId: string, storage: StorageLike | null = defaultStorage()): IntakeProgress | null {
  const all = readJson<Record<string, IntakeProgress>>(storage, PROGRESS_KEY);
  const progress = all?.[conditionId];
  if (!progress || progress.conditionId !== conditionId) return null;
  const total = buildIntakeSteps(conditionId).length;
  const step = Math.min(Math.max(0, Number(progress.step) || 0), Math.max(0, total - 1));
  return { ...progress, step, answers: progress.answers || {} };
}

export function saveIntakeProgress(progress: Omit<IntakeProgress, "updatedAt">, storage: StorageLike | null = defaultStorage()) {
  const all = readJson<Record<string, IntakeProgress>>(storage, PROGRESS_KEY) || {};
  all[progress.conditionId] = { ...progress, updatedAt: new Date().toISOString() };
  writeJson(storage, PROGRESS_KEY, all);
}

export function clearIntakeProgress(conditionId: string, storage: StorageLike | null = defaultStorage()) {
  const all = readJson<Record<string, IntakeProgress>>(storage, PROGRESS_KEY);
  if (!all || !all[conditionId]) return;
  delete all[conditionId];
  writeJson(storage, PROGRESS_KEY, all);
}

export type CheckoutSelection = {
  conditionId: ConditionId;
  treatmentId: string;
  answers: FunnelAnswers;
  email?: string;
  selectedAt: string;
};

export function saveCheckoutSelection(selection: Omit<CheckoutSelection, "selectedAt">, storage: StorageLike | null = defaultStorage()) {
  writeJson(storage, SELECTION_KEY, { ...selection, selectedAt: new Date().toISOString() });
}

export function loadCheckoutSelection(storage: StorageLike | null = defaultStorage()): CheckoutSelection | null {
  const selection = readJson<CheckoutSelection>(storage, SELECTION_KEY);
  return selection && selection.conditionId && selection.treatmentId ? selection : null;
}

/** Where the plan screen sends the visitor: the real Stripe-backed checkout. */
export function checkoutPath(conditionId: string, treatmentId: string, email?: string | null): string {
  const params = new URLSearchParams({ plan: treatmentId, condition: conditionId });
  if (email) params.set("email", email);
  return `/checkout?${params.toString()}`;
}

/** Visit tier that matches what the visitor picked in the funnel. */
export function defaultServiceTierFor(conditionId: string | null | undefined): "visit_basic" | "protocol_start" {
  return conditionId === "pcp" ? "visit_basic" : "protocol_start";
}

// ---------------------------------------------------------------------------
// Chart mapping — how a funnel intake lands in `patient_intakes`.
// ---------------------------------------------------------------------------

export function chiefComplaintFor(conditionId: string): string {
  switch (conditionId) {
    case "ed":
      return "ed";
    case "weightloss":
      return "weight";
    case "hairloss":
      return "hair";
    case "lowt":
      return "energy";
    default:
      return "other";
  }
}

/** Human-readable transcript of the intake for the clinician's chart. */
export function summarizeIntake(conditionId: string, answers: FunnelAnswers): string {
  const condition = getCondition(conditionId);
  const steps = buildIntakeSteps(conditionId);
  const lines: string[] = [`${condition?.name ?? conditionId} intake (sprymd.ai)`];
  for (const step of steps) {
    if (step.type === "eligibility") {
      const state = textValue(answers, ELIGIBILITY_STATE_KEY);
      if (state) lines.push(`Location during visit: ${stateName(state) ?? state}`);
      continue;
    }
    if (step.type === "compound") {
      const parts = (step.fields ?? [])
        .map((f) => {
          const v = textValue(answers, f.key);
          return v ? `${f.label.replace(/\s*\(.*\)$/, "")} ${v}${f.unit === "lbs" ? " lbs" : ""}` : "";
        })
        .filter(Boolean);
      if (parts.length) lines.push(`${step.title} ${parts.join(", ")}`);
      continue;
    }
    const value = answers[step.key];
    const text = Array.isArray(value) ? value.join("; ") : value;
    if (text) lines.push(`${step.title} ${text}`);
  }
  return lines.join("\n");
}

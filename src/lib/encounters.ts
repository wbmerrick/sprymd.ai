import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { CareState } from "@/lib/care-states";
import { isSupabaseConfigured } from "@/lib/intake/persist";
import { logAuditEvent } from "@/lib/audit";

export type ServiceLine = "ed" | "weight";

export interface IntakeAnswers {
  age?: string;
  erections?: string;
  duration?: string;
  frequency?: string;
  conditions?: string[];
  medications?: string[];
  triedBefore?: string;
  allergies?: string;
  preference?: string;
  goal?: string;
}

export interface Encounter {
  id: string;
  session_id: string;
  user_id?: string | null;
  email?: string | null;
  care_state: CareState;
  service_line: ServiceLine;
  intake_answers: IntakeAnswers;
  submitted_at: string;
  paid_at?: string | null;
  reviewed_at?: string | null;
  decision_note?: string | null;
  stripe_session_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Provider pages historically consumed a separate data layer with its own
 * encounter shape. The layers are now merged, so this is a plain alias.
 */
export type ProviderEncounter = Encounter;

export const PROVIDER_QUEUE_STATES: CareState[] = ["paid", "under_review"];

export const INTAKE_FIELD_LABELS: Record<keyof IntakeAnswers, string> = {
  age: "Age range",
  erections: "Erection quality",
  duration: "How long",
  frequency: "Frequency",
  conditions: "Medical conditions",
  medications: "Current medications",
  triedBefore: "Prior ED treatment",
  allergies: "Allergies",
  preference: "Medication preference",
  goal: "Treatment goal",
};

const MOCK_ENCOUNTERS_KEY = "spry_mock_encounters";
// Legacy key written by the old provider-encounters layer; reads merge it so
// pre-merge demo data isn't lost.
const LEGACY_INTAKE_KEY = "spry_mock_intake_answers";

const SAMPLE_INTAKE: IntakeAnswers = {
  age: "35–44",
  erections: "Sometimes difficult",
  duration: "6–12 months",
  frequency: "Most of the time",
  conditions: ["None of the above"],
  medications: ["None of the above"],
  triedBefore: "No",
  allergies: "None",
  preference: "Daily low-dose",
  goal: "Confidence and spontaneity",
};

const seedMockEncounters = (): Encounter[] => {
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "enc-demo-001",
      session_id: "sess-demo-001",
      care_state: "under_review",
      service_line: "ed",
      created_at: hoursAgo(24),
      updated_at: hoursAgo(5),
      submitted_at: hoursAgo(24),
      intake_answers: SAMPLE_INTAKE,
    },
    {
      id: "enc-demo-002",
      session_id: "sess-demo-002",
      care_state: "paid",
      service_line: "ed",
      created_at: hoursAgo(2),
      updated_at: hoursAgo(2),
      submitted_at: hoursAgo(2),
      intake_answers: {
        ...SAMPLE_INTAKE,
        age: "50–59",
        conditions: ["High blood pressure"],
        medications: ["Blood pressure medication"],
        triedBefore: "Yes — sildenafil (Viagra)",
        preference: "As-needed",
      },
    },
    {
      id: "enc-demo-003",
      session_id: "sess-demo-003",
      care_state: "under_review",
      service_line: "ed",
      created_at: hoursAgo(18),
      updated_at: hoursAgo(12),
      submitted_at: hoursAgo(18),
      intake_answers: {
        ...SAMPLE_INTAKE,
        age: "30–39",
        duration: "3–6 months",
        preference: "Tadalafil (generic Cialis)",
        goal: "Better spontaneity",
      },
    },
  ];
};

const readLegacyIntakeMap = (): Record<string, IntakeAnswers> => {
  try {
    const raw = localStorage.getItem(LEGACY_INTAKE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, IntakeAnswers>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const hasAnswers = (answers: IntakeAnswers | undefined): boolean =>
  Boolean(answers && Object.keys(answers).length > 0);

/**
 * Normalizes stored mock rows: merges intake answers from the legacy
 * spry_mock_intake_answers map (keyed by encounter id) and backfills
 * submitted_at, which old provider-layer rows never carried.
 */
const mergeLegacyMockData = (encounters: Encounter[]): Encounter[] => {
  const legacyIntake = readLegacyIntakeMap();

  return encounters.map((e) => ({
    ...e,
    intake_answers: hasAnswers(e.intake_answers) ? e.intake_answers : legacyIntake[e.id] ?? {},
    submitted_at: e.submitted_at ?? e.created_at ?? new Date().toISOString(),
  }));
};

const readMockEncounters = (): Encounter[] => {
  try {
    const raw = localStorage.getItem(MOCK_ENCOUNTERS_KEY);
    if (!raw) {
      const seeded = seedMockEncounters();
      writeMockEncounters(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = seedMockEncounters();
      writeMockEncounters(seeded);
      return seeded;
    }

    return mergeLegacyMockData(parsed as Encounter[]);
  } catch {
    const seeded = seedMockEncounters();
    writeMockEncounters(seeded);
    return seeded;
  }
};

const writeMockEncounters = (encounters: Encounter[]): void => {
  try {
    localStorage.setItem(MOCK_ENCOUNTERS_KEY, JSON.stringify(encounters));
  } catch {
    // ignore storage failures in private browsing
  }
};

export const formatEncounterRef = (id: string): string =>
  `Case #${id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`;

export const formatIntakeValue = (value: string | string[] | undefined): string => {
  if (!value) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return value;
};

export const getMockEncounterBySession = (sessionId: string): Encounter | null =>
  readMockEncounters().find((e) => e.session_id === sessionId) ?? null;

export const getMockEncounterById = (id: string): Encounter | null =>
  readMockEncounters().find((e) => e.id === id) ?? null;

export const upsertMockEncounter = (
  partial: Pick<Encounter, "session_id"> & Partial<Omit<Encounter, "id" | "session_id">>,
): Encounter => {
  const encounters = readMockEncounters();
  const now = new Date().toISOString();
  const existing = encounters.find((e) => e.session_id === partial.session_id);

  if (existing) {
    const updated: Encounter = {
      ...existing,
      ...partial,
      intake_answers: partial.intake_answers ?? existing.intake_answers,
      updated_at: now,
    };
    writeMockEncounters(encounters.map((e) => (e.session_id === partial.session_id ? updated : e)));
    return updated;
  }

  const created: Encounter = {
    id: crypto.randomUUID(),
    session_id: partial.session_id,
    care_state: partial.care_state ?? "draft_intake",
    service_line: partial.service_line ?? "ed",
    created_at: now,
    updated_at: now,
    submitted_at: partial.submitted_at ?? now,
    email: partial.email,
    user_id: partial.user_id,
    intake_answers: partial.intake_answers ?? {},
  };
  writeMockEncounters([created, ...encounters]);
  return created;
};

export const updateMockEncounterCareState = (
  sessionId: string,
  careState: CareState,
): Encounter | null => {
  const encounter = getMockEncounterBySession(sessionId);
  if (!encounter) return null;
  return upsertMockEncounter({ session_id: sessionId, care_state: careState });
};

export const createDemoEncounter = (sessionId: string, careState: CareState = "paid"): Encounter =>
  upsertMockEncounter({
    session_id: sessionId,
    care_state: careState,
    service_line: "ed",
    intake_answers: {},
  });

export const fetchEncounterBySession = async (sessionId: string): Promise<Encounter | null> => {
  if (!isSupabaseConfigured()) {
    return getMockEncounterBySession(sessionId);
  }

  const { data, error } = await supabase
    .from("encounters")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.warn("[encounters] Supabase fetch failed, using mock:", error.message);
    return getMockEncounterBySession(sessionId);
  }

  if (!data) return getMockEncounterBySession(sessionId);

  return normalizeEncounter(data);
};

export const fetchEncounterById = async (id: string): Promise<Encounter | null> => {
  if (!isSupabaseConfigured()) {
    return getMockEncounterById(id);
  }

  const { data, error } = await supabase.from("encounters").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.warn("[encounters] Supabase fetch by id failed, using mock:", error.message);
    return getMockEncounterById(id);
  }

  if (!data) return getMockEncounterById(id);

  return normalizeEncounter(data);
};

export const fetchReviewQueue = async (): Promise<{
  encounters: Encounter[];
  source: "supabase" | "mock";
}> => {
  if (!isSupabaseConfigured()) {
    const encounters = readMockEncounters().filter((e) =>
      PROVIDER_QUEUE_STATES.includes(e.care_state),
    );
    return { encounters, source: "mock" };
  }

  const { data, error } = await supabase
    .from("encounters")
    .select("*")
    .in("care_state", PROVIDER_QUEUE_STATES)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.warn("[encounters] Supabase queue fetch failed, using mock:", error.message);
    const encounters = readMockEncounters().filter((e) =>
      PROVIDER_QUEUE_STATES.includes(e.care_state),
    );
    return { encounters, source: "mock" };
  }

  return {
    encounters: (data ?? []).map(normalizeEncounter),
    source: "supabase",
  };
};

export const updateEncounterCareState = async (
  id: string,
  careState: CareState,
  auditAction?: string,
  actor?: string,
): Promise<Encounter | null> => {
  const now = new Date().toISOString();
  // Clinical decisions stamp the review time.
  const isDecision = careState === "prescribed" || careState === "declined";

  if (!isSupabaseConfigured()) {
    const encounters = readMockEncounters();
    const idx = encounters.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const updated: Encounter = {
      ...encounters[idx],
      care_state: careState,
      updated_at: now,
      ...(isDecision ? { reviewed_at: now } : {}),
    };
    encounters[idx] = updated;
    writeMockEncounters(encounters);

    if (auditAction) logAuditEvent(id, auditAction, actor ? { actor } : undefined);
    return updated;
  }

  const { data, error } = await supabase
    .from("encounters")
    .update({
      care_state: careState,
      updated_at: now,
      ...(isDecision ? { reviewed_at: now } : {}),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.warn("[encounters] Supabase update failed:", error.message);
    return null;
  }

  if (!data) return null;

  if (auditAction) logAuditEvent(id, auditAction, actor ? { actor } : undefined);
  return normalizeEncounter(data);
};

type EncounterRow = Tables<"encounters">;

const normalizeEncounter = (row: EncounterRow): Encounter => ({
  id: row.id,
  session_id: row.session_id,
  user_id: row.user_id,
  email: row.email,
  care_state: row.care_state as CareState,
  service_line: (row.service_line as ServiceLine) ?? "ed",
  intake_answers: (row.intake_answers as IntakeAnswers) ?? {},
  submitted_at: row.submitted_at ?? row.created_at ?? new Date().toISOString(),
  paid_at: row.paid_at,
  reviewed_at: row.reviewed_at,
  decision_note: row.decision_note,
  stripe_session_id: row.stripe_session_id,
  stripe_subscription_id: row.stripe_subscription_id,
  created_at: row.created_at ?? new Date().toISOString(),
  updated_at: row.updated_at ?? new Date().toISOString(),
});

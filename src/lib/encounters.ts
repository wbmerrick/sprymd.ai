import { supabase } from "@/integrations/supabase/client";
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
  care_state: CareState;
  service_line: ServiceLine;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  patient_email?: string;
  intake_answers: IntakeAnswers;
}

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
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return [
    {
      id: "enc-demo-001",
      session_id: "sess-demo-001",
      care_state: "under_review",
      service_line: "ed",
      created_at: yesterday.toISOString(),
      updated_at: now.toISOString(),
      submitted_at: yesterday.toISOString(),
      intake_answers: SAMPLE_INTAKE,
    },
    {
      id: "enc-demo-002",
      session_id: "sess-demo-002",
      care_state: "paid",
      service_line: "ed",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      submitted_at: now.toISOString(),
      intake_answers: { ...SAMPLE_INTAKE, preference: "As-needed" },
    },
  ];
};

const readMockEncounters = (): Encounter[] => {
  try {
    const raw = localStorage.getItem(MOCK_ENCOUNTERS_KEY);
    if (!raw) {
      const seeded = seedMockEncounters();
      writeMockEncounters(seeded);
      return seeded;
    }
    return JSON.parse(raw) as Encounter[];
  } catch {
    return seedMockEncounters();
  }
};

const writeMockEncounters = (encounters: Encounter[]): void => {
  try {
    localStorage.setItem(MOCK_ENCOUNTERS_KEY, JSON.stringify(encounters));
  } catch {
    // ignore
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
    patient_email: partial.patient_email,
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
  const reviewStates: CareState[] = ["paid", "under_review"];

  if (!isSupabaseConfigured()) {
    const encounters = readMockEncounters().filter((e) => reviewStates.includes(e.care_state));
    return { encounters, source: "mock" };
  }

  const { data, error } = await supabase
    .from("encounters")
    .select("*")
    .in("care_state", reviewStates)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.warn("[encounters] Supabase queue fetch failed, using mock:", error.message);
    const encounters = readMockEncounters().filter((e) => reviewStates.includes(e.care_state));
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
): Promise<Encounter | null> => {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const encounters = readMockEncounters();
    const idx = encounters.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const updated: Encounter = {
      ...encounters[idx],
      care_state: careState,
      updated_at: now,
    };
    encounters[idx] = updated;
    writeMockEncounters(encounters);

    if (auditAction) logAuditEvent(id, auditAction);
    return updated;
  }

  const { data, error } = await supabase
    .from("encounters")
    .update({ care_state: careState, updated_at: now })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.warn("[encounters] Supabase update failed:", error.message);
    return null;
  }

  if (!data) return null;

  if (auditAction) logAuditEvent(id, auditAction);
  return normalizeEncounter(data);
};

export const createDemoEncounter = (sessionId: string, careState: CareState = "paid"): Encounter =>
  upsertMockEncounter({
    session_id: sessionId,
    care_state: careState,
    service_line: "ed",
    intake_answers: {},
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeEncounter = (row: Record<string, any>): Encounter => ({
  id: row.id,
  session_id: row.session_id,
  care_state: row.care_state as CareState,
  service_line: (row.service_line as ServiceLine) ?? "ed",
  created_at: row.created_at ?? new Date().toISOString(),
  updated_at: row.updated_at ?? new Date().toISOString(),
  submitted_at: row.submitted_at ?? row.created_at ?? new Date().toISOString(),
  patient_email: row.patient_email,
  intake_answers: (row.intake_answers as IntakeAnswers) ?? {},
});

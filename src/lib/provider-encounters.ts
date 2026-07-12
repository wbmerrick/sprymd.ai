import { supabase } from "@/integrations/supabase/client";
import type { CareState } from "@/lib/care-states";
import type { Encounter } from "@/lib/encounters";
import { isSupabaseConfigured } from "@/lib/intake/persist";
import { logAuditEvent } from "@/lib/audit";

export const PROVIDER_QUEUE_STATES: CareState[] = ["paid", "under_review"];

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

export interface ProviderEncounter extends Encounter {
  intake_answers: IntakeAnswers;
  submitted_at: string;
}

const MOCK_ENCOUNTERS_KEY = "spry_mock_encounters";
const MOCK_INTAKE_KEY = "spry_mock_intake_answers";

function readMockEncounters(): Encounter[] {
  try {
    const raw = localStorage.getItem(MOCK_ENCOUNTERS_KEY);
    return raw ? (JSON.parse(raw) as Encounter[]) : [];
  } catch {
    return [];
  }
}

function writeMockEncounters(encounters: Encounter[]): void {
  localStorage.setItem(MOCK_ENCOUNTERS_KEY, JSON.stringify(encounters));
}

function readIntakeMap(): Record<string, IntakeAnswers> {
  try {
    const raw = localStorage.getItem(MOCK_INTAKE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, IntakeAnswers>) : {};
  } catch {
    return {};
  }
}

function writeIntakeMap(map: Record<string, IntakeAnswers>): void {
  localStorage.setItem(MOCK_INTAKE_KEY, JSON.stringify(map));
}

function toProviderEncounter(encounter: Encounter, intake: IntakeAnswers = {}): ProviderEncounter {
  return {
    ...encounter,
    intake_answers: intake,
    submitted_at: encounter.created_at,
  };
}

function seedProviderDemoData(): ProviderEncounter[] {
  const now = new Date();
  const hoursAgo = (h: number) =>
    new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  const encounters: Encounter[] = [
    {
      id: "enc-7f3a2b91-c4d8-4e1a-9b6f-2a8c5d7e3f01",
      session_id: "sess-a1b2c3d4",
      care_state: "under_review",
      service_line: "ed",
      created_at: hoursAgo(6),
      updated_at: hoursAgo(5),
    },
    {
      id: "enc-8e4b3c02-d5e9-5f2b-0c7a-3b9d6e8f4a12",
      session_id: "sess-e5f6g7h8",
      care_state: "paid",
      service_line: "ed",
      created_at: hoursAgo(2),
      updated_at: hoursAgo(2),
    },
    {
      id: "enc-9f5c4d13-e6f0-6a3c-1d8b-4c0e7f9a5b23",
      session_id: "sess-i9j0k1l2",
      care_state: "under_review",
      service_line: "ed",
      created_at: hoursAgo(18),
      updated_at: hoursAgo(12),
    },
  ];

  const intakeMap: Record<string, IntakeAnswers> = {
    "enc-7f3a2b91-c4d8-4e1a-9b6f-2a8c5d7e3f01": {
      age: "40–49",
      erections: "Sometimes — not every time",
      duration: "6–12 months",
      frequency: "A few times a month",
      conditions: ["None of the above"],
      medications: ["None of the above"],
      triedBefore: "No, this would be my first time",
      allergies: "None known",
      preference: "I'd like a recommendation",
      goal: "Improve confidence and performance",
    },
    "enc-8e4b3c02-d5e9-5f2b-0c7a-3b9d6e8f4a12": {
      age: "50–59",
      erections: "Rarely — most attempts fail",
      duration: "More than a year",
      frequency: "Less than once a month",
      conditions: ["High blood pressure"],
      medications: ["Blood pressure medication"],
      triedBefore: "Yes — sildenafil (Viagra)",
      allergies: "None known",
      preference: "Sildenafil (generic Viagra)",
      goal: "Restore reliable erections",
    },
    "enc-9f5c4d13-e6f0-6a3c-1d8b-4c0e7f9a5b23": {
      age: "30–39",
      erections: "Often — but not as firm as I'd like",
      duration: "3–6 months",
      frequency: "Once a week or more",
      conditions: ["None of the above"],
      medications: ["None of the above"],
      triedBefore: "No, this would be my first time",
      allergies: "None known",
      preference: "Tadalafil (generic Cialis)",
      goal: "Better spontaneity",
    },
  };

  writeMockEncounters(encounters);
  writeIntakeMap(intakeMap);

  return encounters.map((e) => toProviderEncounter(e, intakeMap[e.id]));
}

function ensureMockProviderData(): ProviderEncounter[] {
  const encounters = readMockEncounters();
  const intakeMap = readIntakeMap();
  const queue = encounters.filter((e) => PROVIDER_QUEUE_STATES.includes(e.care_state));

  if (queue.length === 0 && encounters.length === 0) {
    return seedProviderDemoData().filter((e) => PROVIDER_QUEUE_STATES.includes(e.care_state));
  }

  return queue.map((e) => toProviderEncounter(e, intakeMap[e.id] ?? {}));
}

function mapSupabaseRow(row: Record<string, unknown>): ProviderEncounter {
  const encounter: Encounter = {
    id: String(row.id),
    session_id: String(row.session_id ?? ""),
    care_state: row.care_state as CareState,
    service_line: (row.service_line as Encounter["service_line"]) ?? "ed",
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
    patient_email: row.patient_email ? String(row.patient_email) : undefined,
  };

  return toProviderEncounter(
    encounter,
    (row.intake_answers as IntakeAnswers) ?? {},
  );
}

export function formatEncounterRef(id: string): string {
  return `Case ${id.slice(-8).toUpperCase()}`;
}

export async function fetchReviewQueue(): Promise<{
  encounters: ProviderEncounter[];
  source: "supabase" | "mock";
}> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("encounters")
        .select("*")
        .in("care_state", PROVIDER_QUEUE_STATES)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return {
          encounters: data.map((row) => mapSupabaseRow(row as Record<string, unknown>)),
          source: "supabase",
        };
      }
    } catch {
      // fall through to mock
    }
  }

  return { encounters: ensureMockProviderData(), source: "mock" };
}

export async function fetchEncounterById(id: string): Promise<ProviderEncounter | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("encounters")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return mapSupabaseRow(data as Record<string, unknown>);
      }
    } catch {
      // fall through to mock
    }
  }

  const encounter = readMockEncounters().find((e) => e.id === id);
  if (!encounter) {
    ensureMockProviderData();
    const retry = readMockEncounters().find((e) => e.id === id);
    if (!retry) return null;
    return toProviderEncounter(retry, readIntakeMap()[retry.id] ?? {});
  }

  return toProviderEncounter(encounter, readIntakeMap()[encounter.id] ?? {});
}

export async function updateEncounterCareState(
  id: string,
  careState: CareState,
  auditAction: string,
): Promise<ProviderEncounter | null> {
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("encounters")
        .update({ care_state: careState, updated_at: updatedAt })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (!error && data) {
        logAuditEvent(id, auditAction);
        return mapSupabaseRow(data as Record<string, unknown>);
      }
    } catch {
      // fall through to mock
    }
  }

  const encounters = readMockEncounters();
  const index = encounters.findIndex((e) => e.id === id);
  if (index === -1) return null;

  encounters[index] = { ...encounters[index], care_state: careState, updated_at: updatedAt };
  writeMockEncounters(encounters);
  logAuditEvent(id, auditAction);

  const intake = readIntakeMap()[id] ?? {};
  return toProviderEncounter(encounters[index], intake);
}

export const INTAKE_FIELD_LABELS: Record<keyof IntakeAnswers, string> = {
  age: "Age range",
  erections: "Erection quality",
  duration: "Duration of symptoms",
  frequency: "Frequency",
  conditions: "Medical conditions",
  medications: "Current medications",
  triedBefore: "Prior ED treatment",
  allergies: "Allergies",
  preference: "Medication preference",
  goal: "Treatment goal",
};

export function formatIntakeValue(value: string | string[] | undefined): string {
  if (!value) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return value;
}

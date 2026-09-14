import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import type { CareState } from "@/lib/care-states";
import type { Encounter, IntakeAnswers, ServiceLine } from "@/lib/encounters";
import { upsertMockEncounter } from "@/lib/encounters";

const SESSION_STORAGE_KEY = "spry_session_id";

export const isSupabaseConfigured = (): boolean =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

export const readStoredSessionId = (): string | null => {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const writeStoredSessionId = (sessionId: string): void => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // ignore storage failures in private browsing
  }
};

export const generateSessionId = (): string => crypto.randomUUID();

export const ensureSessionId = (): string => {
  const existing = readStoredSessionId();
  if (existing) return existing;
  const id = generateSessionId();
  writeStoredSessionId(id);
  return id;
};

export interface SaveIntakeResult {
  /** The persisted encounter, or null if persistence failed entirely. */
  encounter: Encounter | null;
  /** Where the encounter was written: hosted Supabase or the local mock store. */
  source: "supabase" | "mock";
  /** Present when the Supabase write failed and the local fallback was used. */
  error?: string;
}

type EncounterRow = Tables<"encounters">;

const rowToEncounter = (row: EncounterRow): Encounter => ({
  id: row.id,
  session_id: row.session_id,
  user_id: row.user_id,
  email: row.email,
  care_state: row.care_state as CareState,
  service_line: (row.service_line as ServiceLine) ?? "ed",
  intake_answers: (row.intake_answers as IntakeAnswers) ?? {},
  submitted_at: row.submitted_at ?? row.created_at,
  paid_at: row.paid_at,
  reviewed_at: row.reviewed_at,
  decision_note: row.decision_note,
  stripe_session_id: row.stripe_session_id,
  stripe_subscription_id: row.stripe_subscription_id,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

/**
 * Persists the intake answers for a session as a `draft_intake` encounter.
 *
 * When Supabase is configured, the encounter is upserted on `session_id`
 * (creating the row on first save, updating answers on subsequent saves) with
 * `care_state` "draft_intake" and a fresh `submitted_at`. If a local Supabase
 * auth session exists, the encounter is claimed by setting `user_id` so RLS
 * grants the signed-in patient ownership; anonymous saves rely on the
 * anon insert/scoped-update policies instead.
 *
 * In demo mode (Supabase unconfigured) — or when the Supabase write fails —
 * the encounter is written to the localStorage mock store so the flow keeps
 * working offline; a failed Supabase write also reports `error`.
 *
 * @param sessionId  Anonymous session uuid (see {@link ensureSessionId}).
 * @param serviceLine  Which product intake this is ("ed" | "weight").
 * @param answers  The questionnaire answers collected so far.
 * @param email  Optional contact email captured during intake.
 * @returns The persisted encounter plus which store handled the write.
 */
export const saveIntake = async (
  sessionId: string,
  serviceLine: ServiceLine,
  answers: IntakeAnswers,
  email?: string,
): Promise<SaveIntakeResult> => {
  const submittedAt = new Date().toISOString();

  const saveToMock = (): Encounter =>
    upsertMockEncounter({
      session_id: sessionId,
      service_line: serviceLine,
      care_state: "draft_intake",
      submitted_at: submittedAt,
      intake_answers: answers,
      ...(email ? { email } : {}),
    });

  if (!isSupabaseConfigured()) {
    return { encounter: saveToMock(), source: "mock" };
  }

  let userId: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    userId = data.session?.user?.id ?? null;
  } catch {
    // no local auth session — save anonymously
  }

  const { data, error } = await supabase
    .from("encounters")
    .upsert(
      {
        session_id: sessionId,
        service_line: serviceLine,
        care_state: "draft_intake",
        intake_answers: answers as unknown as Json,
        submitted_at: submittedAt,
        ...(email ? { email } : {}),
        ...(userId ? { user_id: userId } : {}),
      },
      { onConflict: "session_id" },
    )
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.warn("[intake] Supabase save failed, using mock:", error?.message);
    return {
      encounter: saveToMock(),
      source: "mock",
      error: error?.message ?? "Supabase upsert returned no row",
    };
  }

  return { encounter: rowToEncounter(data), source: "supabase" };
};

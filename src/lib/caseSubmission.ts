import { saveIntakeDraft, type IntakeDraft, type SaveResult } from "@/lib/clinicalDrafts";
import { chiefComplaintFor, summarizeIntake, type FunnelAnswers } from "@/lib/intakeFlow";
import { getCondition, getTreatment } from "@/data/careCatalog";
import { ensureAccountShell, recordConsultRequest } from "@/lib/patientCareStore";
import { updateCustomerProfile } from "@/lib/customerAccounts";

/**
 * Persists what the homepage funnel produces — a plan selection or a
 * clinician-call request — to the same `patient_intakes` chart rows the
 * `/intake` questionnaire writes, when the visitor has a Supabase session.
 * Everything is also kept on the device so nothing is lost when the database
 * is unavailable (the hosted project returns PGRST205 until migrations run).
 */

export type FunnelCaseKind = "plan_selected" | "consult_requested";

export type ConsultContact = {
  name: string;
  email: string;
  phone: string;
  bestTime: string;
};

export type FunnelCaseInput = {
  kind: FunnelCaseKind;
  conditionId: string;
  answers: FunnelAnswers;
  treatmentId?: string | null;
  disqualifier?: string | null;
  crisis?: boolean;
  contact?: ConsultContact;
};

export type FunnelCaseResult = SaveResult & { draftId: string };

type SupabaseLike = {
  auth: { getSession: () => Promise<{ data: { session: { user: { id: string; email?: string | null } } | null } }> };
  from: (table: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

async function getSupabase(): Promise<SupabaseLike> {
  const mod = await import("@/integrations/supabase/client");
  return mod.supabase as unknown as SupabaseLike;
}

function newDraftId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `funnel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * The chart's `patients` row for the signed-in user (created on first use so
 * RLS on `patient_intakes` accepts the insert). Null when signed out or when
 * the table is missing.
 */
export async function resolvePatientId(contact?: Partial<ConsultContact>): Promise<string | null> {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;

    const existing = await supabase.from("patients").select("id").eq("user_id", user.id).maybeSingle();
    if (existing.data?.id) return existing.data.id as string;
    if (existing.error && existing.error.code !== "PGRST116") return null;

    const inserted = await supabase
      .from("patients")
      .insert({
        user_id: user.id,
        email: contact?.email || user.email || "",
        full_name: contact?.name || "",
        phone: contact?.phone || "",
      })
      .select("id")
      .single();
    return inserted.data?.id ? (inserted.data.id as string) : null;
  } catch {
    return null;
  }
}

export function buildFunnelDraft(input: FunnelCaseInput, draftId: string, patientId?: string | null): IntakeDraft {
  const condition = getCondition(input.conditionId);
  const treatment = getTreatment(input.conditionId, input.treatmentId);
  const summary = summarizeIntake(input.conditionId, input.answers);
  const header =
    input.kind === "consult_requested"
      ? `CLINICIAN CALL REQUESTED — asynchronous prescribing blocked by: ${input.disqualifier ?? "safety screening"}${input.crisis ? " (CRISIS FLAG: self-harm answer — 988/911 shown)" : ""}`
      : `Plan selected: ${treatment?.name ?? input.treatmentId ?? "(none)"} for ${condition?.name ?? input.conditionId}`;
  const contactLine = input.contact
    ? `Contact: ${input.contact.name} · ${input.contact.email} · ${input.contact.phone} · best time: ${input.contact.bestTime}`
    : "";

  // `answers` is a jsonb column; the typed IntakeAnswers shape only covers the
  // questionnaire's flat keys, so the structured funnel payload is nested
  // under `funnel` and cast to satisfy that type.
  const funnel = {
    kind: input.kind,
    conditionId: input.conditionId,
    treatmentId: input.treatmentId ?? null,
    disqualifier: input.disqualifier ?? null,
    crisis: !!input.crisis,
    contact: input.contact ?? null,
    answers: input.answers,
  };

  return {
    id: draftId,
    patientId: patientId || undefined,
    answers: {
      chief_complaints: [chiefComplaintFor(input.conditionId)],
      chief_complaint_detail: [header, contactLine, summary].filter(Boolean).join("\n"),
      funnel: funnel as unknown as string,
    },
    status: "submitted",
    updatedAt: new Date().toISOString(),
  };
}

/** Save a funnel case to the device, and to the chart when a session exists. */
export async function persistFunnelCase(input: FunnelCaseInput): Promise<FunnelCaseResult> {
  const draftId = newDraftId();
  const patientId = await resolvePatientId(input.contact);
  const draft = buildFunnelDraft(input, draftId, patientId);
  try {
    const result = await saveIntakeDraft(draft);
    return { ...result, draftId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chart sync unavailable.";
    return { location: "device", message: `Saved on this device. ${message}`, draftId };
  }
}

export type ConsultRequestInput = {
  conditionId: string;
  answers: FunnelAnswers;
  disqualifier: string;
  crisis: boolean;
  contact: ConsultContact;
};

export type ConsultRequestOutcome = FunnelCaseResult & {
  /** Where the request is stored, in plain words for the confirmation screen. */
  storedWhere: "chart" | "account";
};

/**
 * "Request a clinician call": keep the request on the patient's SpryMD
 * account (so it shows in the dashboard on this device) and on the chart when
 * signed in. Never silently succeeds without recording contact details.
 */
export async function submitConsultRequest(input: ConsultRequestInput): Promise<ConsultRequestOutcome> {
  const condition = getCondition(input.conditionId);
  const email = input.contact.email.trim().toLowerCase();

  ensureAccountShell(email, input.contact.name);
  updateCustomerProfile(email, { name: input.contact.name.trim(), phone: input.contact.phone.trim() });
  recordConsultRequest({
    email,
    conditionId: input.conditionId,
    conditionName: condition?.name,
    disqualifier: input.disqualifier,
    crisis: input.crisis,
    phone: input.contact.phone.trim(),
    bestTime: input.contact.bestTime,
    answers: input.answers,
  });

  const result = await persistFunnelCase({
    kind: "consult_requested",
    conditionId: input.conditionId,
    answers: input.answers,
    disqualifier: input.disqualifier,
    crisis: input.crisis,
    contact: input.contact,
  });

  return { ...result, storedWhere: result.location === "database" ? "chart" : "account" };
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

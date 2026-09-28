import { supabase } from "@/integrations/supabase/client";
import { isClinicianEmail } from "@/lib/masterAccount";
import { logPhiAccess } from "@/lib/hipaaCompliance";
import type { MessageThread, MessageThreadStatus, MessageUrgency } from "@/types/dashboard";

export type ThreadDbStatus = "open" | "awaiting_staff" | "awaiting_patient" | "closed";
export type MessageSenderRole = "patient" | "staff";

export const MESSAGE_URGENCY_OPTIONS: {
  value: MessageUrgency;
  label: string;
  description: string;
  responseTarget: string;
}[] = [
  {
    value: "routine",
    label: "Routine",
    description: "General questions, refills, non-urgent follow-up",
    responseTarget: "Within 24–48 hours",
  },
  {
    value: "soon",
    label: "Soon",
    description: "Symptoms or dosing questions that need same-day attention",
    responseTarget: "Same business day",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Time-sensitive clinical concern (not an emergency)",
    responseTarget: "Priority queue — as soon as possible",
  },
];

const URGENCY_RANK: Record<MessageUrgency, number> = {
  urgent: 0,
  soon: 1,
  routine: 2,
};

export function normalizeUrgency(value: unknown): MessageUrgency {
  if (value === "soon" || value === "urgent" || value === "routine") return value;
  return "routine";
}

export function urgencyLabel(urgency: MessageUrgency): string {
  return MESSAGE_URGENCY_OPTIONS.find((o) => o.value === urgency)?.label || "Routine";
}

/** Sort urgent → soon → routine, then newest first. */
export function sortThreadsByUrgency<T extends { urgency?: MessageUrgency; updatedAt: string }>(
  threads: T[],
): T[] {
  return [...threads].sort((a, b) => {
    const rankDiff =
      URGENCY_RANK[normalizeUrgency(a.urgency)] - URGENCY_RANK[normalizeUrgency(b.urgency)];
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export interface CareMessage {
  id: string;
  threadId: string;
  senderRole: MessageSenderRole;
  senderUserId: string;
  body: string;
  createdAt: string;
}

export interface StaffInboxThread extends MessageThread {
  patientId: string;
  patientEmail: string;
  patientName: string;
  staffUnread: boolean;
  patientUnread: boolean;
  dbStatus: ThreadDbStatus;
}

function previewOf(body: string): string {
  const t = body.trim().replace(/\s+/g, " ");
  return t.length > 160 ? `${t.slice(0, 157)}…` : t;
}

/** Map DB thread status → dashboard StatusChip statuses. */
export function toUiThreadStatus(status: string, patientUnread?: boolean): MessageThreadStatus {
  if (status === "awaiting_patient" || patientUnread) return "action_required";
  if (status === "awaiting_staff") return "action_required";
  return "no_action";
}

async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

/**
 * Ensure the signed-in auth user has a `patients` row (required for messaging RLS).
 */
export async function ensurePatientRow(profile?: {
  email?: string;
  name?: string;
  dob?: string;
  phone?: string;
}): Promise<{ patientId: string; userId: string } | null> {
  const user = await getSessionUser();
  if (!user?.id) return null;

  const email = (profile?.email || user.email || "").trim().toLowerCase();
  if (!email) return null;

  // Prefer RPC: claims guest checkout rows (null user_id) that RLS otherwise hides.
  const { data: claimedId, error: claimErr } = await supabase.rpc("claim_or_create_patient", {
    p_email: email,
    p_full_name: profile?.name || "",
    p_date_of_birth: profile?.dob || null,
    p_phone: profile?.phone || "",
  });

  if (!claimErr && claimedId) {
    return { patientId: String(claimedId), userId: user.id };
  }

  // Fallback for environments without the RPC yet.
  const { data: existing } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.id) {
    return { patientId: existing.id, userId: user.id };
  }

  const { data: inserted, error } = await supabase
    .from("patients")
    .insert({
      user_id: user.id,
      email,
      full_name: profile?.name || email.split("@")[0],
      date_of_birth: profile?.dob || null,
      phone: profile?.phone || "",
    })
    .select("id")
    .single();

  if (error || !inserted?.id) {
    console.warn("ensurePatientRow failed:", claimErr?.message || error?.message);
    return null;
  }
  return { patientId: inserted.id, userId: user.id };
}

/**
 * Ensure master / staff accounts have a `providers` row so RLS allows inbox access.
 */
export async function ensureProviderRow(profile?: {
  email?: string;
  name?: string;
}): Promise<{ providerId: string; userId: string } | null> {
  const user = await getSessionUser();
  if (!user?.id) return null;

  const email = (profile?.email || user.email || "").trim().toLowerCase();
  if (!email) return null;

  const { data: existing } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.id) {
    return { providerId: existing.id, userId: user.id };
  }

  // Only auto-provision for owner/staff allowlists (not every patient).
  if (!isClinicianEmail(email)) {
    return null;
  }

  const { data: inserted, error } = await supabase
    .from("providers")
    .insert({
      user_id: user.id,
      email,
      full_name: profile?.name || "SpryMD Clinician",
      specialty: "Telehealth",
      license_states: ["TN"],
      active: true,
    })
    .select("id")
    .single();

  if (error || !inserted?.id) {
    console.warn("ensureProviderRow failed:", error?.message);
    return null;
  }
  return { providerId: inserted.id, userId: user.id };
}

export async function isStaffSession(email?: string | null): Promise<boolean> {
  if (isClinicianEmail(email)) {
    const ensured = await ensureProviderRow({ email: email || undefined });
    return Boolean(ensured);
  }
  const user = await getSessionUser();
  if (!user?.id) return false;
  const { data } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();
  return Boolean(data?.id);
}

export async function listMyThreads(): Promise<MessageThread[]> {
  const patient = await ensurePatientRow();
  if (!patient) return [];

  const { data, error } = await supabase
    .from("message_threads")
    .select("id, subject, preview, status, updated_at, patient_unread, urgency")
    .eq("patient_id", patient.patientId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    console.warn("listMyThreads:", error?.message);
    return [];
  }

  return sortThreadsByUrgency(
    data.map((row) => ({
      id: row.id,
      subject: row.subject,
      preview: row.preview,
      updatedAt: row.updated_at,
      status: toUiThreadStatus(row.status, row.patient_unread),
      urgency: normalizeUrgency(row.urgency),
    })),
  );
}

export async function getThreadMessages(threadId: string): Promise<CareMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, thread_id, sender_role, sender_user_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.warn("getThreadMessages:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    threadId: row.thread_id,
    senderRole: row.sender_role as MessageSenderRole,
    senderUserId: row.sender_user_id,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function createThread(input: {
  subject: string;
  body: string;
  email?: string;
  name?: string;
  urgency?: MessageUrgency;
}): Promise<{ thread: MessageThread; delivered: boolean; error?: string }> {
  const subject = input.subject.trim() || "Patient Inquiry";
  const body = input.body.trim();
  const urgency = normalizeUrgency(input.urgency);
  if (!body) {
    return {
      thread: {
        id: `local_${Date.now()}`,
        subject,
        preview: "",
        updatedAt: new Date().toISOString(),
        status: "no_action",
        urgency,
      },
      delivered: false,
      error: "Message body is required.",
    };
  }

  const patient = await ensurePatientRow({
    email: input.email,
    name: input.name,
  });
  const user = await getSessionUser();

  if (!patient || !user) {
    return {
      thread: {
        id: `local_${Date.now()}`,
        subject,
        preview: previewOf(body),
        updatedAt: new Date().toISOString(),
        status: "action_required",
        urgency,
      },
      delivered: false,
      error: "Sign in with your account to deliver this message to your care team.",
    };
  }

  const now = new Date().toISOString();
  const { data: thread, error: threadErr } = await supabase
    .from("message_threads")
    .insert({
      patient_id: patient.patientId,
      subject,
      preview: previewOf(body),
      status: "awaiting_staff",
      urgency,
      patient_unread: false,
      staff_unread: true,
      updated_at: now,
    })
    .select("id, subject, preview, status, updated_at, urgency")
    .single();

  if (threadErr || !thread) {
    return {
      thread: {
        id: `local_${Date.now()}`,
        subject,
        preview: previewOf(body),
        updatedAt: now,
        status: "action_required",
        urgency,
      },
      delivered: false,
      error: threadErr?.message || "Could not create message thread.",
    };
  }

  const { error: msgErr } = await supabase.from("messages").insert({
    thread_id: thread.id,
    sender_role: "patient",
    sender_user_id: user.id,
    body,
  });

  if (msgErr) {
    return {
      thread: {
        id: thread.id,
        subject: thread.subject,
        preview: thread.preview,
        updatedAt: thread.updated_at,
        status: toUiThreadStatus(thread.status),
        urgency: normalizeUrgency(thread.urgency),
      },
      delivered: false,
      error: msgErr.message,
    };
  }

  logPhiAccess({
    actorId: input.email || user.email || user.id,
    actorRole: "patient",
    actorEmail: input.email || user.email || undefined,
    action: "message_physician",
    patientId: patient.patientId,
    resourceType: "message",
    resourceId: thread.id,
    metadata: { subject, urgency },
  });

  return {
    thread: {
      id: thread.id,
      subject: thread.subject,
      preview: thread.preview,
      updatedAt: thread.updated_at,
      status: toUiThreadStatus(thread.status),
      urgency: normalizeUrgency(thread.urgency),
    },
    delivered: true,
  };
}

export async function replyToThread(
  threadId: string,
  body: string,
  role: MessageSenderRole,
): Promise<{ ok: boolean; error?: string }> {
  const text = body.trim();
  if (!text) return { ok: false, error: "Message body is required." };

  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in required." };

  if (role === "staff") {
    const provider = await ensureProviderRow({ email: user.email || undefined });
    if (!provider) {
      return {
        ok: false,
        error:
          "Staff access required — sign in with a live SpryMD Auth clinical account (local-only login cannot access the inbox).",
      };
    }
  } else {
    const patient = await ensurePatientRow({ email: user.email || undefined });
    if (!patient) return { ok: false, error: "Patient profile required." };
  }

  const { error: msgErr } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_role: role,
    sender_user_id: user.id,
    body: text,
  });

  if (msgErr) return { ok: false, error: msgErr.message };

  const now = new Date().toISOString();
  const patch =
    role === "staff"
      ? {
          preview: previewOf(text),
          status: "awaiting_patient" as const,
          patient_unread: true,
          staff_unread: false,
          updated_at: now,
          provider_id: (await ensureProviderRow({ email: user.email || undefined }))?.providerId,
        }
      : {
          preview: previewOf(text),
          status: "awaiting_staff" as const,
          patient_unread: false,
          staff_unread: true,
          updated_at: now,
        };

  const { error: threadErr } = await supabase
    .from("message_threads")
    .update(patch)
    .eq("id", threadId);

  if (threadErr) return { ok: false, error: threadErr.message };

  logPhiAccess({
    actorId: user.email || user.id,
    actorRole: role === "staff" ? "clinician" : "patient",
    actorEmail: user.email || undefined,
    action: "message_physician",
    patientId: threadId,
    resourceType: "message",
    resourceId: threadId,
    metadata: { role, reply: true },
  });

  return { ok: true };
}

export async function markThreadRead(threadId: string, as: "patient" | "staff"): Promise<void> {
  const patch =
    as === "patient" ? { patient_unread: false } : { staff_unread: false };
  await supabase.from("message_threads").update(patch).eq("id", threadId);
}

export async function listStaffInbox(): Promise<StaffInboxThread[]> {
  const user = await getSessionUser();
  if (!user) return [];

  await ensureProviderRow({ email: user.email || undefined });

  const { data, error } = await supabase
    .from("message_threads")
    .select(
      `
      id, subject, preview, status, updated_at, patient_id, urgency,
      patient_unread, staff_unread,
      patients ( email, full_name )
    `,
    )
    .neq("status", "closed")
    .order("updated_at", { ascending: false });

  if (error || !data) {
    console.warn("listStaffInbox:", error?.message);
    return [];
  }

  return sortThreadsByUrgency(
    data.map((row) => {
      const patient = Array.isArray(row.patients) ? row.patients[0] : row.patients;
      return {
        id: row.id,
        subject: row.subject,
        preview: row.preview,
        updatedAt: row.updated_at,
        status: toUiThreadStatus(row.status, row.staff_unread),
        urgency: normalizeUrgency(row.urgency),
        patientId: row.patient_id,
        patientEmail: patient?.email || "",
        patientName: patient?.full_name || patient?.email || "Patient",
        staffUnread: row.staff_unread,
        patientUnread: row.patient_unread,
        dbStatus: row.status as ThreadDbStatus,
      };
    }),
  );
}

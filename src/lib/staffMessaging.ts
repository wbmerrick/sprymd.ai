import { supabase } from "@/integrations/supabase/client";
import {
  ensureProviderRow,
  normalizeUrgency,
  sortThreadsByUrgency,
  MESSAGE_URGENCY_OPTIONS,
} from "@/lib/messaging";
import type { MessageUrgency } from "@/types/dashboard";

export { MESSAGE_URGENCY_OPTIONS };

export interface StaffColleague {
  id: string;
  email: string;
  fullName: string;
}

export interface StaffTeamMessage {
  id: string;
  threadId: string;
  senderProviderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  isMine: boolean;
}

export interface StaffTeamThread {
  id: string;
  subject: string;
  preview: string;
  urgency: MessageUrgency;
  updatedAt: string;
  createdByProviderId: string;
  createdByName: string;
  recipientProviderId: string | null;
  recipientName: string | null;
  /** Whole team when no recipient. */
  audience: "team" | "direct";
}

function previewOf(body: string): string {
  const t = body.trim().replace(/\s+/g, " ");
  return t.length > 160 ? `${t.slice(0, 157)}…` : t;
}

function providerLabel(row: { full_name?: string | null; email?: string | null } | null | undefined): string {
  if (!row) return "Colleague";
  return row.full_name || row.email || "Colleague";
}

export async function listStaffColleagues(email?: string): Promise<StaffColleague[]> {
  const me = await ensureProviderRow({ email });
  if (!me) return [];

  const { data, error } = await supabase
    .from("providers")
    .select("id, email, full_name")
    .eq("active", true)
    .order("full_name", { ascending: true });

  if (error || !data) {
    console.warn("listStaffColleagues:", error?.message);
    return [];
  }

  return data
    .filter((p) => p.id !== me.providerId)
    .map((p) => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name || p.email,
    }));
}

export async function listStaffTeamThreads(email?: string): Promise<StaffTeamThread[]> {
  const me = await ensureProviderRow({ email });
  if (!me) return [];

  const { data, error } = await supabase
    .from("staff_threads")
    .select(
      `
      id, subject, preview, urgency, updated_at,
      created_by_provider_id, recipient_provider_id,
      creator:providers!staff_threads_created_by_provider_id_fkey ( full_name, email ),
      recipient:providers!staff_threads_recipient_provider_id_fkey ( full_name, email )
    `,
    )
    .neq("status", "closed")
    .order("updated_at", { ascending: false });

  if (error || !data) {
    console.warn("listStaffTeamThreads:", error?.message);
    // Fallback without FK aliases if relationship names differ
    const fallback = await supabase
      .from("staff_threads")
      .select("id, subject, preview, urgency, updated_at, created_by_provider_id, recipient_provider_id")
      .neq("status", "closed")
      .order("updated_at", { ascending: false });
    if (fallback.error || !fallback.data) return [];
    return sortThreadsByUrgency(
      fallback.data.map((row) => ({
        id: row.id,
        subject: row.subject,
        preview: row.preview,
        urgency: normalizeUrgency(row.urgency),
        updatedAt: row.updated_at,
        createdByProviderId: row.created_by_provider_id,
        createdByName: "Staff",
        recipientProviderId: row.recipient_provider_id,
        recipientName: row.recipient_provider_id ? "Colleague" : null,
        audience: row.recipient_provider_id ? ("direct" as const) : ("team" as const),
      })),
    );
  }

  return sortThreadsByUrgency(
    data.map((row) => {
      const creator = Array.isArray(row.creator) ? row.creator[0] : row.creator;
      const recipient = Array.isArray(row.recipient) ? row.recipient[0] : row.recipient;
      return {
        id: row.id,
        subject: row.subject,
        preview: row.preview,
        urgency: normalizeUrgency(row.urgency),
        updatedAt: row.updated_at,
        createdByProviderId: row.created_by_provider_id,
        createdByName: providerLabel(creator),
        recipientProviderId: row.recipient_provider_id,
        recipientName: row.recipient_provider_id ? providerLabel(recipient) : null,
        audience: row.recipient_provider_id ? ("direct" as const) : ("team" as const),
      };
    }),
  );
}

export async function getStaffTeamMessages(
  threadId: string,
  email?: string,
): Promise<StaffTeamMessage[]> {
  const me = await ensureProviderRow({ email });
  if (!me) return [];

  const { data, error } = await supabase
    .from("staff_messages")
    .select(
      `
      id, thread_id, sender_provider_id, body, created_at,
      sender:providers!staff_messages_sender_provider_id_fkey ( full_name, email )
    `,
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.warn("getStaffTeamMessages:", error?.message);
    const fallback = await supabase
      .from("staff_messages")
      .select("id, thread_id, sender_provider_id, body, created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (fallback.error || !fallback.data) return [];
    return fallback.data.map((row) => ({
      id: row.id,
      threadId: row.thread_id,
      senderProviderId: row.sender_provider_id,
      senderName: row.sender_provider_id === me.providerId ? "You" : "Colleague",
      body: row.body,
      createdAt: row.created_at,
      isMine: row.sender_provider_id === me.providerId,
    }));
  }

  return data.map((row) => {
    const sender = Array.isArray(row.sender) ? row.sender[0] : row.sender;
    const isMine = row.sender_provider_id === me.providerId;
    return {
      id: row.id,
      threadId: row.thread_id,
      senderProviderId: row.sender_provider_id,
      senderName: isMine ? "You" : providerLabel(sender),
      body: row.body,
      createdAt: row.created_at,
      isMine,
    };
  });
}

export async function createStaffTeamThread(input: {
  subject: string;
  body: string;
  urgency?: MessageUrgency;
  /** Omit or null = whole care team */
  recipientProviderId?: string | null;
  email?: string;
}): Promise<{ ok: boolean; threadId?: string; error?: string }> {
  const subject = input.subject.trim() || "Team note";
  const body = input.body.trim();
  if (!body) return { ok: false, error: "Message body is required." };

  const me = await ensureProviderRow({ email: input.email });
  if (!me) return { ok: false, error: "Staff access required." };

  const urgency = normalizeUrgency(input.urgency);
  const now = new Date().toISOString();

  const { data: thread, error: threadErr } = await supabase
    .from("staff_threads")
    .insert({
      subject,
      preview: previewOf(body),
      urgency,
      created_by_provider_id: me.providerId,
      recipient_provider_id: input.recipientProviderId || null,
      status: "open",
      updated_at: now,
    })
    .select("id")
    .single();

  if (threadErr || !thread) {
    return { ok: false, error: threadErr?.message || "Could not create thread." };
  }

  const { error: msgErr } = await supabase.from("staff_messages").insert({
    thread_id: thread.id,
    sender_provider_id: me.providerId,
    body,
  });

  if (msgErr) return { ok: false, error: msgErr.message };
  return { ok: true, threadId: thread.id };
}

export async function replyStaffTeamThread(
  threadId: string,
  body: string,
  email?: string,
): Promise<{ ok: boolean; error?: string }> {
  const text = body.trim();
  if (!text) return { ok: false, error: "Message body is required." };

  const me = await ensureProviderRow({ email });
  if (!me) return { ok: false, error: "Staff access required." };

  const { error: msgErr } = await supabase.from("staff_messages").insert({
    thread_id: threadId,
    sender_provider_id: me.providerId,
    body: text,
  });
  if (msgErr) return { ok: false, error: msgErr.message };

  const { error: threadErr } = await supabase
    .from("staff_threads")
    .update({
      preview: previewOf(text),
      updated_at: new Date().toISOString(),
    })
    .eq("id", threadId);

  if (threadErr) return { ok: false, error: threadErr.message };
  return { ok: true };
}

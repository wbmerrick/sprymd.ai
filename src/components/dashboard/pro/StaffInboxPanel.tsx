import { useEffect, useState } from "react";
import { Inbox, Send, RefreshCw, MessageSquare } from "lucide-react";
import { isClinicianEmail } from "@/lib/masterAccount";
import {
  getThreadMessages,
  isStaffSession,
  listStaffInbox,
  markThreadRead,
  replyToThread,
  type CareMessage,
  type StaffInboxThread,
} from "@/lib/messaging";
import { formatRelative } from "@/lib/dashboardFormat";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { UrgencyBadge } from "@/components/dashboard/UrgencyBadge";
import { cn } from "@/lib/utils";

interface StaffInboxPanelProps {
  userEmail?: string;
  /** Hide marketing chrome when the page already provides the goal header. */
  compact?: boolean;
}

export function StaffInboxPanel({ userEmail, compact = false }: StaffInboxPanelProps) {
  const [visible, setVisible] = useState(false);
  const [threads, setThreads] = useState<StaffInboxThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CareMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const staff = await isStaffSession(userEmail);
      if (!cancelled) setVisible(staff || isClinicianEmail(userEmail));
    })();
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const inbox = await listStaffInbox();
      setThreads(inbox);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) void load();
  }, [visible]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const msgs = await getThreadMessages(selectedId);
      if (!cancelled) {
        setMessages(msgs);
        await markThreadRead(selectedId, "staff");
        setThreads((prev) =>
          prev.map((t) => (t.id === selectedId ? { ...t, staffUnread: false } : t)),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (!visible) return null;

  const selected = threads.find((t) => t.id === selectedId) || null;
  const unread = threads.filter((t) => t.staffUnread).length;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !reply.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const result = await replyToThread(selectedId, reply, "staff");
      if (!result.ok) {
        setError(result.error || "Reply failed");
        return;
      }
      setReply("");
      setMessages(await getThreadMessages(selectedId));
      await load();
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      aria-labelledby="staff-inbox-heading"
      className="rounded-2xl border border-[#C89E67]/30 bg-[#0E1612] p-4 md:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-[#C89E67]" />
          <div>
            {!compact && (
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">Staff Desk</p>
            )}
            <h2
              id="staff-inbox-heading"
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {compact ? "Message queue" : "Patient Messaging Inbox"}
              {unread > 0 && (
                <span className="ml-2 rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-200">
                  {unread} unread
                </span>
              )}
            </h2>
            {compact && (
              <p className="text-xs text-zinc-500">Urgent first, then soon, then routine.</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
          {error}
        </p>
      )}

      {threads.length === 0 && !loading ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-10 text-center">
          <MessageSquare className="h-6 w-6 text-zinc-600" />
          <p className="text-sm text-zinc-500">No open patient threads yet.</p>
          <p className="text-xs text-zinc-600">
            When a customer messages Support, their thread appears here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ul className="max-h-[420px] space-y-2 overflow-y-auto">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition",
                    selectedId === t.id
                      ? "border-[#C89E67]/50 bg-[#C89E67]/10"
                      : "border-white/10 bg-black/20 hover:border-white/20",
                    t.urgency === "urgent" && "border-l-2 border-l-rose-400",
                    t.urgency === "soon" && "border-l-2 border-l-amber-400",
                    t.staffUnread && (!t.urgency || t.urgency === "routine") && "border-l-2 border-l-sky-400",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{t.subject}</p>
                      <p className="truncate text-xs text-zinc-400">
                        {t.patientName}
                        {t.patientEmail ? ` · ${t.patientEmail}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <UrgencyBadge urgency={t.urgency} />
                      <StatusChip status={t.dbStatus} />
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{t.preview}</p>
                  <time className="mt-1 block text-[10px] text-zinc-600">{formatRelative(t.updatedAt)}</time>
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3 min-h-[240px]">
            {!selected ? (
              <p className="py-12 text-center text-sm text-zinc-500">Select a thread to reply.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{selected.subject}</p>
                    <p className="text-xs text-zinc-400">
                      {selected.patientName} · {selected.patientEmail}
                    </p>
                  </div>
                  <UrgencyBadge urgency={selected.urgency} />
                </div>
                <ul className="max-h-[260px] space-y-2 overflow-y-auto">
                  {messages.map((m) => (
                    <li
                      key={m.id}
                      className={cn(
                        "rounded-lg px-3 py-2 text-xs",
                        m.senderRole === "staff"
                          ? "ml-4 bg-[#C89E67]/15 border border-[#C89E67]/25 text-zinc-100"
                          : "mr-4 bg-white/5 border border-white/10 text-zinc-200",
                      )}
                    >
                      <p className="mb-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                        {m.senderRole === "staff" ? "You (staff)" : "Patient"}
                      </p>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <time className="mt-1 block text-[10px] text-zinc-600">
                        {formatRelative(m.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleReply} className="flex gap-2 border-t border-white/10 pt-3">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply to patient…"
                    className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="flex items-center gap-1 rounded-lg bg-[#C89E67] px-3 py-2 text-xs font-semibold text-[#0C120F] disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

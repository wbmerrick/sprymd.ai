import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MessageSquarePlus, Send, Users, User } from "lucide-react";
import {
  createStaffTeamThread,
  getStaffTeamMessages,
  listStaffColleagues,
  listStaffTeamThreads,
  replyStaffTeamThread,
  MESSAGE_URGENCY_OPTIONS,
  type StaffColleague,
  type StaffTeamMessage,
  type StaffTeamThread,
} from "@/lib/staffMessaging";
import type { MessageUrgency } from "@/types/dashboard";
import { UrgencyBadge } from "@/components/dashboard/UrgencyBadge";
import { formatRelative } from "@/lib/dashboardFormat";
import { cn } from "@/lib/utils";

export default function StaffTeamPage() {
  const { email } = useOutletContext<{ email: string; name: string }>();
  const [threads, setThreads] = useState<StaffTeamThread[]>([]);
  const [colleagues, setColleagues] = useState<StaffColleague[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StaffTeamMessage[]>([]);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [urgency, setUrgency] = useState<MessageUrgency>("routine");
  const [recipientId, setRecipientId] = useState<string>("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, c] = await Promise.all([
        listStaffTeamThreads(email),
        listStaffColleagues(email),
      ]);
      setThreads(t);
      setColleagues(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load team messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [email]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const msgs = await getStaffTeamMessages(selectedId, email);
      if (!cancelled) setMessages(msgs);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, email]);

  const selected = threads.find((t) => t.id === selectedId) || null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const result = await createStaffTeamThread({
        subject,
        body,
        urgency,
        recipientProviderId: recipientId || null,
        email,
      });
      if (!result.ok) {
        setError(result.error || "Could not send");
        return;
      }
      setSubject("");
      setBody("");
      setUrgency("routine");
      setRecipientId("");
      setComposing(false);
      await load();
      if (result.threadId) setSelectedId(result.threadId);
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !reply.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const result = await replyStaffTeamThread(selectedId, reply, email);
      if (!result.ok) {
        setError(result.error || "Reply failed");
        return;
      }
      setReply("");
      setMessages(await getStaffTeamMessages(selectedId, email));
      await load();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">
            Clinician workspace
          </p>
          <h1
            className="text-2xl font-semibold text-white md:text-3xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Team messaging
          </h1>
          <p className="max-w-2xl text-sm text-zinc-500">
            Coordinate with other SpryMD staff — message the whole care team or a single colleague.
            Patients never see these threads.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setComposing((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#C89E67] px-4 py-2.5 text-xs font-semibold text-[#0C120F] hover:bg-[#B0854F]"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {composing ? "Close" : "New team message"}
        </button>
      </header>

      {error && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
          {error}
        </p>
      )}

      {composing && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-2xl border border-[#C89E67]/35 bg-[#16211B] p-5"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-300">To</label>
            <select
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-[#C89E67] focus:outline-none"
            >
              <option value="">Whole care team</option>
              {colleagues.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-300">Subject</label>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Coverage handoff · Pharmacy hold · Protocol question"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-300">Message</label>
            <textarea
              required
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your note to the team…"
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none"
            />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-zinc-300">Urgency</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {MESSAGE_URGENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUrgency(opt.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition",
                    urgency === opt.value
                      ? "border-[#C89E67]/50 bg-[#C89E67]/10"
                      : "border-white/10 bg-black/30 hover:border-white/25",
                  )}
                >
                  <p className="text-sm font-semibold text-white">{opt.label}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{opt.responseTarget}</p>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? "Sending…" : "Send to team"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Threads {loading ? "…" : `(${threads.length})`}
          </h2>
          {threads.length === 0 && !loading ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              No team threads yet. Start one to coordinate with colleagues.
            </p>
          ) : (
            <ul className="max-h-[480px] space-y-2 overflow-y-auto">
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
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{t.subject}</p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-zinc-400">
                          {t.audience === "team" ? (
                            <>
                              <Users className="h-3 w-3 shrink-0" /> Care team
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 shrink-0" />
                              {t.recipientName || "Direct"}
                            </>
                          )}
                          <span className="text-zinc-600">· from {t.createdByName}</span>
                        </p>
                      </div>
                      <UrgencyBadge urgency={t.urgency} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{t.preview}</p>
                    <time className="mt-1 block text-[10px] text-zinc-600">
                      {formatRelative(t.updatedAt)}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="min-h-[280px] space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {!selected ? (
            <p className="py-16 text-center text-sm text-zinc-500">Select a thread to read and reply.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <p className="text-sm font-medium text-white">{selected.subject}</p>
                  <p className="text-xs text-zinc-400">
                    {selected.audience === "team"
                      ? "Whole care team"
                      : `Direct · ${selected.recipientName}`}
                  </p>
                </div>
                <UrgencyBadge urgency={selected.urgency} />
              </div>
              <ul className="max-h-[280px] space-y-2 overflow-y-auto">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs",
                      m.isMine
                        ? "ml-6 border border-[#C89E67]/25 bg-[#C89E67]/15 text-zinc-100"
                        : "mr-6 border border-white/10 bg-white/5 text-zinc-200",
                    )}
                  >
                    <p className="mb-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                      {m.senderName}
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
                  placeholder="Reply to colleagues…"
                  className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#C89E67] px-3 py-2 text-xs font-semibold text-[#0C120F] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

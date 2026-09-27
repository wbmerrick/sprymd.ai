import { useEffect, useMemo, useState } from "react";
import { Search, Send, Lock, CheckCircle2, MessageSquarePlus, AlertCircle } from "lucide-react";
import { MessagesList } from "@/components/dashboard/MessagesList";
import { UrgencyBadge } from "@/components/dashboard/UrgencyBadge";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";
import { sendPatientCareMessage } from "@/lib/patientCareStore";
import {
  getThreadMessages,
  listMyThreads,
  markThreadRead,
  MESSAGE_URGENCY_OPTIONS,
  replyToThread,
  type CareMessage,
} from "@/lib/messaging";
import type { MessageThread, MessageUrgency } from "@/types/dashboard";
import { formatRelative } from "@/lib/dashboardFormat";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const { messages: localMessages, supportTopics, email, refresh } = useDashboard();
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [urgency, setUrgency] = useState<MessageUrgency>("routine");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [remoteThreads, setRemoteThreads] = useState<MessageThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<CareMessage[]>([]);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);

  const loadThreads = async () => {
    const threads = await listMyThreads();
    if (threads.length) {
      setRemoteThreads(threads);
    }
  };

  useEffect(() => {
    void loadThreads();
  }, [email]);

  const messages = remoteThreads.length ? remoteThreads : localMessages;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) => m.subject.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q),
    );
  }, [messages, query]);

  const selected = filtered.find((m) => m.id === selectedId) || null;

  useEffect(() => {
    if (!selectedId || selectedId.startsWith("msg_") || selectedId.startsWith("local_")) {
      setThreadMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const msgs = await getThreadMessages(selectedId);
      if (!cancelled) {
        setThreadMessages(msgs);
        await markThreadRead(selectedId, "patient");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || !email || sending) return;

    setSending(true);
    setSendError(null);
    try {
      const result = await sendPatientCareMessage(email, subject, body, urgency);
      setSubject("");
      setBody("");
      setUrgency("routine");
      setComposing(false);
      if (result.delivered) {
        setSentSuccess(true);
        setTimeout(() => setSentSuccess(false), 5000);
      } else {
        setSendError(result.error || "Could not deliver to care team.");
      }
      await loadThreads();
      refresh();
      if (result.thread.id) setSelectedId(result.thread.id);
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !replyBody.trim() || replying) return;
    setReplying(true);
    setSendError(null);
    try {
      const result = await replyToThread(selectedId, replyBody, "patient");
      if (!result.ok) {
        setSendError(result.error || "Reply failed.");
        return;
      }
      setReplyBody("");
      setThreadMessages(await getThreadMessages(selectedId));
      await loadThreads();
      refresh();
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C89E67]">Account & Care</p>
          <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Message Your Care Team
          </h1>
          <p className="text-sm text-zinc-400">
            Ask about dosing, side effects, refills, or labs. Your Tennessee care team responds in this inbox.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setComposing(!composing)}
          className="flex items-center gap-2 rounded-xl bg-[#C89E67] px-4 py-2.5 text-xs font-semibold text-[#0C120F] shadow-sm hover:bg-[#B0854F] transition-all"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {composing ? "Close Composer" : "New Message"}
        </button>
      </header>

      {sentSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            Delivered to your care team. You will see their reply here — typically within 24 hours.
          </span>
        </div>
      )}

      {sendError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 p-3.5 text-xs text-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{sendError}</span>
        </div>
      )}

      {composing && (
        <form onSubmit={handleSendMessage} className="rounded-2xl border border-[#C89E67]/40 bg-[#16211B] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#C89E67]" /> Secure Message to Tennessee Care Team
            </h2>
            <span className="text-[11px] text-[#C89E67] font-mono">ENCRYPTED IN TRANSIT</span>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Dose titration question / Side effect check-in / Lab results"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe your symptoms, question about your protocol, or refill inquiry in detail..."
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none resize-none"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-zinc-300">How urgent is this?</legend>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Message urgency">
              {MESSAGE_URGENCY_OPTIONS.map((opt) => {
                const selected = urgency === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setUrgency(opt.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition",
                      selected
                        ? opt.value === "urgent"
                          ? "border-rose-400/60 bg-rose-950/40"
                          : opt.value === "soon"
                            ? "border-amber-400/50 bg-amber-950/30"
                            : "border-[#C89E67]/50 bg-[#C89E67]/10"
                        : "border-white/10 bg-black/30 hover:border-white/25",
                    )}
                  >
                    <p className="text-sm font-semibold text-white">{opt.label}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-400 leading-snug">{opt.description}</p>
                    <p className="mt-1.5 text-[10px] font-medium text-zinc-500">{opt.responseTarget}</p>
                  </button>
                );
              })}
            </div>
            {urgency === "urgent" && (
              <p className="text-[11px] text-rose-300/90">
                Urgent is for time-sensitive clinical questions only. If this is a medical emergency, dial 911 —
                do not wait for a portal reply.
              </p>
            )}
          </fieldset>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-zinc-500">
              Not for emergencies. If you have chest pain or severe distress, dial 911.
            </p>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? "Sending…" : "Send to Care Team"}
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
        <label htmlFor="support-search" className="sr-only">
          Search messages and topics
        </label>
        <input
          id="support-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages and topics…"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#C89E67]/50 focus:outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="messages-heading" className="space-y-3">
          <h2 id="messages-heading" className="text-lg font-semibold text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Conversations
          </h2>
          <MessagesList
            messages={filtered}
            selectedId={selectedId}
            onSelect={(t) => setSelectedId(t.id)}
          />
        </section>

        <section aria-labelledby="thread-heading" className="space-y-3">
          <h2 id="thread-heading" className="text-lg font-semibold text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            {selected ? selected.subject : "Thread"}
          </h2>
          {!selected ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              Select a conversation to read replies and continue the thread.
            </p>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                <UrgencyBadge urgency={selected.urgency} />
                <span className="text-[11px] text-zinc-500">
                  {MESSAGE_URGENCY_OPTIONS.find((o) => o.value === (selected.urgency || "routine"))
                    ?.responseTarget}
                </span>
              </div>
              <ul className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {threadMessages.length === 0 ? (
                  <li className="text-sm text-zinc-400">
                    <p className="text-zinc-300">{selected.preview}</p>
                    <time className="mt-1 block text-[11px] text-zinc-600">
                      {formatRelative(selected.updatedAt)}
                    </time>
                  </li>
                ) : (
                  threadMessages.map((m) => (
                    <li
                      key={m.id}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-sm",
                        m.senderRole === "patient"
                          ? "ml-6 bg-emerald-950/40 text-emerald-50 border border-emerald-500/20"
                          : "mr-6 bg-[#16211B] text-zinc-100 border border-[#C89E67]/25",
                      )}
                    >
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                        {m.senderRole === "patient" ? "You" : "Care team"}
                      </p>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <time className="mt-1 block text-[10px] text-zinc-600" dateTime={m.createdAt}>
                        {formatRelative(m.createdAt)}
                      </time>
                    </li>
                  ))
                )}
              </ul>

              {!selected.id.startsWith("msg_") && !selected.id.startsWith("local_") && (
                <form onSubmit={handleReply} className="flex gap-2 border-t border-white/10 pt-3">
                  <input
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write a reply…"
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={replying || !replyBody.trim()}
                    className="rounded-xl bg-[#C89E67] px-3 py-2 text-xs font-semibold text-[#0C120F] disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      </div>

      <section aria-labelledby="topics-heading" className="space-y-3">
        <h2 id="topics-heading" className="text-lg font-semibold text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Popular Care Topics
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {supportTopics.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setSubject(`Question regarding ${t.title}`);
                  setComposing(true);
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-[#C89E67]/40"
              >
                <p className="font-medium text-white">{t.title}</p>
                <p className="mt-1 text-sm text-zinc-500">{t.description}</p>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

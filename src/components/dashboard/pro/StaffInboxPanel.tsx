import { useEffect, useMemo, useState } from "react";
import {
  Inbox,
  Send,
  RefreshCw,
  MessageSquare,
  Users,
  MessageSquarePlus,
  ArrowLeft,
  Search,
} from "lucide-react";
import { isClinicianEmail } from "@/lib/masterAccount";
import {
  createStaffOutboundThread,
  getThreadMessages,
  isStaffSession,
  listPatientContacts,
  listStaffInbox,
  markThreadRead,
  MESSAGE_URGENCY_OPTIONS,
  replyToThread,
  type CareMessage,
  type PatientContact,
  type StaffInboxThread,
} from "@/lib/messaging";
import type { MessageUrgency } from "@/types/dashboard";
import { formatRelative } from "@/lib/dashboardFormat";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { UrgencyBadge } from "@/components/dashboard/UrgencyBadge";
import { cn } from "@/lib/utils";

type PanelView = "inbox" | "contacts" | "compose";

interface StaffInboxPanelProps {
  userEmail?: string;
  /** Hide marketing chrome when the page already provides the goal header. */
  compact?: boolean;
  /** Open on All Contacts (e.g. /staff/contacts route). */
  initialView?: PanelView;
}

export function StaffInboxPanel({
  userEmail,
  compact = false,
  initialView = "inbox",
}: StaffInboxPanelProps) {
  const [visible, setVisible] = useState(false);
  const [authBlocked, setAuthBlocked] = useState(false);
  const [view, setView] = useState<PanelView>(initialView);
  const [threads, setThreads] = useState<StaffInboxThread[]>([]);
  const [contacts, setContacts] = useState<PatientContact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CareMessage[]>([]);
  const [reply, setReply] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [composeContact, setComposeContact] = useState<PatientContact | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [urgency, setUrgency] = useState<MessageUrgency>("routine");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Require a live provider-backed session — allowlist alone shows an empty
      // shell that looks like "messages never arrive".
      const staff = await isStaffSession(userEmail);
      if (!cancelled) {
        setVisible(staff);
        setAuthBlocked(!staff && isClinicianEmail(userEmail));
        if (!staff && isClinicianEmail(userEmail)) {
          setError(
            "Staff inbox needs a live SpryMD Auth clinical session. Sign out and sign in again with your clinical password.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  const loadInbox = async () => {
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

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listPatientContacts();
      setContacts(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    if (view === "contacts" || view === "compose") void loadContacts();
    else void loadInbox();
  }, [visible, view]);

  useEffect(() => {
    if (!selectedId || view !== "inbox") {
      if (view !== "inbox") setMessages([]);
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
  }, [selectedId, view]);

  const filteredContacts = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q),
    );
  }, [contacts, contactQuery]);

  if (!visible) {
    if (!authBlocked) return null;
    return (
      <section className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100">
        {error ||
          "Staff inbox needs a live SpryMD Auth clinical session. Sign out and sign in again with your clinical password."}
      </section>
    );
  }

  const selected = threads.find((t) => t.id === selectedId) || null;
  const unread = threads.filter((t) => t.staffUnread).length;

  const openContact = (contact: PatientContact) => {
    const existing = threads.find((t) => t.patientId === contact.id);
    if (existing) {
      setView("inbox");
      setSelectedId(existing.id);
      setComposeContact(null);
      return;
    }
    setComposeContact(contact);
    setSubject("");
    setBody("");
    setUrgency("routine");
    setView("compose");
  };

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
      await loadInbox();
    } finally {
      setSending(false);
    }
  };

  const handleOutbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeContact || sending) return;
    setSending(true);
    setError(null);
    try {
      const result = await createStaffOutboundThread({
        patientId: composeContact.id,
        subject,
        body,
        urgency,
      });
      if (!result.ok) {
        setError(result.error || "Could not send message");
        return;
      }
      setComposeContact(null);
      setSubject("");
      setBody("");
      setUrgency("routine");
      setView("inbox");
      await loadInbox();
      if (result.threadId) setSelectedId(result.threadId);
    } finally {
      setSending(false);
    }
  };

  const heading =
    view === "contacts"
      ? "All contacts"
      : view === "compose"
        ? "Message patient"
        : compact
          ? "Message queue"
          : "Patient Messaging Inbox";

  return (
    <section
      aria-labelledby="staff-inbox-heading"
      className="rounded-2xl border border-[#C89E67]/30 bg-[#0E1612] p-4 md:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {view === "inbox" ? (
            <Inbox className="h-4 w-4 text-[#C89E67]" />
          ) : (
            <Users className="h-4 w-4 text-[#C89E67]" />
          )}
          <div>
            {!compact && (
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">
                Staff Desk
              </p>
            )}
            <h2
              id="staff-inbox-heading"
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {heading}
              {view === "inbox" && unread > 0 && (
                <span className="ml-2 rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-200">
                  {unread} unread
                </span>
              )}
            </h2>
            {compact && view === "inbox" && (
              <p className="text-xs text-zinc-500">Select a thread, or open All contacts to message anyone.</p>
            )}
            {view === "contacts" && (
              <p className="text-xs text-zinc-500">
                Choose any customer to open or start a care message.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view !== "inbox" && (
            <button
              type="button"
              onClick={() => {
                setView("inbox");
                setComposeContact(null);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Inbox
            </button>
          )}
          {view === "inbox" && (
            <button
              type="button"
              onClick={() => setView("contacts")}
              className="flex items-center gap-1.5 rounded-lg bg-[#C89E67] px-3 py-1.5 text-xs font-semibold text-[#0C120F] hover:bg-[#B0854F]"
            >
              <Users className="h-3.5 w-3.5" />
              All contacts
            </button>
          )}
          <button
            type="button"
            onClick={() => void (view === "inbox" ? loadInbox() : loadContacts())}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
          {error}
        </p>
      )}

      {view === "contacts" && (
        <div className="space-y-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              placeholder="Search name, email, phone, state…"
              className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none"
            />
          </label>
          {filteredContacts.length === 0 && !loading ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-10 text-center">
              <Users className="h-6 w-6 text-zinc-600" />
              <p className="text-sm text-zinc-500">No patient contacts match.</p>
            </div>
          ) : (
            <ul className="max-h-[480px] space-y-2 overflow-y-auto" role="listbox" aria-label="Patient contacts">
              {filteredContacts.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={composeContact?.id === c.id}
                    onClick={() => openContact(c)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-[#C89E67]/40 hover:bg-[#C89E67]/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{c.fullName}</p>
                        <p className="truncate text-xs text-zinc-400">{c.email}</p>
                        {(c.phone || c.state) && (
                          <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                            {[c.phone, c.state].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {c.openThreadCount > 0 ? (
                          <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-200">
                            {c.openThreadCount} open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#C89E67]">
                            <MessageSquarePlus className="h-3 w-3" />
                            Message
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view === "compose" && composeContact && (
        <form onSubmit={handleOutbound} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <div>
            <p className="text-sm font-medium text-white">{composeContact.fullName}</p>
            <p className="text-xs text-zinc-400">{composeContact.email}</p>
          </div>
          <label className="block space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message from SpryMD care team"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Urgency</span>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as MessageUrgency)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-[#C89E67] focus:outline-none"
            >
              {MESSAGE_URGENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} — {o.responseTarget}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Message</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              required
              placeholder="Relay information to this patient…"
              className="w-full resize-y rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#C89E67] focus:outline-none"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setView("contacts");
                setComposeContact(null);
              }}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C89E67] px-3 py-2 text-xs font-semibold text-[#0C120F] disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? "Sending…" : "Send to patient"}
            </button>
          </div>
        </form>
      )}

      {view === "inbox" && threads.length === 0 && !loading ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 py-10 text-center">
          <MessageSquare className="h-6 w-6 text-zinc-600" />
          <p className="text-sm text-zinc-500">No open patient threads yet.</p>
          <p className="text-xs text-zinc-600 max-w-sm">
            Open All contacts to message any customer, or wait for a Support inquiry.
          </p>
          <button
            type="button"
            onClick={() => setView("contacts")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C89E67] px-3 py-2 text-xs font-semibold text-[#0C120F]"
          >
            <Users className="h-3.5 w-3.5" />
            Open All contacts
          </button>
        </div>
      ) : null}

      {view === "inbox" && threads.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ul
            className="max-h-[420px] space-y-2 overflow-y-auto"
            role="listbox"
            aria-label="Patient message threads"
          >
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedId === t.id}
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
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-zinc-500">Select a thread to reply.</p>
                <button
                  type="button"
                  onClick={() => setView("contacts")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C89E67] hover:underline"
                >
                  <Users className="h-3.5 w-3.5" />
                  Or message any contact
                </button>
              </div>
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
      ) : null}
    </section>
  );
}

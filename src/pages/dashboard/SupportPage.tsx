import { useMemo, useState } from "react";
import { Search, Send, Lock, ShieldCheck, CheckCircle2, MessageSquarePlus } from "lucide-react";
import { MessagesList } from "@/components/dashboard/MessagesList";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";
import { sendPatientCareMessage } from "@/lib/patientCareStore";

export default function SupportPage() {
  const { messages, supportTopics, email, refresh } = useDashboard();
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) => m.subject.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q),
    );
  }, [messages, query]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || !email) return;

    sendPatientCareMessage(email, subject, body);
    setSubject("");
    setBody("");
    setSentSuccess(true);
    setComposing(false);
    refresh();

    setTimeout(() => {
      setSentSuccess(false);
    }, 5000);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C89E67]">Account & Care</p>
          <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Physician Messaging & Support
          </h1>
          <p className="text-sm text-zinc-400">
            Send HIPAA-encrypted messages directly to your Tennessee physician or browse clinical guidance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setComposing(!composing)}
          className="flex items-center gap-2 rounded-xl bg-[#C89E67] px-4 py-2.5 text-xs font-semibold text-[#0C120F] shadow-sm hover:bg-[#B0854F] transition-all"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {composing ? "Close Composer" : "Message My Physician"}
        </button>
      </header>

      {sentSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            Your message was securely delivered to your physician. Your chart has been updated and you will receive a response within 24 hours.
          </span>
        </div>
      )}

      {/* Message Composer */}
      {composing && (
        <form onSubmit={handleSendMessage} className="rounded-2xl border border-[#C89E67]/40 bg-[#16211B] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#C89E67]" /> Secure Message to Tennessee Care Team
            </h2>
            <span className="text-[11px] text-[#C89E67] font-mono">HIPAA ENCRYPTED</span>
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

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-zinc-500">
              Not for acute medical emergencies. If you have chest pain or severe distress, dial 911 immediately.
            </p>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              Send to Doctor
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

      <section aria-labelledby="messages-heading" className="space-y-3">
        <h2 id="messages-heading" className="text-lg font-semibold text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Message History
        </h2>
        <MessagesList messages={filtered} />
      </section>

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

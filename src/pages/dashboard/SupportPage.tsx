import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MessagesList } from "@/components/dashboard/MessagesList";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";

export default function SupportPage() {
  const { messages, supportTopics } = useDashboard();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) => m.subject.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q),
    );
  }, [messages, query]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C89E67]">Account</p>
        <h1 className="text-3xl font-semibold text-white font-display">
          Support
        </h1>
        <p className="text-sm text-zinc-400">Message your care team or browse common topics.</p>
      </header>

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
        <h2 id="messages-heading" className="text-lg font-semibold text-white font-display">
          Messages
        </h2>
        <MessagesList messages={filtered} />
      </section>

      <section aria-labelledby="topics-heading" className="space-y-3">
        <h2 id="topics-heading" className="text-lg font-semibold text-white font-display">
          Popular topics
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {supportTopics.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => console.info("stub: topic", t.id)}
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

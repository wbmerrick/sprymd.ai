import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Sparkles, Send } from "lucide-react";
import { loadMasterOpsSnapshot, type MasterOpsSnapshot } from "@/lib/masterOps";
import {
  answerOpsQuestion,
  buildOpsBriefing,
  type AiChatMessage,
} from "@/lib/masterAiAdvisor";
import { cn } from "@/lib/utils";

const STARTERS = [
  "What should I prioritize today?",
  "How is revenue?",
  "Member growth?",
  "Any urgent queues?",
];

export default function MasterAiPage() {
  const { email } = useOutletContext<{ email: string }>();
  const [snap, setSnap] = useState<MasterOpsSnapshot | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void loadMasterOpsSnapshot(email).then((s) => {
      setSnap(s);
      setMessages([
        {
          id: "brief",
          role: "assistant",
          content: buildOpsBriefing(s),
          createdAt: new Date().toISOString(),
        },
      ]);
    });
  }, [email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = (question: string) => {
    if (!snap || !question.trim()) return;
    const userMsg: AiChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: question.trim(),
      createdAt: new Date().toISOString(),
    };
    const reply: AiChatMessage = {
      id: `a_${Date.now()}`,
      role: "assistant",
      content: answerOpsQuestion(question, snap),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg, reply]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400/90">AI advisor</p>
        <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          Ops intelligence
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Grounded in your live members, payments, and clinical queues — no patient chart text leaves this browser.
          Ask about cash, growth, SLAs, or what to prioritize.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => ask(s)}
            className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-500/20"
          >
            {s}
          </button>
        ))}
      </div>

      <section className="flex min-h-[420px] flex-col rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/40 to-black/60">
        <div className="flex items-center gap-2 border-b border-emerald-500/20 px-4 py-3">
          <Sparkles className="h-4 w-4 text-emerald-300" />
          <p className="text-sm font-semibold text-white">SpryMD Ops Advisor</p>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-emerald-500/80">
            Snapshot-grounded
          </span>
        </div>

        <ul className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={cn(
                "max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                m.role === "assistant"
                  ? "border border-emerald-500/20 bg-black/50 text-zinc-200"
                  : "ml-auto border border-white/10 bg-emerald-500/15 text-emerald-50",
              )}
            >
              <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">
                {m.role === "assistant" ? "Advisor" : "You"}
              </p>
              {m.content}
            </li>
          ))}
          <div ref={bottomRef} />
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2 border-t border-emerald-500/20 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about revenue, members, queues…"
            className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!snap || !input.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-[#04120e] hover:bg-emerald-400 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            Ask
          </button>
        </form>
      </section>
    </div>
  );
}

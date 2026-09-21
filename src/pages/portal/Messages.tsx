import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import type { Encounter } from "@/lib/encounters";
import { fetchEncounterBySession } from "@/lib/encounters";
import { flags } from "@/lib/flags";
import { isSupabaseConfigured, readStoredSessionId } from "@/lib/intake/persist";

type SenderRole = "patient" | "provider";

interface ThreadMessage {
  id: string;
  encounter_id: string;
  sender_role: SenderRole;
  body: string;
  created_at: string;
  read_at: string | null;
}

const mockThreadKey = (encounterId: string) => `spry_mock_messages_${encounterId}`;

const readMockThread = (encounterId: string): ThreadMessage[] => {
  try {
    const raw = localStorage.getItem(mockThreadKey(encounterId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ThreadMessage[]) : [];
  } catch {
    return [];
  }
};

const writeMockThread = (encounterId: string, messages: ThreadMessage[]): void => {
  try {
    localStorage.setItem(mockThreadKey(encounterId), JSON.stringify(messages));
  } catch {
    // ignore storage failures in private browsing
  }
};

const MessagesHeader = ({ subtitle }: { subtitle: string }) => (
  <AnimatedSection>
    <p className="section-label">Secure messaging</p>
    <h1 className="font-display text-foreground text-3xl font-bold mb-2">Messages</h1>
    <p className="font-body text-muted-foreground">{subtitle}</p>
  </AnimatedSection>
);

const MessagesComingSoon = () => (
  <div className="space-y-6">
    <MessagesHeader subtitle="HIPAA-secure messaging with your care team is on the way." />
    <AnimatedSection delay={0.1}>
      <div className="card-base text-center py-16">
        <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-display text-foreground text-lg font-semibold mb-2">
          Secure messaging launches soon
        </h2>
        <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto">
          You'll be able to message your care team directly from this portal.
          Until then, call our support line for any questions about your treatment.
        </p>
      </div>
    </AnimatedSection>
  </div>
);

const MessageThread = () => {
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      const sessionId = readStoredSessionId();
      if (!sessionId) {
        setLoading(false);
        return;
      }

      const enc = await fetchEncounterBySession(sessionId);
      setEncounter(enc);
      if (!enc) {
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("encounter_id", enc.id)
          .order("created_at", { ascending: true });

        if (error || !data) {
          setMessages([]);
        } else {
          // sender_role is a loose string column; narrow it to the union.
          setMessages(
            data.map((row) => ({ ...row, sender_role: row.sender_role as SenderRole })),
          );
        }
      } else {
        setMessages(readMockThread(enc.id));
      }

      setLoading(false);
    };

    void load();
  }, []);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || !encounter || sending) return;
    setSending(true);

    // Reconstruct the row client-side: after an anonymous insert, RLS can
    // block selecting the row back, so we never re-query what we just wrote.
    const message: ThreadMessage = {
      id: crypto.randomUUID(),
      encounter_id: encounter.id,
      sender_role: "patient",
      body,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("messages").insert({
        encounter_id: encounter.id,
        sender_role: "patient",
        body,
      });
      if (error) {
        toast.error("Message not sent", { description: error.message });
        setSending(false);
        return;
      }
    } else {
      writeMockThread(encounter.id, [...readMockThread(encounter.id), message]);
    }

    setMessages((prev) => [...prev, message]);
    setDraft("");
    setSending(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <MessagesHeader subtitle="HIPAA-secure messaging with your care team." />
        <p className="font-body text-muted-foreground">Loading your conversation…</p>
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="space-y-6">
        <MessagesHeader subtitle="HIPAA-secure messaging with your care team." />
        <AnimatedSection delay={0.1}>
          <div className="card-base text-center py-16">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-display text-foreground text-lg font-semibold mb-2">
              No visit found
            </h2>
            <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Complete your health questionnaire to start a visit, then message your
              care team here.
            </p>
            <Link to="/quiz" className="btn-secondary">Start my visit</Link>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MessagesHeader subtitle="HIPAA-secure messaging with your care team." />

      <AnimatedSection delay={0.1}>
        <div className="card-base p-0 overflow-hidden">
          <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto">
                  No messages yet. Send a note to your care team — they typically
                  respond within one business day.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender_role === "patient" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      m.sender_role === "patient"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                    <p
                      className={`font-body text-xs mt-1.5 ${
                        m.sender_role === "patient"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {m.sender_role === "patient" ? "You" : "Care team"} ·{" "}
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-light p-4 flex items-end gap-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message to your care team…"
              className="flex-1 rounded-xl border-2 border-gray-light p-3 font-body text-sm text-foreground resize-none h-20 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!draft.trim() || sending}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </AnimatedSection>

      <p className="font-body text-muted-foreground text-xs">
        For medical emergencies, call 911. Messages are reviewed during business hours.
      </p>
    </div>
  );
};

const Messages = () => (flags.messaging ? <MessageThread /> : <MessagesComingSoon />);

export default Messages;

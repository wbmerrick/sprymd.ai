import { useEffect, useRef, useState } from "react";
import { ArrowRight, Send } from "lucide-react";

const STARTERS = [
  "Which protocol fits me?",
  "How does Spry work?",
  "Can Spry be my PCP?",
];

function replyFor(input) {
  const q = input.toLowerCase();
  if (q.includes("pcp") || q.includes("primary")) {
    return "Yes — Spry Primary Care keeps one clinician on your chart for wellness, labs, messaging, and referrals. Membership starts at $49/mo. Tap Make Spry my PCP below the fold, or Begin protocol and choose Primary Care.";
  }
  if (q.includes("how") || q.includes("work") || q.includes("system")) {
    return "Three steps: baseline intake (≈5 min) → licensed clinician review within 24h → compounded fulfillment + ongoing titration from your dashboard. No waiting room. Cancel anytime.";
  }
  if (q.includes("protocol") || q.includes("fit") || q.includes("start") || q.includes("treat")) {
    return "Pick the domain you want to instrument — Metabolic, Hormonal, Cognitive, Recovery, Performance, or Primary Care. Every plan is preference-aware and signed by a board-certified clinician.";
  }
  if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
    return "Protocols start from $25–$149/mo depending on the domain. GLP-1 metabolic plans are clinician-titrated; PCP membership from $49/mo. Shipping is included on compounded Rx when prescribed.";
  }
  if (q.includes("refill")) {
    return "Sign in to your account for Quick Refills — active prescriptions only, tied to your chart. New therapy starts with a protocol intake.";
  }
  return "I'm iSpry — SpryMD's care agent. Ask about protocols, how the system works, pricing, PCP membership, or refills. For clinical decisions, a licensed clinician still signs every protocol.";
}

/**
 * iSpry chat — hero AI agent interface (no mascot animation).
 */
export default function ISpryChat({ onAction }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "I'm iSpry, your SpryMD care agent. Ask about protocols, PCP membership, or how the system works.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = (raw) => {
    const text = (raw ?? draft).trim();
    if (!text || busy) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: replyFor(text) }]);
      setBusy(false);
    }, 450 + Math.min(600, text.length * 8));
  };

  return (
    <div
      className="ospry-chat spry-rise w-full max-w-md md:max-w-none"
      style={{
        animationDelay: "0.12s",
        display: "flex",
        flexDirection: "column",
        height: "min(520px, 70vh)",
        minHeight: 380,
        border: "1px solid #1F1F22",
        background: "linear-gradient(165deg, rgba(18,18,20,0.96) 0%, rgba(5,5,5,0.98) 100%)",
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
      }}
      aria-label="Chat with iSpry, SpryMD AI care agent"
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 90% 0%, rgba(30,200,165,0.08), transparent 45%)",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid #1F1F22",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="breath-glow"
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: "#1EC8A5",
              boxShadow: "0 0 0 3px rgba(30,200,165,0.15)",
            }}
          />
          <div>
            <div className="display" style={{ fontSize: 16, fontWeight: 600, color: "#FAFAFA", letterSpacing: "-0.02em" }}>
              iSpry
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(30,200,165,0.85)", textTransform: "uppercase" }}>
              AI care agent · online
            </div>
          </div>
        </div>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "#8A8A8E", textTransform: "uppercase" }}>
          Secure
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollerRef}
        className="scrollbar-hide"
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg, i) => {
          const mine = msg.role === "user";
          return (
            <div
              key={`${msg.role}-${i}`}
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "92%",
                padding: "10px 12px",
                background: mine ? "rgba(30,200,165,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${mine ? "rgba(30,200,165,0.35)" : "#1F1F22"}`,
                color: mine ? "#FAFAFA" : "#C8C8C8",
                fontSize: 14,
                lineHeight: 1.45,
              }}
            >
              {!mine && (
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "#1EC8A5", marginBottom: 6, textTransform: "uppercase" }}>
                  iSpry
                </div>
              )}
              {msg.text}
            </div>
          );
        })}
        {busy && (
          <div
            className="anim-pulse mono"
            style={{
              alignSelf: "flex-start",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "#8A8A8E",
              textTransform: "uppercase",
              padding: "6px 2px",
            }}
          >
            iSpry is typing…
          </div>
        )}
      </div>

      {/* Starters */}
      {messages.length < 3 && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: "0 16px 12px",
          }}
        >
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              className="focus-ring"
              onClick={() => send(s)}
              disabled={busy}
              style={{
                fontSize: 12,
                color: "#C8C8C8",
                border: "1px solid #1F1F22",
                background: "transparent",
                padding: "7px 10px",
                cursor: busy ? "default" : "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: 8,
          padding: 12,
          borderTop: "1px solid #1F1F22",
          background: "rgba(5,5,5,0.65)",
        }}
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask iSpry anything…"
          className="focus-ring"
          disabled={busy}
          aria-label="Message iSpry"
          style={{
            flex: 1,
            background: "#0B0B0C",
            border: "1px solid #1F1F22",
            color: "#FAFAFA",
            padding: "12px 14px",
            fontSize: 14,
            fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          className="focus-ring"
          disabled={busy || !draft.trim()}
          aria-label="Send message"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            background: draft.trim() && !busy ? "#FAFAFA" : "#121214",
            color: draft.trim() && !busy ? "#050505" : "#8A8A8E",
            border: "1px solid #1F1F22",
            cursor: draft.trim() && !busy ? "pointer" : "default",
          }}
        >
          <Send size={16} strokeWidth={2} />
        </button>
      </form>

      {onAction && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "0 12px 12px",
          }}
        >
          <button
            type="button"
            className="focus-ring"
            onClick={onAction}
            style={{
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 12px",
              background: "transparent",
              border: "1px solid #1F1F22",
              color: "#1EC8A5",
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-mono), ui-monospace, monospace",
            }}
          >
            Begin a protocol <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

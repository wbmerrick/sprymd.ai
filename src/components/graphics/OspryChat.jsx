import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, MessageCircle, Minus, Send, X } from "lucide-react";

const STARTERS = [
  "Which care plan fits me?",
  "How does Spry work?",
  "Can Spry be my doctor?",
];

function replyFor(input) {
  const q = input.toLowerCase();
  if (q.includes("pcp") || q.includes("primary") || q.includes("doctor")) {
    return "Yes — you can make SpryMD your main doctor for checkups, labs, and messages. Plans start at $49/mo. Tap Get my doctor, or Get started and choose Your doctor.";
  }
  if (q.includes("how") || q.includes("work") || q.includes("system")) {
    return "Three steps: answer a short form (about 5 min) → a licensed doctor reviews it within 24 hours → medicine ships to you when approved, and you track progress on your dashboard. No waiting room. Cancel anytime.";
  }
  if (q.includes("protocol") || q.includes("fit") || q.includes("start") || q.includes("treat") || q.includes("plan")) {
    return "Pick the area you want help with — weight, hormones, focus, sleep, performance, or your main doctor. Every plan is built around you and signed by a licensed doctor.";
  }
  if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
    return "Care plans start from $25–$149/mo depending on what you need. Weight-loss plans are adjusted by a doctor; main-doctor membership starts at $49/mo. Shipping is included when medicine is prescribed.";
  }
  if (q.includes("refill")) {
    return "Sign in for Quick Refills — only for medicine you already have. New care starts with a short form.";
  }
  return "I'm iSpry — SpryMD's care helper. Ask about care plans, how Spry works, pricing, your doctor, or refills. For medical decisions, a licensed doctor still signs every plan.";
}

/**
 * iSpry chat — hero panel; docks to a bottom-right chat bar once the page scrolls.
 */
export default function ISpryChat({ onAction, onDockChange }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "I'm iSpry, your SpryMD care helper. Ask about care plans, your doctor, or how Spry works.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [docked, setDocked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);
  const wasDocked = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 48;
      setDocked((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (docked && !wasDocked.current) setExpanded(false);
    if (!docked) setExpanded(false);
    wasDocked.current = docked;
    onDockChange?.(docked);
  }, [docked, onDockChange]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, expanded, docked]);

  const send = (raw) => {
    const text = (raw ?? draft).trim();
    if (!text || busy) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    if (docked) setExpanded(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: replyFor(text) }]);
      setBusy(false);
    }, 450 + Math.min(600, text.length * 8));
  };

  const shellStyle = docked
    ? {
        display: "flex",
        flexDirection: "column",
        width: "min(380px, calc(100vw - 24px))",
        height: "min(520px, calc(100vh - 96px))",
        border: "1px solid #1F1F22",
        background: "linear-gradient(165deg, rgba(18,18,20,0.98) 0%, rgba(5,5,5,0.99) 100%)",
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        borderRadius: 16,
      }
    : {
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
        width: "100%",
      };

  const panel = (
    <div
      className={docked ? "ospry-chat" : "ospry-chat spry-rise w-full max-w-md md:max-w-none"}
      style={shellStyle}
      aria-label="Chat with iSpry, SpryMD care helper"
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 90% 0%, rgba(232,119,34,0.08), transparent 45%)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: docked ? "12px 14px" : "14px 16px",
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
              background: "#E87722",
              boxShadow: "0 0 0 3px rgba(232,119,34,0.15)",
            }}
          />
          <div>
            <div className="display" style={{ fontSize: docked ? 15 : 16, fontWeight: 600, color: "#FAFAFA", letterSpacing: "-0.02em" }}>
              iSpry
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(232,119,34,0.85)", textTransform: "uppercase" }}>
              Chat helper · online
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {!docked && (
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "#8A8A8E", textTransform: "uppercase" }}>
              Secure
            </span>
          )}
          {docked && (
            <>
              <button
                type="button"
                className="focus-ring"
                aria-label="Minimize iSpry"
                onClick={() => setExpanded(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "1px solid #1F1F22",
                  background: "transparent",
                  color: "#C8C8C8",
                  cursor: "pointer",
                }}
              >
                <Minus size={14} />
              </button>
              <button
                type="button"
                className="focus-ring"
                aria-label="Close iSpry panel"
                onClick={() => setExpanded(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "1px solid #1F1F22",
                  background: "transparent",
                  color: "#C8C8C8",
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hide"
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          overflowY: "auto",
          padding: docked ? "12px" : "16px",
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
                background: mine ? "rgba(232,119,34,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${mine ? "rgba(232,119,34,0.35)" : "#1F1F22"}`,
                color: mine ? "#FAFAFA" : "#C8C8C8",
                fontSize: 14,
                lineHeight: 1.45,
              }}
            >
              {!mine && (
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "#E87722", marginBottom: 6, textTransform: "uppercase" }}>
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

      {messages.length < 3 && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: docked ? "0 12px 10px" : "0 16px 12px",
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
          padding: docked ? 10 : 12,
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

      {onAction && !docked && (
        <div style={{ position: "relative", zIndex: 1, padding: "0 12px 12px" }}>
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
              color: "#E87722",
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-mono), ui-monospace, monospace",
            }}
          >
            Start a care plan <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );

  const dockBar = (
    <button
      type="button"
      className="focus-ring"
      onClick={() => setExpanded(true)}
      aria-label="Open iSpry chat"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px 12px 14px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(11,11,12,0.94)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
        color: "#FAFAFA",
        cursor: "pointer",
        maxWidth: "calc(100vw - 24px)",
      }}
    >
      <span
        className="breath-glow"
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(232,119,34,0.15)",
          border: "1px solid rgba(232,119,34,0.35)",
          color: "#E87722",
          flexShrink: 0,
        }}
      >
        <MessageCircle size={16} strokeWidth={2} />
      </span>
      <span style={{ textAlign: "left", minWidth: 0 }}>
        <span className="display" style={{ display: "block", fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em" }}>
          iSpry
        </span>
        <span className="mono" style={{ display: "block", fontSize: 10, letterSpacing: "0.12em", color: "rgba(232,119,34,0.9)", textTransform: "uppercase" }}>
          Ask anything
        </span>
      </span>
      <span
        style={{
          marginLeft: 4,
          width: 8,
          height: 8,
          borderRadius: 99,
          background: "#E87722",
          flexShrink: 0,
        }}
      />
    </button>
  );

  const floating = (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 70,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      {expanded ? panel : dockBar}
    </div>
  );

  return (
    <>
      {/* Hero slot — collapses when docked so the headline column can breathe */}
      <div
        aria-hidden={docked}
        style={{
          width: "100%",
          minHeight: docked ? 0 : undefined,
          height: docked ? 0 : undefined,
          overflow: "hidden",
          opacity: docked ? 0 : 1,
          pointerEvents: docked ? "none" : "auto",
          transition: "opacity 0.25s ease",
        }}
      >
        {!docked && panel}
      </div>
      {docked && typeof document !== "undefined" && createPortal(floating, document.body)}
    </>
  );
}

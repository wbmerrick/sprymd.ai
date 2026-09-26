import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

const THUMB = 48;
const PAD = 4;
const COMPLETE_RATIO = 0.88;

/**
 * Resend-style slide-to-confirm control.
 * User must press and drag the thumb to the right to fire onConfirm.
 */
export default function SlideToConfirm({
  label = "Slide to continue",
  loadingLabel = "Working…",
  disabled = false,
  loading = false,
  onConfirm,
  accent = "#C89E67",
  accentDeep = "#96703F",
  trackBg = "#101915",
  trackBorder = "#263129",
  ink = "#F4F1E8",
  muted = "#93A096",
}) {
  const trackRef = useRef(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const offsetRef = useRef(0);
  const maxOffsetRef = useRef(0);
  const completedRef = useRef(false);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const setOffsetSafe = (value) => {
    offsetRef.current = value;
    setOffset(value);
  };

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, el.clientWidth - THUMB - PAD * 2);
    maxOffsetRef.current = next;
    setMaxOffset(next);
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  // Reset after a failed attempt (loading → idle) so the user can try again.
  useEffect(() => {
    if (!loading) {
      completedRef.current = false;
      setOffsetSafe(0);
      setDragging(false);
    }
  }, [loading]);

  useEffect(() => {
    if (disabled && !loading) {
      completedRef.current = false;
      setOffsetSafe(0);
    }
  }, [disabled, loading]);

  const finish = useCallback(() => {
    if (completedRef.current || disabled || loading) return;
    completedRef.current = true;
    setOffsetSafe(maxOffsetRef.current);
    setDragging(false);
    onConfirm?.();
  }, [disabled, loading, onConfirm]);

  const onPointerDown = (e) => {
    if (disabled || loading || completedRef.current) return;
    e.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    startXRef.current = e.clientX;
    startOffsetRef.current = offsetRef.current;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current || disabled || loading) return;
    const delta = e.clientX - startXRef.current;
    const next = Math.min(maxOffsetRef.current, Math.max(0, startOffsetRef.current + delta));
    setOffsetSafe(next);
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const max = maxOffsetRef.current;
    if (max > 0 && offsetRef.current / max >= COMPLETE_RATIO) {
      finish();
    } else {
      setOffsetSafe(0);
    }
  };

  const onKeyDown = (e) => {
    if (disabled || loading || completedRef.current) return;
    if (e.key === "ArrowRight" || e.key === "End" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      finish();
    }
  };

  const ratio = maxOffset > 0 ? offset / maxOffset : 0;
  const labelOpacity = loading ? 1 : Math.max(0, 1 - ratio * 1.35);
  const interactive = !disabled && !loading;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={interactive ? 0 : -1}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuetext={loading ? loadingLabel : label}
      aria-label={label}
      aria-disabled={disabled || loading}
      onKeyDown={onKeyDown}
      className="focus-ring relative w-full select-none"
      style={{
        height: THUMB + PAD * 2,
        borderRadius: 14,
        background: trackBg,
        border: `1px solid ${trackBorder}`,
        opacity: disabled && !loading ? 0.45 : 1,
        cursor: interactive ? "grab" : "default",
        touchAction: "none",
        outline: "none",
      }}
    >
      {/* Progress fill */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 13,
          background: `linear-gradient(90deg, ${accent}22 0%, ${accent}55 100%)`,
          width: `calc(${PAD + THUMB / 2}px + ${offset}px)`,
          transition: dragging ? "none" : "width 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "none",
        }}
      />

      {/* Center label */}
      <span
        className="mono"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: loading ? accent : muted,
          opacity: labelOpacity,
          transition: dragging ? "none" : "opacity 0.2s ease",
          pointerEvents: "none",
          paddingLeft: THUMB,
          paddingRight: 12,
        }}
      >
        {loading ? loadingLabel : label}
      </span>

      {/* Thumb */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={!interactive}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "absolute",
          top: PAD,
          left: PAD + offset,
          width: THUMB,
          height: THUMB,
          borderRadius: 10,
          border: "none",
          background: loading ? accentDeep : accent,
          color: "#0C120F",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: interactive ? (dragging ? "grabbing" : "grab") : "default",
          transition: dragging ? "none" : "left 0.22s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease",
          boxShadow: interactive ? `0 2px 10px ${accent}55` : "none",
          touchAction: "none",
          padding: 0,
        }}
      >
        {loading || completedRef.current ? (
          <Check size={18} strokeWidth={2.25} className={loading ? "anim-pulse" : undefined} />
        ) : (
          <ArrowRight size={18} strokeWidth={2.25} color="#0C120F" />
        )}
      </button>
    </div>
  );
}

export { COMPLETE_RATIO, THUMB };

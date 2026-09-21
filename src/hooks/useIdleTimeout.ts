import { useCallback, useEffect, useRef } from "react";

/** Default idle window: 20 minutes. */
export const DEFAULT_IDLE_TIMEOUT_MS = 20 * 60 * 1000;

const DEFAULT_ACTIVITY_EVENTS: string[] = [
  "pointerdown",
  "pointermove",
  "keydown",
  "touchstart",
  "scroll",
];

export interface UseIdleTimeoutOptions {
  /** Called once when the user has been idle for `timeoutMs`. */
  onTimeout: () => void;
  /** Idle window in milliseconds. Defaults to 20 minutes. */
  timeoutMs?: number;
  /** When false, no timer runs and no listeners are attached. */
  enabled?: boolean;
  /** Window events that count as activity and reset the idle timer. */
  events?: string[];
}

export interface UseIdleTimeoutResult {
  /** Manually restart the idle timer (also re-arms after a fire). */
  reset: () => void;
}

/**
 * Fires `onTimeout` once after `timeoutMs` of no pointer/keyboard activity.
 * Activity resets the timer; after firing, only an explicit `reset()` re-arms
 * it. The latest `onTimeout` is always used without re-arming the timer when
 * the callback identity changes.
 */
export function useIdleTimeout({
  onTimeout,
  timeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
  enabled = true,
  events = DEFAULT_ACTIVITY_EVENTS,
}: UseIdleTimeoutOptions): UseIdleTimeoutResult {
  const onTimeoutRef = useRef(onTimeout);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const timeoutMsRef = useRef(timeoutMs);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    timeoutMsRef.current = timeoutMs;
  }, [timeoutMs]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const arm = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (firedRef.current) return;
      firedRef.current = true;
      onTimeoutRef.current();
    }, timeoutMsRef.current);
  }, [clearTimer]);

  const reset = useCallback(() => {
    firedRef.current = false;
    arm();
  }, [arm]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    firedRef.current = false;
    arm();

    const handleActivity = () => {
      // Fires once: passive activity after firing does not re-arm.
      if (firedRef.current) return;
      arm();
    };

    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearTimer();
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [enabled, timeoutMs, events, arm, clearTimer]);

  return { reset };
}

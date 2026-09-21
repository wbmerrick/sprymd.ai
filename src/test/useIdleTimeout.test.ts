import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { DEFAULT_IDLE_TIMEOUT_MS, useIdleTimeout } from "@/hooks/useIdleTimeout";

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const activity = (type = "pointermove") => {
  act(() => {
    window.dispatchEvent(new Event(type));
  });
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useIdleTimeout", () => {
  it("fires onTimeout at exactly timeoutMs of inactivity", () => {
    const onTimeout = vi.fn();
    renderHook(() => useIdleTimeout({ onTimeout, timeoutMs: 5_000 }));

    advance(4_999);
    expect(onTimeout).not.toHaveBeenCalled();
    advance(1);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("defaults the idle window to 20 minutes", () => {
    expect(DEFAULT_IDLE_TIMEOUT_MS).toBe(20 * 60 * 1000);

    const onTimeout = vi.fn();
    renderHook(() => useIdleTimeout({ onTimeout }));

    advance(DEFAULT_IDLE_TIMEOUT_MS - 1);
    expect(onTimeout).not.toHaveBeenCalled();
    advance(1);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("resets the timer on pointer activity", () => {
    const onTimeout = vi.fn();
    renderHook(() => useIdleTimeout({ onTimeout, timeoutMs: 1_000 }));

    advance(600);
    activity("pointermove");
    advance(600);
    expect(onTimeout).not.toHaveBeenCalled();
    advance(400);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("resets the timer on keyboard activity", () => {
    const onTimeout = vi.fn();
    renderHook(() => useIdleTimeout({ onTimeout, timeoutMs: 1_000 }));

    advance(900);
    activity("keydown");
    advance(900);
    expect(onTimeout).not.toHaveBeenCalled();
    advance(100);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("restarts the timer when reset() is called manually", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useIdleTimeout({ onTimeout, timeoutMs: 1_000 }));

    advance(800);
    act(() => {
      result.current.reset();
    });
    advance(800);
    expect(onTimeout).not.toHaveBeenCalled();
    advance(200);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("fires only once: activity after firing does not re-arm the timer", () => {
    const onTimeout = vi.fn();
    renderHook(() => useIdleTimeout({ onTimeout, timeoutMs: 1_000 }));

    advance(1_000);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    activity("pointerdown");
    advance(10_000);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("re-arms after firing when reset() is called explicitly", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useIdleTimeout({ onTimeout, timeoutMs: 1_000 }));

    advance(1_000);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.reset();
    });
    advance(1_000);
    expect(onTimeout).toHaveBeenCalledTimes(2);
  });

  it("never fires when enabled is false", () => {
    const onTimeout = vi.fn();
    renderHook(() => useIdleTimeout({ onTimeout, timeoutMs: 1_000, enabled: false }));

    activity("pointermove");
    advance(60_000);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("cleans up on unmount so a pending timer never fires", () => {
    const onTimeout = vi.fn();
    const { unmount } = renderHook(() => useIdleTimeout({ onTimeout, timeoutMs: 1_000 }));

    advance(500);
    unmount();
    advance(5_000);
    expect(onTimeout).not.toHaveBeenCalled();
  });
});

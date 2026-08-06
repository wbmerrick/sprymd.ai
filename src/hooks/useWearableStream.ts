import { useEffect, useRef } from "react";
import type { WearableDevice } from "@/types/dashboard";
import { appendContinuousTick } from "@/lib/patientCareStore";
import { CONTINUOUS_TICK_MS } from "@/data/wearables";

/**
 * Browser-simulated realtime stream for owned devices in continuous mode.
 * Pauses when the tab is hidden.
 */
export function useWearableStream(email: string | null | undefined, devices: WearableDevice[] | undefined, onTick?: () => void) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!email) return;
    const list = (devices || []).filter((d) => d.owned && d.enabled && d.syncMode === "continuous");
    if (!list.length) return;

    const timers: number[] = [];
    let visible = typeof document === "undefined" ? true : document.visibilityState !== "hidden";

    const start = () => {
      for (const t of timers) window.clearInterval(t);
      timers.length = 0;
      if (!visible) return;
      for (const device of list) {
        const ms = CONTINUOUS_TICK_MS[device.id] || 5000;
        const id = window.setInterval(() => {
          appendContinuousTick(email, device.id);
          onTickRef.current?.();
        }, ms);
        timers.push(id);
      }
    };

    const onVisibility = () => {
      visible = document.visibilityState !== "hidden";
      start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      for (const t of timers) window.clearInterval(t);
    };
  }, [email, devices]);
}

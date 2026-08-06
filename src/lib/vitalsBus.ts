/** Cross-tab / in-app vitals event bus (BroadcastChannel + same-tab CustomEvent). */

export type VitalsBusEvent =
  | { type: "reading"; deviceId: string; readingId: string; at: string }
  | { type: "profile"; at: string }
  | { type: "goal"; at: string }
  | { type: "device"; deviceId: string; at: string }
  | { type: "refresh"; at: string };

const CHANNEL = "sprymd-vitals-v1";
const WINDOW_EVENT = "sprymd-vitals";

function canUseBroadcast(): boolean {
  return typeof BroadcastChannel !== "undefined";
}

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (!canUseBroadcast()) return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL);
  return channel;
}

export function publishVitalsEvent(event: VitalsBusEvent) {
  const payload = { ...event, at: event.at || new Date().toISOString() };
  try {
    getChannel()?.postMessage(payload);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WINDOW_EVENT, { detail: payload }));
  }
}

export function subscribeVitalsEvents(handler: (event: VitalsBusEvent) => void): () => void {
  const onMessage = (ev: MessageEvent<VitalsBusEvent>) => {
    if (ev?.data?.type) handler(ev.data);
  };
  const onWindow = (ev: Event) => {
    const detail = (ev as CustomEvent<VitalsBusEvent>).detail;
    if (detail?.type) handler(detail);
  };

  const ch = getChannel();
  ch?.addEventListener("message", onMessage);
  if (typeof window !== "undefined") {
    window.addEventListener(WINDOW_EVENT, onWindow);
  }

  return () => {
    ch?.removeEventListener("message", onMessage);
    if (typeof window !== "undefined") {
      window.removeEventListener(WINDOW_EVENT, onWindow);
    }
  };
}

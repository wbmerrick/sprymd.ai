import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  logSessionDuration,
  type SaveResult,
  type SessionDurationLog,
} from "@/lib/clinicalDrafts";
import {
  formatDuration,
  sessionDurationSeconds,
  shouldStartSessionClock,
} from "@/lib/visitTimer";
import { videoVendorNotice, type VideoVendorId } from "@/lib/videoVendors";
import type { VisitRole } from "@/types/telehealth";

type ChatLine = {
  id: string;
  role: VisitRole;
  body: string;
  at: string;
};

type ConsultationRoomProps = {
  appointmentId: string;
  role: VisitRole;
  displayName: string;
  vendor?: VideoVendorId;
  remoteJoined?: boolean;
  allowSimulateRemote?: boolean;
  onLogDuration?: (entry: SessionDurationLog) => Promise<SaveResult> | void;
};

type PresenceMessage = {
  type: "presence" | "chat" | "leave";
  appointmentId: string;
  role: VisitRole;
  displayName?: string;
  body?: string;
  id?: string;
  at?: string;
};

export default function ConsultationRoom({
  appointmentId,
  role,
  displayName,
  vendor = "local-preview",
  remoteJoined,
  allowSimulateRemote = remoteJoined == null,
  onLogDuration = logSessionDuration,
}: ConsultationRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loggedRef = useRef(false);
  const [localJoined, setLocalJoined] = useState(false);
  const [broadcastRemote, setBroadcastRemote] = useState(false);
  const [simulatedRemote, setSimulatedRemote] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [bothJoinedAt, setBothJoinedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [draft, setDraft] = useState("");
  const [logMessage, setLogMessage] = useState<string | null>(null);

  const remotePresent = remoteJoined ?? (broadcastRemote || simulatedRemote);
  const otherRole: VisitRole = role === "patient" ? "provider" : "patient";
  const clockRunning = localJoined && remotePresent && bothJoinedAt != null && endedAt == null;
  const durationSeconds = sessionDurationSeconds(bothJoinedAt, endedAt, now);

  useEffect(() => {
    if (shouldStartSessionClock(localJoined, remotePresent, bothJoinedAt)) {
      setBothJoinedAt(Date.now());
    }
  }, [bothJoinedAt, localJoined, remotePresent]);

  useEffect(() => {
    if (!clockRunning) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [clockRunning]);

  useEffect(() => {
    if (remoteJoined != null || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(`sprymd-visit-${appointmentId}`);
    const announce = () => {
      if (!localJoined) return;
      const message: PresenceMessage = {
        type: "presence",
        appointmentId,
        role,
        displayName,
      };
      channel.postMessage(message);
    };
    const onMessage = (event: MessageEvent<PresenceMessage>) => {
      const message = event.data;
      if (!message || message.appointmentId !== appointmentId || message.role === role) return;
      if (message.type === "presence") setBroadcastRemote(true);
      if (message.type === "leave") setBroadcastRemote(false);
      if (message.type === "chat" && message.body && message.id && message.at) {
        setChat((current) =>
          current.some((line) => line.id === message.id)
            ? current
            : [...current, { id: message.id, role: message.role, body: message.body, at: message.at }],
        );
      }
    };
    channel.addEventListener("message", onMessage);
    announce();
    const pulse = window.setInterval(announce, 2000);
    return () => {
      window.clearInterval(pulse);
      channel.close();
    };
  }, [appointmentId, displayName, localJoined, remoteJoined, role]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function join() {
    setJoinError(null);
    setLocalJoined(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const playResult = videoRef.current.play?.();
        if (playResult && typeof playResult.then === "function") {
          await playResult.catch(() => undefined);
        }
      }
    } catch {
      setJoinError("Camera and microphone are unavailable. You can still use chat.");
    }
  }

  function setTrackEnabled(kind: "audio" | "video", enabled: boolean) {
    streamRef.current
      ?.getTracks()
      .filter((track) => track.kind === kind)
      .forEach((track) => {
        track.enabled = enabled;
      });
  }

  async function finish(reason: string) {
    if (endedAt != null) return;
    const ended = Date.now();
    setEndedAt(ended);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(`sprymd-visit-${appointmentId}`);
      channel.postMessage({ type: "leave", appointmentId, role } satisfies PresenceMessage);
      channel.close();
    }
    if (loggedRef.current) return;
    if (bothJoinedAt == null) {
      setLogMessage("No session time recorded. Both parties have to join first.");
      return;
    }
    loggedRef.current = true;
    const entry: SessionDurationLog = {
      appointmentId,
      role,
      durationSeconds: sessionDurationSeconds(bothJoinedAt, ended, ended),
      startedAt: new Date(bothJoinedAt).toISOString(),
      endedAt: new Date(ended).toISOString(),
      videoVendor: vendor,
    };
    try {
      const result = await onLogDuration(entry);
      const saved = result && typeof result === "object" && "message" in result
        ? result.message
        : `${reason} Duration logged.`;
      setLogMessage(saved);
    } catch {
      setLogMessage("Could not log session duration.");
    }
  }

  function sendChat(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    const line: ChatLine = {
      id: `${Date.now()}-${role}`,
      role,
      body,
      at: new Date().toISOString(),
    };
    setChat((current) => [...current, line]);
    setDraft("");
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(`sprymd-visit-${appointmentId}`);
      channel.postMessage({
        type: "chat",
        appointmentId,
        role,
        body: line.body,
        id: line.id,
        at: line.at,
      } satisfies PresenceMessage);
      channel.close();
    }
  }

  return (
    <div className="min-h-screen bg-navy text-primary-foreground flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
        <div>
          <p className="font-display text-lg">SpryMD visit</p>
          <p className="font-body text-xs text-primary-foreground/70">
            {displayName} · {role} · {appointmentId}
          </p>
        </div>
        <div className="text-right">
          <p className="font-body text-xs uppercase tracking-widest text-primary-foreground/60">
            {clockRunning ? "Session time" : bothJoinedAt ? "Session paused" : "Waiting for both participants"}
          </p>
          <p data-testid="session-timer" className="font-display text-3xl tabular-nums">
            {formatDuration(durationSeconds)}
          </p>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-[minmax(0,1fr)_320px] min-h-0">
        <section className="p-4 flex flex-col gap-4">
          <div className="relative flex-1 min-h-[280px] rounded-2xl bg-black/40 overflow-hidden border border-white/10">
            <video
              ref={videoRef}
              muted
              playsInline
              className={`w-full h-full object-cover ${videoOn && localJoined ? "" : "hidden"}`}
            />
            {(!localJoined || !videoOn) && (
              <div className="absolute inset-0 flex items-center justify-center font-body text-primary-foreground/80 px-6 text-center">
                {localJoined ? "Camera off" : "Join to start your camera preview"}
              </div>
            )}
            <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-body">
              {remotePresent ? `${otherRole} is in the room` : `Waiting for ${otherRole}`}
            </div>
          </div>
          <p className="font-body text-xs text-primary-foreground/70">{videoVendorNotice(vendor)}</p>
          {joinError && <p className="font-body text-sm text-red-300">{joinError}</p>}
          {logMessage && (
            <p role="status" className="font-body text-sm">
              {logMessage}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {!localJoined ? (
              <button type="button" className="btn-primary" data-testid="join-visit" onClick={() => void join()}>
                Join visit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  data-testid="mic-toggle"
                  aria-pressed={audioOn}
                  className="rounded-full border border-white/20 px-4 py-2 font-body text-sm"
                  onClick={() => {
                    const next = !audioOn;
                    setAudioOn(next);
                    setTrackEnabled("audio", next);
                  }}
                >
                  {audioOn ? "Mute" : "Unmute"}
                </button>
                <button
                  type="button"
                  data-testid="camera-toggle"
                  aria-pressed={videoOn}
                  className="rounded-full border border-white/20 px-4 py-2 font-body text-sm"
                  onClick={() => {
                    const next = !videoOn;
                    setVideoOn(next);
                    setTrackEnabled("video", next);
                  }}
                >
                  {videoOn ? "Stop video" : "Start video"}
                </button>
                <button
                  type="button"
                  data-testid="leave-visit"
                  className="rounded-full bg-red-600 px-4 py-2 font-body text-sm"
                  onClick={() => void finish("You left the visit.")}
                >
                  Leave
                </button>
                {allowSimulateRemote && remoteJoined == null && !remotePresent && (
                  <button
                    type="button"
                    data-testid="simulate-remote"
                    className="rounded-full border border-white/20 px-4 py-2 font-body text-sm"
                    onClick={() => setSimulatedRemote(true)}
                  >
                    Simulate {otherRole} joined
                  </button>
                )}
              </>
            )}
            <Link
              to={`/provider/notes?appointmentId=${encodeURIComponent(appointmentId)}`}
              className="rounded-full border border-white/20 px-4 py-2 font-body text-sm self-center"
            >
              SOAP note
            </Link>
          </div>
        </section>

        <aside className="border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col min-h-[320px]">
          <div className="px-4 py-3 border-b border-white/10">
            <h2 className="font-display text-lg">Secure chat</h2>
            <p className="font-body text-xs text-primary-foreground/70">
              Messages stay in this visit. They are not written to the browser
              store. Production chat should use the video vendor data channel
              under the same BAA.
            </p>
          </div>
          <div data-testid="chat-log" className="flex-1 overflow-y-auto p-4 space-y-3">
            {chat.length === 0 && (
              <p className="font-body text-sm text-primary-foreground/60">No messages yet.</p>
            )}
            {chat.map((line) => (
              <p key={line.id} className="font-body text-sm">
                <span className="text-primary-foreground/60">{line.role}: </span>
                {line.body}
              </p>
            ))}
          </div>
          <form onSubmit={sendChat} className="p-3 flex gap-2 border-t border-white/10">
            <input
              data-testid="chat-input"
              aria-label="Message the visit"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Message the visit"
              className="flex-1 rounded-xl bg-white/10 px-3 py-2 font-body text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button type="submit" data-testid="chat-send" className="btn-primary px-4">
              Send
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

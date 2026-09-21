import type { VisitRole } from "@/types/telehealth";
import { liveVideoFallbackMessage } from "../../shared/videoRoom";

export type VisitChatPayload = {
  type: "chat";
  id: string;
  role: VisitRole;
  body: string;
  at: string;
};

export type LiveConnection = {
  vendor: "daily" | "twilio";
  setAudioEnabled: (on: boolean) => void;
  setVideoEnabled: (on: boolean) => void;
  sendChat: (payload: VisitChatPayload) => void;
  leave: () => Promise<void>;
};

export type LiveJoinResult =
  | { connection: LiveConnection }
  | { fallbackReason: string };

type ConnectArgs = {
  appointmentId: string;
  role: VisitRole;
  displayName: string;
  onRemoteJoined: (present: boolean) => void;
  onChat: (payload: VisitChatPayload) => void;
  onLocalVideo: (track: MediaStreamTrack | null) => void;
  onRemoteVideo: (track: MediaStreamTrack | null) => void;
};

function isChatPayload(value: unknown): value is VisitChatPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as VisitChatPayload;
  return (
    payload.type === "chat" &&
    typeof payload.id === "string" &&
    typeof payload.body === "string" &&
    (payload.role === "patient" || payload.role === "provider") &&
    typeof payload.at === "string"
  );
}

async function joinDaily(
  roomUrl: string,
  token: string,
  displayName: string,
  args: ConnectArgs,
): Promise<LiveConnection> {
  const Daily = (await import("@daily-co/daily-js")).default;
  const call = Daily.createCallObject({ subscribeToTracksAutomatically: true });

  call.on("participant-joined", (event) => {
    if (!event.participant.local) args.onRemoteJoined(true);
  });
  call.on("participant-left", (event) => {
    if (!event.participant.local) args.onRemoteJoined(false);
  });
  call.on("track-started", (event) => {
    if (!event.participant) return;
    if (event.track.kind !== "video" || event.type === "screenVideo") {
      if (!event.participant.local) args.onRemoteJoined(true);
      return;
    }
    if (event.participant.local) args.onLocalVideo(event.track);
    else {
      args.onRemoteJoined(true);
      args.onRemoteVideo(event.track);
    }
  });
  call.on("track-stopped", (event) => {
    if (!event.participant || event.track.kind !== "video") return;
    if (event.participant.local) args.onLocalVideo(null);
    else args.onRemoteVideo(null);
  });
  call.on("app-message", (event) => {
    if (isChatPayload(event.data)) args.onChat(event.data);
  });

  await call.join({
    url: roomUrl,
    token,
    userName: displayName,
    startVideoOff: false,
    startAudioOff: false,
  });

  for (const participant of Object.values(call.participants())) {
    if (!participant.local) args.onRemoteJoined(true);
  }

  return {
    vendor: "daily",
    setAudioEnabled: (on) => {
      void call.setLocalAudio(on);
    },
    setVideoEnabled: (on) => {
      void call.setLocalVideo(on);
    },
    sendChat: (payload) => {
      call.sendAppMessage(payload, "*");
    },
    leave: async () => {
      await call.leave().catch(() => undefined);
      await call.destroy();
    },
  };
}

async function joinTwilio(
  token: string,
  roomName: string,
  args: ConnectArgs,
): Promise<LiveConnection> {
  const Video = await import("twilio-video");
  const room = await Video.connect(token, {
    name: roomName,
    audio: true,
    video: { width: 1280, height: 720 },
  });
  const dataTrack = new Video.LocalDataTrack();
  await room.localParticipant.publishTrack(dataTrack);

  const localVideo = Array.from(room.localParticipant.videoTracks.values())[0]?.track;
  if (localVideo) args.onLocalVideo(localVideo.mediaStreamTrack);

  const wireRemote = (participant: {
    on: (event: string, listener: (track: unknown) => void) => void;
    tracks: Map<string, { track?: { kind: string; mediaStreamTrack?: MediaStreamTrack; on?: (event: string, listener: (data: string) => void) => void } }>;
  }) => {
    args.onRemoteJoined(true);
    const attach = (track: { kind: string; mediaStreamTrack?: MediaStreamTrack; on?: (event: string, listener: (data: string) => void) => void }) => {
      if (track.kind === "video" && track.mediaStreamTrack) {
        args.onRemoteVideo(track.mediaStreamTrack);
      }
      if (track.kind === "data" && track.on) {
        track.on("message", (data: string) => {
          try {
            const parsed = JSON.parse(data) as unknown;
            if (isChatPayload(parsed)) args.onChat(parsed);
          } catch {
            // Ignore non-chat data frames.
          }
        });
      }
    };
    participant.tracks.forEach((publication) => {
      if (publication.track) attach(publication.track);
    });
    participant.on("trackSubscribed", (track) => {
      attach(track as { kind: string; mediaStreamTrack?: MediaStreamTrack; on?: (event: string, listener: (data: string) => void) => void });
    });
    participant.on("trackUnsubscribed", (track) => {
      const video = track as { kind?: string };
      if (video.kind === "video") args.onRemoteVideo(null);
    });
  };

  room.participants.forEach((participant) => wireRemote(participant));
  room.on("participantConnected", (participant) => wireRemote(participant));
  room.on("participantDisconnected", () => {
    if (room.participants.size === 0) {
      args.onRemoteJoined(false);
      args.onRemoteVideo(null);
    }
  });

  return {
    vendor: "twilio",
    setAudioEnabled: (on) => {
      room.localParticipant.audioTracks.forEach((publication) => {
        if (on) publication.track?.enable();
        else publication.track?.disable();
      });
    },
    setVideoEnabled: (on) => {
      room.localParticipant.videoTracks.forEach((publication) => {
        if (on) publication.track?.enable();
        else publication.track?.disable();
      });
    },
    sendChat: (payload) => {
      dataTrack.send(JSON.stringify(payload));
    },
    leave: async () => {
      room.disconnect();
    },
  };
}

/**
 * Asks the server for a room token and joins Daily.co or Twilio Video.
 * Returns a fallback reason when the user is signed out or the server has no vendor keys.
 */
export async function connectLiveVisit(args: ConnectArgs): Promise<LiveJoinResult> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      return { fallbackReason: liveVideoFallbackMessage("auth_required") };
    }

    const response = await fetch("/api/visits/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        appointmentId: args.appointmentId,
        role: args.role,
        displayName: args.displayName,
      }),
    });
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      vendor?: string;
      token?: string;
      roomUrl?: string;
      roomName?: string;
    };
    if (!response.ok || !body.token) {
      return { fallbackReason: liveVideoFallbackMessage(body.error) };
    }

    if (body.vendor === "daily" && body.roomUrl) {
      return {
        connection: await joinDaily(body.roomUrl, body.token, args.displayName, args),
      };
    }
    if (body.vendor === "twilio" && body.roomName) {
      return { connection: await joinTwilio(body.token, body.roomName, args) };
    }
    return { fallbackReason: liveVideoFallbackMessage(undefined) };
  } catch {
    return { fallbackReason: liveVideoFallbackMessage(undefined) };
  }
}

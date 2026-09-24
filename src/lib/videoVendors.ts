/**
 * HIPAA video integration outline for SpryMD visits.
 *
 * Do not send visit audio, video, or chat through a vendor until a Business
 * Associate Agreement is signed. Tokens are minted on the server. The browser
 * only receives a short-lived room token — never an API secret.
 *
 * Daily.co
 * 1. Sign Daily's BAA and create a private room per appointment.
 * 2. POST /api/visits/token with the signed-in user and appointment id.
 * 3. Server calls Daily's REST API with DAILY_API_KEY and returns
 *    { vendor: "daily", roomUrl, token }.
 * 4. Client: import("@daily-co/daily-js"), callDailyIframe or createCallObject,
 *    join({ url: roomUrl, token }), and bind setLocalAudio / setLocalVideo
 *    to the mic and camera toggles. Start the session clock on
 *    participant-joined once both patient and provider are present.
 *
 * Twilio Video
 * 1. Sign Twilio's BAA. Use a Twilio Video room (not the unsecured demo keys).
 * 2. Server uses TWILIO_ACCOUNT_SID, TWILIO_API_KEY, and TWILIO_API_SECRET
 *    to mint an Access Token whose grants are limited to that room.
 * 3. Client: import("twilio-video"), connect(token, { name: roomName, audio, video }).
 *    Track local participant audio/video enablement for the toggles.
 *    Treat participantConnected for the other role as the second join.
 *
 * The live path is implemented:
 * - POST /api/visits/token mints a private-room token after checking the
 *   signed-in patient or assigned provider.
 * - src/lib/liveVideo.ts joins with @daily-co/daily-js or twilio-video.
 * - Chat uses Daily app messages or a Twilio data track.
 * - If the user is signed out or no vendor key is set, the room stays a
 *   local preview and does not transmit audio or video.
 *
 * Required server env (set one vendor):
 * - Daily: DAILY_API_KEY
 * - Twilio: TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET
 * - Optional VIDEO_VENDOR=daily|twilio|off
 */

export type VideoVendorId = "local-preview" | "daily" | "twilio";

export const VIDEO_VENDOR_REQUIREMENTS: Record<
  Exclude<VideoVendorId, "local-preview">,
  { packageName: string; serverEnv: string[]; summary: string }
> = {
  daily: {
    packageName: "@daily-co/daily-js",
    serverEnv: ["DAILY_API_KEY", "DAILY_DOMAIN"],
    summary:
      "Mint a private-room token on the server after the Daily BAA is in place.",
  },
  twilio: {
    packageName: "twilio-video",
    serverEnv: ["TWILIO_ACCOUNT_SID", "TWILIO_API_KEY", "TWILIO_API_SECRET"],
    summary:
      "Mint a room-scoped Access Token on the server after the Twilio BAA is in place.",
  },
};

export function videoVendorNotice(vendor: VideoVendorId): string {
  if (vendor === "daily") {
    return "Encrypted Daily.co room. A signed Daily BAA is required before this carries patient information.";
  }
  if (vendor === "twilio") {
    return "Encrypted Twilio Video room. A signed Twilio BAA is required before this carries patient information.";
  }
  return "Local preview only. Audio and video stay on this device until Daily.co or Twilio Video is configured.";
}

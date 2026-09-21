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
 * This build ships a local-preview adapter so the room UI, toggles, chat, and
 * duration log work without those secrets. Local preview never leaves the
 * browser and is not a HIPAA video transport.
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
  if (vendor === "local-preview") {
    return "Local preview only. Audio and video stay on this device. Production visits use Daily.co or Twilio Video under a signed BAA.";
  }
  const req = VIDEO_VENDOR_REQUIREMENTS[vendor];
  return `${req.summary} Install ${req.packageName}. Server env: ${req.serverEnv.join(", ")}.`;
}

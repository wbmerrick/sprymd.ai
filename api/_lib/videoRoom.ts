/**
 * Mirrored from shared/videoRoom.ts for Vercel API bundling — keep in sync.
 * Do NOT import from ../../shared in /api: /api builds as CommonJS and /shared
 * as ESM, so the deployed function crashes at load with ERR_REQUIRE_ESM.
 */

export type LiveVendor = "daily" | "twilio";

const APPOINTMENT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isAppointmentId(value: string): boolean {
  return APPOINTMENT_ID_RE.test(value);
}

/** Daily and Twilio room names: lowercase, letters, numbers, hyphens. */
export function visitRoomName(appointmentId: string): string {
  const safe = appointmentId.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return `sprymd-${safe}`.slice(0, 100);
}

type VendorEnv = {
  VIDEO_VENDOR?: string;
  DAILY_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_API_KEY?: string;
  TWILIO_API_SECRET?: string;
};

export function selectLiveVendor(env: VendorEnv): LiveVendor | null {
  const forced = (env.VIDEO_VENDOR || "").trim().toLowerCase();
  const dailyReady = Boolean(env.DAILY_API_KEY);
  const twilioReady = Boolean(
    env.TWILIO_ACCOUNT_SID && env.TWILIO_API_KEY && env.TWILIO_API_SECRET,
  );

  if (forced === "local-preview" || forced === "none" || forced === "off") {
    return null;
  }
  if (forced === "daily") return dailyReady ? "daily" : null;
  if (forced === "twilio") return twilioReady ? "twilio" : null;
  if (dailyReady) return "daily";
  if (twilioReady) return "twilio";
  return null;
}

export function cleanDisplayName(value: string, fallback: string): string {
  // eslint-disable-next-line no-control-regex -- stripping control characters is the point
  const cleaned = value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 80);
  return cleaned || fallback;
}

/** Shared rules for SpryMD live visit rooms. No secrets. */

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

export function liveVideoFallbackMessage(error: string | undefined): string {
  switch (error) {
    case "auth_required":
    case "invalid_session":
      return "Sign in to join the encrypted visit. This preview stays on your device.";
    case "video_not_configured":
      return "Live video is not configured on the server. This preview stays on your device.";
    case "not_a_participant":
      return "This visit is not on your account. This preview stays on your device.";
    case "appointment_not_found":
      return "This appointment is not on file. This preview stays on your device.";
    case "invalid_appointment_id":
      return "Live video needs a real appointment id. This preview stays on your device.";
    default:
      return "Could not start the encrypted visit. This preview stays on your device.";
  }
}

export function cleanDisplayName(value: string, fallback: string): string {
  const cleaned = value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 80);
  return cleaned || fallback;
}

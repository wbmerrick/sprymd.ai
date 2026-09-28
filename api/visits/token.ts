import type { VercelRequest, VercelResponse } from "@vercel/node";
import twilio from "twilio";
import { handlePreflight } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import {
  cleanDisplayName,
  isAppointmentId,
  selectLiveVendor,
  visitRoomName,
} from "../../shared/videoRoom";

type TokenBody = {
  appointmentId?: string;
  role?: string;
  displayName?: string;
};

function parseBody(req: VercelRequest): TokenBody {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}") as TokenBody;
    } catch {
      return {};
    }
  }
  return req.body as TokenBody;
}

type DailyResponse = { ok: boolean; body: Record<string, unknown> };

async function dailyRequest(
  method: string,
  path: string,
  payload?: unknown,
): Promise<DailyResponse> {
  const apiKey = process.env.DAILY_API_KEY || "";
  const response = await fetch(`https://api.daily.co/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = {};
  }
  return { ok: response.ok, body };
}

async function ensureDailyRoom(roomName: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 4;
  const created = await dailyRequest("POST", "/rooms", {
    name: roomName,
    privacy: "private",
    properties: {
      max_participants: 4,
      enable_chat: false,
      enable_screenshare: false,
      enable_knocking: false,
      eject_at_room_exp: true,
      exp,
    },
  });
  if (created.ok && typeof created.body.url === "string") return created.body.url;

  const existing = await dailyRequest("GET", `/rooms/${encodeURIComponent(roomName)}`);
  if (existing.ok && typeof existing.body.url === "string") return existing.body.url;

  throw new Error("daily_room_failed");
}

async function mintDailyToken(input: {
  roomName: string;
  roomUrl: string;
  displayName: string;
  userId: string;
  role: "patient" | "provider";
}) {
  const minted = await dailyRequest("POST", "/meeting-tokens", {
    properties: {
      room_name: input.roomName,
      user_name: input.displayName,
      user_id: input.userId,
      is_owner: input.role === "provider",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
      eject_at_token_exp: true,
    },
  });
  const token = minted.body.token;
  if (!minted.ok || typeof token !== "string") {
    throw new Error("daily_token_failed");
  }
  return {
    vendor: "daily" as const,
    token,
    roomUrl: input.roomUrl,
    roomName: input.roomName,
  };
}

function mintTwilioToken(input: {
  roomName: string;
  displayName: string;
  userId: string;
  role: "patient" | "provider";
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const apiKey = process.env.TWILIO_API_KEY || "";
  const apiSecret = process.env.TWILIO_API_SECRET || "";
  const AccessToken = twilio.jwt.AccessToken;
  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity: `${input.role}:${input.userId}`.slice(0, 120),
    ttl: 60 * 60 * 2,
  });
  token.addGrant(new AccessToken.VideoGrant({ room: input.roomName }));
  return {
    vendor: "twilio" as const,
    token: token.toJwt(),
    roomName: input.roomName,
    identity: input.displayName,
  };
}

/**
 * Mints a short-lived Daily.co or Twilio Video token for one appointment.
 * The browser never sees DAILY_API_KEY or Twilio secrets.
 * Caller must be the patient or assigned provider on that appointment.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "auth_required" });
    return;
  }

  const body = parseBody(req);
  const appointmentId = String(body.appointmentId || "");
  const role = body.role === "provider" ? "provider" : body.role === "patient" ? "patient" : "";
  if (!role || !isAppointmentId(appointmentId)) {
    res.status(400).json({ error: "invalid_appointment_id" });
    return;
  }

  const vendor = selectLiveVendor(process.env);
  if (!vendor) {
    res.status(503).json({ error: "video_not_configured" });
    return;
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: userData, error: userError } = await admin.auth.getUser(
      header.slice("Bearer ".length),
    );
    if (userError || !userData.user) {
      res.status(401).json({ error: "invalid_session" });
      return;
    }

    const userId = userData.user.id;
    const { data: appointment, error: appointmentError } = await admin
      .from("appointments")
      .select("id, patient_id, provider_id")
      .eq("id", appointmentId)
      .maybeSingle();
    if (appointmentError || !appointment) {
      res.status(404).json({ error: "appointment_not_found" });
      return;
    }

    const [{ data: patient }, { data: provider }] = await Promise.all([
      admin.from("patients").select("id").eq("user_id", userId).maybeSingle(),
      admin.from("providers").select("id, full_name").eq("user_id", userId).maybeSingle(),
    ]);

    const isPatient = patient?.id === appointment.patient_id;
    const isProvider = provider?.id != null && provider.id === appointment.provider_id;
    if (role === "patient" && !isPatient) {
      res.status(403).json({ error: "not_a_participant" });
      return;
    }
    if (role === "provider" && !isProvider) {
      res.status(403).json({ error: "not_a_participant" });
      return;
    }

    const displayName = cleanDisplayName(
      String(body.displayName || ""),
      role === "provider" ? provider?.full_name || "Provider" : "Patient",
    );
    const roomName = visitRoomName(appointmentId);

    if (vendor === "daily") {
      const roomUrl = await ensureDailyRoom(roomName);
      const minted = await mintDailyToken({
        roomName,
        roomUrl,
        displayName,
        userId,
        role,
      });
      res.status(200).json(minted);
      return;
    }

    res.status(200).json(mintTwilioToken({ roomName, displayName, userId, role }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "video_token_failed";
    console.error(JSON.stringify({ event: "visit_token_failed", message }));
    res.status(500).json({ error: "video_token_failed" });
  }
}

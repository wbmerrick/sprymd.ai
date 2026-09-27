import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SessionBody = {
  appointmentId?: string;
  role?: string;
  durationSeconds?: number;
  startedAt?: string;
  endedAt?: string;
  videoVendor?: string;
};

function parseBody(req: VercelRequest): SessionBody {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}") as SessionBody;
    } catch {
      return {};
    }
  }
  return req.body as SessionBody;
}

/**
 * Records visit duration after both parties have joined.
 * Requires a Supabase access token. The caller must be the patient or the
 * assigned provider on the appointment. Service role writes the row.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  const durationSeconds = Number(body.durationSeconds);
  const role = body.role === "provider" ? "provider" : "patient";

  if (!UUID_RE.test(appointmentId)) {
    res.status(400).json({ error: "invalid_appointment_id" });
    return;
  }
  if (!Number.isInteger(durationSeconds) || durationSeconds < 0) {
    res.status(400).json({ error: "invalid_duration" });
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
      admin.from("providers").select("id").eq("user_id", userId).maybeSingle(),
    ]);

    const isPatient = patient?.id === appointment.patient_id;
    const isProvider = provider?.id != null && provider.id === appointment.provider_id;
    if (!isPatient && !isProvider) {
      res.status(403).json({ error: "not_a_participant" });
      return;
    }

    const joinedColumn = role === "provider" ? "provider_joined_at" : "patient_joined_at";
    const { error: upsertError } = await admin.from("visit_sessions").upsert(
      {
        appointment_id: appointmentId,
        [joinedColumn]: body.startedAt || new Date().toISOString(),
        both_joined_at: body.startedAt || new Date().toISOString(),
        ended_at: body.endedAt || new Date().toISOString(),
        duration_seconds: durationSeconds,
        video_vendor: body.videoVendor || "local-preview",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "appointment_id" },
    );

    if (upsertError) {
      res.status(500).json({ error: "session_log_failed", message: upsertError.message });
      return;
    }

    res.status(200).json({ ok: true, durationSeconds });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "session_log_failed", message });
  }
}

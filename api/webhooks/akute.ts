import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Readable } from "node:stream";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import { verifyAkuteWebhookSignature } from "../_lib/akute/verifyWebhook";
import { patientIdFromWebhook, syncPatientIntake } from "../_lib/akute/intakeSync";
import {
  canonicalJson,
  eventIdOf,
  eventOf,
  resourceOf,
  signatureAgeSec,
  type AkuteWebhookBody,
} from "../_lib/akute/webhookPayload";

export const config = {
  api: {
    bodyParser: false,
  },
  // Intake sync adds a few Akute round-trips on top of event storage.
  maxDuration: 30,
};

/** Akute may retry a delivery minutes later; event_id idempotency covers replays. */
const SIGNATURE_TOLERANCE_SEC = 15 * 60;

async function buffer(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Akute issues one secret per notification. AKUTE_WEBHOOK_SECRET may therefore
 * hold several, comma-separated; a delivery is accepted if any of them signs it.
 */
function webhookSecrets(): string[] {
  return String(process.env.AKUTE_WEBHOOK_SECRET || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** One line per delivery outcome, so a rejected webhook is visible in the logs. */
function logDelivery(level: "log" | "warn" | "error", fields: Record<string, unknown>) {
  console[level](JSON.stringify({ event: "akute_webhook", ...fields }));
}

function verifyAny(rawBody: string, sig: string | undefined): { ok: true } | { ok: false; reason: string } {
  const secrets = webhookSecrets();
  if (!secrets.length) return { ok: false, reason: "missing_secret" };
  const bodies = [rawBody];
  const canonical = canonicalJson(rawBody);
  if (canonical) bodies.push(canonical);
  let last: { ok: true } | { ok: false; reason: string } = { ok: false, reason: "signature_mismatch" };
  for (const body of bodies) {
    for (const secret of secrets) {
      last = verifyAkuteWebhookSignature({
        rawBody: body,
        signatureHeader: sig,
        secret,
        toleranceSec: SIGNATURE_TOLERANCE_SEC,
      });
      if (last.ok) return last;
    }
  }
  return last;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const rawBuf = await buffer(req);
  const rawBody = rawBuf.toString("utf8");
  const sig =
    (req.headers["x-akute-signature"] as string | undefined) ||
    (req.headers["X-Akute-Signature"] as string | undefined);

  const verified = verifyAny(rawBody, sig);
  if (!verified.ok) {
    logDelivery("warn", {
      outcome: "rejected",
      status: 401,
      reason: verified.reason,
      hasSignature: Boolean(sig),
      signatureAgeSec: signatureAgeSec(sig),
      bodyBytes: rawBuf.length,
    });
    res.status(401).json({ error: "invalid_signature", reason: verified.reason });
    return;
  }

  let body: AkuteWebhookBody;
  try {
    body = JSON.parse(rawBody || "{}") as AkuteWebhookBody;
  } catch {
    logDelivery("warn", { outcome: "rejected", status: 400, reason: "invalid_json", bodyBytes: rawBuf.length });
    res.status(400).json({ error: "invalid_json" });
    return;
  }

  const resource = resourceOf(body);
  const eventType = eventOf(body);
  const eventId = eventIdOf(body);
  if (!eventId) {
    logDelivery("warn", {
      outcome: "rejected",
      status: 400,
      reason: "missing_event_id",
      resource,
      eventType,
      keys: Object.keys(body).slice(0, 30),
    });
    res.status(400).json({ error: "missing_event_id" });
    return;
  }

  const admin = getSupabaseAdmin();
  const { error: insertErr } = await admin.from("akute_webhook_events").insert({
    event_id: eventId,
    resource,
    event: eventType,
    payload: body,
  });

  if (insertErr) {
    if (
      insertErr.code === "23505" ||
      /duplicate|unique/i.test(insertErr.message || "")
    ) {
      logDelivery("log", { outcome: "duplicate", eventId, resource, eventType });
      res.status(200).json({ ok: true, duplicate: true });
      return;
    }
    logDelivery("error", {
      outcome: "rejected",
      status: 500,
      reason: "idempotency_failed",
      eventId,
      resource,
      eventType,
      message: insertErr.message,
    });
    res.status(500).json({ error: "idempotency_failed", message: insertErr.message });
    return;
  }

  logDelivery("log", { outcome: "accepted", eventId, resource, eventType, resourceId: body.id ?? null });

  try {
    await processEvent(admin, body, resource);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ event: "akute_webhook_process_failed", eventId, resource, message }));
  }

  res.status(200).json({ ok: true });
}

async function processEvent(
  admin: ReturnType<typeof getSupabaseAdmin>,
  body: AkuteWebhookBody,
  resource: string,
) {
  const data = (body.data || body) as Record<string, unknown>;

  if (resource.includes("medication")) {
    await upsertMedication(admin, data);
    return;
  }

  if (
    resource.includes("patient") ||
    resource.includes("task") ||
    resource.includes("note") ||
    resource.includes("appointment")
  ) {
    // Soft sync: store last-known resource snapshot on patient when external_id known
    const externalId =
      data.external_id ||
      data.external_patient_id ||
      body.external_patient_id;
    if (externalId) {
      await admin
        .from("patients")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", String(externalId));
    }

    // Fast path for intake part 2: the patient just did something in Akute, so
    // check whether their address / preferred pharmacy answers are on the chart yet.
    const akutePatientId = patientIdFromWebhook(resource, data);
    if (!akutePatientId) {
      console.log(JSON.stringify({ event: "akute_intake_sync_skipped", trigger: resource, reason: "no_patient_id" }));
      return;
    }
    try {
      const sync = await syncPatientIntake(akutePatientId);
      console.log(JSON.stringify({ event: "akute_intake_sync", trigger: resource, ...sync }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        JSON.stringify({ event: "akute_intake_sync_failed", trigger: resource, akutePatientId, message }),
      );
    }
    return;
  }

  console.log(JSON.stringify({ event: "akute_webhook_unhandled", resource, eventType: eventOf(body) }));
}

async function upsertMedication(
  admin: ReturnType<typeof getSupabaseAdmin>,
  data: Record<string, unknown>,
) {
  const akuteMedId = String(data.id || data.medication_id || "").trim();
  if (!akuteMedId) return;

  const externalPatientId = String(
    data.external_patient_id || data.external_id || "",
  ).trim();
  let patientId = externalPatientId;

  if (!patientId) {
    const akutePatientId = String(data.patient_id || "").trim();
    if (akutePatientId) {
      const { data: row } = await admin
        .from("patients")
        .select("id")
        .eq("akute_patient_id", akutePatientId)
        .maybeSingle();
      patientId = row?.id ? String(row.id) : "";
    }
  }
  if (!patientId) return;

  const status = String(data.status || data.prescription_status || "").toLowerCase();
  const drugSummary = String(
    data.name || data.drug_name || data.display || data.medication || "Medication",
  ).slice(0, 500);

  await admin.from("akute_medications").upsert(
    {
      patient_id: patientId,
      akute_medication_id: akuteMedId,
      status,
      drug_summary: drugSummary,
      raw: data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "akute_medication_id" },
  );
}

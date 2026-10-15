import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Readable } from "node:stream";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import { verifyAkuteWebhookSignature } from "../_lib/akute/verifyWebhook";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

type AkuteWebhookBody = {
  event_id?: string;
  id?: string;
  resource?: string;
  event?: string;
  type?: string;
  data?: Record<string, unknown>;
  patient_id?: string;
  external_patient_id?: string;
  status?: string;
  [key: string]: unknown;
};

function eventIdOf(body: AkuteWebhookBody): string | null {
  const id = body.event_id || body.id;
  return id != null ? String(id) : null;
}

function resourceOf(body: AkuteWebhookBody): string {
  return String(body.resource || body.type || "unknown").toLowerCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const secret = process.env.AKUTE_WEBHOOK_SECRET || "";
  const rawBuf = await buffer(req);
  const rawBody = rawBuf.toString("utf8");
  const sig =
    (req.headers["x-akute-signature"] as string | undefined) ||
    (req.headers["X-Akute-Signature"] as string | undefined);

  const verified = verifyAkuteWebhookSignature({
    rawBody,
    signatureHeader: sig,
    secret,
  });
  if (!verified.ok) {
    res.status(401).json({ error: "invalid_signature", reason: verified.reason });
    return;
  }

  let body: AkuteWebhookBody;
  try {
    body = JSON.parse(rawBody || "{}") as AkuteWebhookBody;
  } catch {
    res.status(400).json({ error: "invalid_json" });
    return;
  }

  const eventId = eventIdOf(body);
  if (!eventId) {
    res.status(400).json({ error: "missing_event_id" });
    return;
  }

  const admin = getSupabaseAdmin();
  const { error: insertErr } = await admin.from("akute_webhook_events").insert({
    event_id: eventId,
    resource: resourceOf(body),
    event: String(body.event || ""),
    payload: body,
  });

  if (insertErr) {
    if (
      insertErr.code === "23505" ||
      /duplicate|unique/i.test(insertErr.message || "")
    ) {
      res.status(200).json({ ok: true, duplicate: true });
      return;
    }
    res.status(500).json({ error: "idempotency_failed", message: insertErr.message });
    return;
  }

  try {
    await processEvent(admin, body);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ event: "akute_webhook_process_failed", message }));
  }

  res.status(200).json({ ok: true });
}

async function processEvent(
  admin: ReturnType<typeof getSupabaseAdmin>,
  body: AkuteWebhookBody,
) {
  const resource = resourceOf(body);
  const data = (body.data || body) as Record<string, unknown>;

  if (resource.includes("medication")) {
    await upsertMedication(admin, data);
    return;
  }

  if (
    resource.includes("patient") ||
    resource.includes("task") ||
    resource.includes("note")
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
  }
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

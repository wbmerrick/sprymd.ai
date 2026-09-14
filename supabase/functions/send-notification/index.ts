// Patient notification sender.
//
// Deploy with:
//   supabase functions deploy send-notification
// (Default JWT verification stays ON — callers must present a Supabase JWT;
// the client invokes this via supabase.functions.invoke, which attaches it.)
//
// POST { encounterId, event } with event one of:
//   decision_prescribed | decision_declined | refill_received
//
// Looks up the encounter's email with the service-role client, sends the
// matching PHI-minimal template, and records an audit_events row either way.

import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { emailTemplates, sendEmail, type EmailContent } from "../_shared/email.ts";
import { getServiceRoleClient } from "../_shared/supabase-admin.ts";

type NotificationEvent = "decision_prescribed" | "decision_declined" | "refill_received";

const TEMPLATE_BY_EVENT: Record<NotificationEvent, () => EmailContent> = {
  decision_prescribed: emailTemplates.decisionPrescribed,
  decision_declined: emailTemplates.decisionDeclined,
  refill_received: emailTemplates.refillReceived,
};

const isNotificationEvent = (value: unknown): value is NotificationEvent =>
  typeof value === "string" && value in TEMPLATE_BY_EVENT;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing bearer authorization" }, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { encounterId, event } = (body ?? {}) as { encounterId?: unknown; event?: unknown };

  if (typeof encounterId !== "string" || encounterId.length === 0) {
    return jsonResponse({ error: "encounterId is required" }, 400);
  }
  if (!isNotificationEvent(event)) {
    return jsonResponse(
      { error: "event must be one of decision_prescribed, decision_declined, refill_received" },
      400,
    );
  }

  const supabase = getServiceRoleClient();

  const { data: encounter, error: fetchError } = await supabase
    .from("encounters")
    .select("id, email")
    .eq("id", encounterId)
    .maybeSingle();

  if (fetchError) {
    console.error("[send-notification] Encounter lookup failed:", fetchError.message);
    return jsonResponse({ error: "Failed to load encounter" }, 500);
  }
  if (!encounter) {
    return jsonResponse({ error: "Encounter not found" }, 404);
  }

  const recordAudit = async (metadata: Record<string, unknown>): Promise<void> => {
    const { error } = await supabase.from("audit_events").insert({
      actor: "system",
      action: `email_${event}`,
      encounter_id: encounterId,
      metadata,
    });
    if (error) {
      console.warn("[send-notification] Audit insert failed:", error.message);
    }
  };

  if (!encounter.email) {
    await recordAudit({ sent: false, reason: "no_email" });
    return jsonResponse({ sent: false, reason: "no_email" });
  }

  const template = TEMPLATE_BY_EVENT[event]();
  const result = await sendEmail({
    to: encounter.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  await recordAudit({
    sent: result.sent,
    ...(result.skipped ? { skipped: true } : {}),
    ...(result.error ? { error: result.error } : {}),
  });

  return jsonResponse({ sent: result.sent, skipped: result.skipped ?? false });
});

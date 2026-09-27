/**
 * Public contact form → Resend email to SUPPORT_INBOX / support@sprymd.ai.
 * Env: RESEND_API_KEY (required to send), CHECKOUT_FROM_EMAIL / CONTACT_FROM_EMAIL (optional),
 * SUPPORT_INBOX (optional, default support@sprymd.ai).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePreflight } from "./_lib/cors";

const RESEND_TEST_FROM = "SpryMD <onboarding@resend.dev>";
const DEFAULT_FROM = "SpryMD <noreply@sprymd.ai>";
const DEFAULT_INBOX = "support@sprymd.ai";

type ContactBody = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
};

function parseBody(req: VercelRequest): ContactBody {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}") as ContactBody;
    } catch {
      return {};
    }
  }
  return req.body as ContactBody;
}

function resolveFrom(): string {
  return (
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    process.env.CHECKOUT_FROM_EMAIL?.trim() ||
    DEFAULT_FROM
  );
}

function isUnverifiedDomainError(status: number, body: string): boolean {
  if (status !== 403 && status !== 422) return false;
  const lower = body.toLowerCase();
  return (
    lower.includes("domain") ||
    lower.includes("not verified") ||
    lower.includes("from address") ||
    lower.includes("invalid `from`")
  );
}

function sanitize(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const body = parseBody(req);
  const name = sanitize(String(body.name || ""), 120);
  const email = sanitize(String(body.email || "").toLowerCase(), 254);
  const topic = sanitize(String(body.topic || "General"), 120);
  const message = sanitize(String(body.message || ""), 5000);

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "missing_fields",
      message: "Name, email, and message are required.",
    });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "invalid_email",
      message: "Please enter a valid email address.",
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const inbox = process.env.SUPPORT_INBOX?.trim() || DEFAULT_INBOX;
  const from = resolveFrom();

  if (!apiKey) {
    console.log(
      JSON.stringify({
        event: "contact_form_skipped",
        reason: "RESEND_API_KEY not set",
        name,
        email,
        topic,
      }),
    );
    // Still acknowledge — ops can read logs; UI gets honest messaging when skipped.
    return res.status(503).json({
      error: "email_unavailable",
      message: `Email is temporarily unavailable. Please write us at ${inbox}.`,
    });
  }

  const subject = `[SpryMD contact] ${topic} — ${name}`;
  const html = `
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
  `;

  try {
    let usedFrom = from;
    let result = await postResend({
      apiKey,
      from,
      to: inbox,
      replyTo: email,
      subject,
      html,
    });

    if (
      !result.ok &&
      isUnverifiedDomainError(result.status, result.body) &&
      from !== RESEND_TEST_FROM
    ) {
      result = await postResend({
        apiKey,
        from: RESEND_TEST_FROM,
        to: inbox,
        replyTo: email,
        subject,
        html,
      });
      usedFrom = RESEND_TEST_FROM;
    }

    if (!result.ok) {
      console.error(
        JSON.stringify({
          event: "contact_form_failed",
          status: result.status,
          body: result.body,
          from: usedFrom,
          email,
        }),
      );
      return res.status(502).json({
        error: "send_failed",
        message: `We couldn't send that just now. Please email ${inbox} directly.`,
      });
    }

    console.log(
      JSON.stringify({
        event: "contact_form_sent",
        from: usedFrom,
        to: inbox,
        email,
        topic,
      }),
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({ event: "contact_form_error", error: messageText, email }),
    );
    return res.status(500).json({
      error: "server_error",
      message: `Something went wrong. Please email ${inbox}.`,
    });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function postResend(params: {
  apiKey: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      reply_to: params.replyTo,
      subject: params.subject,
      html: params.html,
    }),
  });
  if (!res.ok) {
    return { ok: false, status: res.status, body: await res.text() };
  }
  return { ok: true };
}

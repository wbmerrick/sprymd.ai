// Transactional email helper backed by the Resend REST API.
//
// Emails are PHI-minimal by design: bodies carry only a generic status line
// and a link to the patient portal — never intake answers, diagnoses, or any
// other care details.
//
// When RESEND_API_KEY is not set (e.g. local dev / demo deployments), sends
// are skipped gracefully — callers get { sent: false, skipped: true } and the
// app keeps working without email.

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

const DEFAULT_FROM = "SpryMD <care@sprymd.ai>";
const PORTAL_URL = "https://sprymd.ai/portal";

export const sendEmail = async ({ to, subject, html, text }: SendEmailArgs): Promise<SendEmailResult> => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY not set — skipping send to ${to} ("${subject}")`);
    return { sent: false, skipped: true };
  }

  const from = Deno.env.get("EMAIL_FROM") ?? DEFAULT_FROM;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, ...(text ? { text } : {}) }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const error = `Resend API returned ${res.status}: ${detail}`;
      console.error(`[email] Send failed for ${to}:`, error);
      return { sent: false, error };
    }

    return { sent: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[email] Send failed for ${to}:`, error);
    return { sent: false, error };
  }
};

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

// Simple inline-styled, table-based layout for broad email-client support.
const renderHtml = (heading: string, body: string): string => `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f6f5f2;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f5f2;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
            <tr>
              <td style="background-color:#298E8E;height:6px;line-height:6px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 40px 8px 40px;">
                <span style="font-size:22px;font-weight:bold;color:#298E8E;letter-spacing:0.5px;">SpryMD</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 0 40px;">
                <h1 style="margin:0 0 12px 0;font-size:20px;color:#1f2933;">${heading}</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#4a5561;">${body}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px 40px;">
                <a href="${PORTAL_URL}" style="display:inline-block;background-color:#E7714B;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;">Go to your portal</a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 28px 40px;border-top:1px solid #e8e6e1;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#8b949e;">
                  For your privacy, SpryMD never includes care details in email.
                  Sign in to your secure portal to view your full status.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const renderText = (heading: string, body: string): string =>
  `SpryMD\n\n${heading}\n\n${body}\n\nGo to your portal: ${PORTAL_URL}\n\nFor your privacy, SpryMD never includes care details in email. Sign in to your secure portal to view your full status.`;

const buildTemplate = (subject: string, heading: string, body: string): EmailContent => ({
  subject,
  html: renderHtml(heading, body),
  text: renderText(heading, body),
});

// PHI-minimal templates: generic status line + portal link only.
export const emailTemplates = {
  paymentConfirmed: (): EmailContent =>
    buildTemplate(
      "Payment confirmed — your SpryMD visit has started",
      "Payment confirmed",
      "Thanks — your payment was received and your visit is underway. A licensed physician will review your case shortly. Track your visit status any time in your secure portal.",
    ),
  decisionPrescribed: (): EmailContent =>
    buildTemplate(
      "Your SpryMD care update is ready",
      "Your care update is ready",
      "A licensed physician has reviewed your case and there is an update on your treatment. Sign in to your secure portal to see the details and next steps.",
    ),
  decisionDeclined: (): EmailContent =>
    buildTemplate(
      "Your SpryMD care update is ready",
      "Your care update is ready",
      "A licensed physician has completed the review of your case. Sign in to your secure portal to see the outcome and recommended next steps.",
    ),
  refillReceived: (): EmailContent =>
    buildTemplate(
      "We received your refill request",
      "Refill request received",
      "Your refill request has been received and is with your care team. You can follow its progress in your secure portal.",
    ),
} as const;

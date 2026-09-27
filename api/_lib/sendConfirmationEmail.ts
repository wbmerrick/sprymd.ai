export type ConfirmationEmailPayload = {
  to: string;
  patientName?: string | null;
  appointmentId?: string | null;
  sessionId?: string | null;
  amountCents?: number | null;
  serviceTierName?: string | null;
};

const RESEND_TEST_FROM = "SpryMD <onboarding@resend.dev>";
const DEFAULT_FROM = "SpryMD <noreply@sprymd.ai>";

function resolveFromAddress(): string {
  const configured = process.env.CHECKOUT_FROM_EMAIL?.trim();
  return configured || DEFAULT_FROM;
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

async function postResendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
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
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, status: res.status, body: text };
  }
  return { ok: true };
}

/**
 * Sends a payment confirmation email via Resend when RESEND_API_KEY is set.
 * Otherwise logs structured output. Never throws — callers should not fail
 * payment updates if email delivery fails.
 *
 * If CHECKOUT_FROM_EMAIL / default domain is not verified in Resend, retries
 * once with onboarding@resend.dev (Resend only delivers that to the account
 * owner's inbox until the custom domain is verified).
 */
export async function sendConfirmationEmail(
  payload: ConfirmationEmailPayload,
): Promise<{ ok: boolean; skipped?: boolean; error?: string; from?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = resolveFromAddress();

  const subject = "SpryMD payment confirmation";
  const amount =
    typeof payload.amountCents === "number"
      ? `$${(payload.amountCents / 100).toFixed(2)}`
      : null;
  const html = `
    <p>Hi ${payload.patientName || "there"},</p>
    <p>We've received your payment${amount ? ` of <strong>${amount}</strong>` : ""}${
      payload.serviceTierName ? ` for <strong>${payload.serviceTierName}</strong>` : ""
    }.</p>
    <p>Your clinician visit is confirmed. We'll follow up with next steps shortly.</p>
    ${payload.appointmentId ? `<p>Reference: ${payload.appointmentId}</p>` : ""}
    <p>— SpryMD</p>
  `;

  if (!apiKey) {
    console.log(
      JSON.stringify({
        event: "checkout_confirmation_email_skipped",
        reason: "RESEND_API_KEY not set",
        to: payload.to,
        appointmentId: payload.appointmentId,
        sessionId: payload.sessionId,
        amountCents: payload.amountCents,
        serviceTierName: payload.serviceTierName,
      }),
    );
    return { ok: true, skipped: true };
  }

  try {
    let result = await postResendEmail({
      apiKey,
      from,
      to: payload.to,
      subject,
      html,
    });

    let usedFrom = from;
    if (
      !result.ok &&
      isUnverifiedDomainError(result.status, result.body) &&
      from !== RESEND_TEST_FROM
    ) {
      console.warn(
        JSON.stringify({
          event: "checkout_confirmation_email_domain_fallback",
          from,
          fallback: RESEND_TEST_FROM,
          status: result.status,
          body: result.body,
        }),
      );
      result = await postResendEmail({
        apiKey,
        from: RESEND_TEST_FROM,
        to: payload.to,
        subject,
        html,
      });
      usedFrom = RESEND_TEST_FROM;
    }

    if (!result.ok) {
      console.error(
        JSON.stringify({
          event: "checkout_confirmation_email_failed",
          status: result.status,
          body: result.body,
          to: payload.to,
          from: usedFrom,
        }),
      );
      return { ok: false, error: result.body, from: usedFrom };
    }

    console.log(
      JSON.stringify({
        event: "checkout_confirmation_email_sent",
        to: payload.to,
        from: usedFrom,
        appointmentId: payload.appointmentId,
        sessionId: payload.sessionId,
      }),
    );
    return { ok: true, from: usedFrom };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({
        event: "checkout_confirmation_email_error",
        error: message,
        to: payload.to,
      }),
    );
    return { ok: false, error: message };
  }
}

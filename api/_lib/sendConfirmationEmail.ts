export type ConfirmationEmailPayload = {
  to: string;
  patientName?: string | null;
  appointmentId?: string | null;
  sessionId?: string | null;
  amountCents?: number | null;
  serviceTierName?: string | null;
};

/**
 * Sends a payment confirmation email via Resend when RESEND_API_KEY is set.
 * Otherwise logs structured output. Never throws — callers should not fail
 * payment updates if email delivery fails.
 */
export async function sendConfirmationEmail(
  payload: ConfirmationEmailPayload,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.CHECKOUT_FROM_EMAIL || "SpryMD <noreply@sprymd.ai>";

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
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        JSON.stringify({
          event: "checkout_confirmation_email_failed",
          status: res.status,
          body: text,
          to: payload.to,
        }),
      );
      return { ok: false, error: text };
    }

    console.log(
      JSON.stringify({
        event: "checkout_confirmation_email_sent",
        to: payload.to,
        appointmentId: payload.appointmentId,
        sessionId: payload.sessionId,
      }),
    );
    return { ok: true };
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

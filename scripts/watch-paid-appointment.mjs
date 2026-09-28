#!/usr/bin/env node
/**
 * Poll production until a Checkout session's appointment is paid (or timeout).
 * Usage:
 *   node scripts/watch-paid-appointment.mjs [sessionId] [appointmentId]
 * Defaults to the latest launch-verify session if args omitted.
 */
const base = (process.env.APP_URL || "https://www.sprymd.ai").replace(/\/$/, "");
const sessionId =
  process.argv[2] ||
  process.env.CHECKOUT_SESSION_ID ||
  "cs_live_a1drA1zORnfIzDNah1o00CdKmhoc8QwbcH2ITzA5fbE6TEBXTL6fz7WiWb";
const appointmentId =
  process.argv[3] ||
  process.env.APPOINTMENT_ID ||
  "12194213-8571-483e-bdc4-d0bfc32248c9";
const maxAttempts = Number(process.env.WATCH_ATTEMPTS || 40);
const delayMs = Number(process.env.WATCH_DELAY_MS || 15000);

async function lookup() {
  const qs = new URLSearchParams({
    session_id: sessionId,
    appointment_id: appointmentId,
  });
  const res = await fetch(`${base}/api/checkout/session?${qs}`);
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  console.log(
    JSON.stringify({
      watching: { base, sessionId, appointmentId, maxAttempts, delayMs },
    }),
  );
  for (let i = 1; i <= maxAttempts; i++) {
    const { status, body } = await lookup();
    const apptStatus = body?.status || null;
    console.log(
      JSON.stringify({
        attempt: i,
        http: status,
        appointmentStatus: apptStatus,
        appointmentId: body?.appointmentId || appointmentId,
      }),
    );
    if (apptStatus === "paid") {
      console.log(JSON.stringify({ ok: true, paid: true }));
      process.exit(0);
    }
    if (i < maxAttempts) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.log(JSON.stringify({ ok: false, paid: false, reason: "timeout" }));
  process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Lightweight readiness probe for cash-pay serverless deps.
 * Does not expose secret values — only whether required keys are present.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const checks = {
    node: process.version,
    stripeSecret: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    supabaseUrl: Boolean(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    ),
    supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    resendApiKey: Boolean(process.env.RESEND_API_KEY),
    checkoutFromEmail: Boolean(process.env.CHECKOUT_FROM_EMAIL),
    opsStaffEmailsEnv: Boolean(
      process.env.OPS_STAFF_EMAILS || process.env.MASTER_EMAILS,
    ),
    // staffAuth ships with a built-in owner email even when env is unset
    opsStaffBuiltinAllowlist: true,
    dailyApiKey: Boolean(process.env.DAILY_API_KEY),
    twilioVideo: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_API_KEY &&
        process.env.TWILIO_API_SECRET,
    ),
    videoVendor: process.env.VIDEO_VENDOR || null,
  };

  const ready =
    checks.stripeSecret &&
    checks.stripeWebhookSecret &&
    checks.supabaseUrl &&
    checks.supabaseServiceRole;

  res.status(ready ? 200 : 503).json({
    ok: ready,
    checks,
  });
}

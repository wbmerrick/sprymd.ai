import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePreflight, applyCors } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import { requireStaff } from "../_lib/staffAuth";

/**
 * GET /api/ops/status — staff launch/readiness snapshot for clinical DB.
 * Used to confirm paid checkouts landed (payment_events + paid appointments)
 * and that staff bootstrap created auth/providers rows.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (handlePreflight(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const auth = await requireStaff(req.headers.authorization);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  try {
    const admin = getSupabaseAdmin();

    const [
      { data: byStatus, error: statusError },
      { count: paymentEvents, error: peError },
      { count: providers, error: providersError },
    ] = await Promise.all([
      admin.from("appointments").select("status"),
      admin
        .from("payment_events")
        .select("id", { count: "exact", head: true }),
      admin.from("providers").select("id", { count: "exact", head: true }),
    ]);

    if (statusError || peError || providersError) {
      res.status(500).json({
        error: "status_lookup_failed",
        message:
          statusError?.message ||
          peError?.message ||
          providersError?.message ||
          "lookup failed",
      });
      return;
    }

    const counts: Record<string, number> = {};
    for (const row of byStatus || []) {
      const key = String((row as { status?: string }).status || "unknown");
      counts[key] = (counts[key] || 0) + 1;
    }

    const paid = counts.paid || 0;
    const awaiting = counts.awaiting_payment || 0;
    const readyForClinician = paid > 0;
    const ledgerOk = (paymentEvents || 0) > 0;
    const dailyApiKey = Boolean(process.env.DAILY_API_KEY);
    const twilioVideo = Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_API_KEY &&
        process.env.TWILIO_API_SECRET,
    );
    const videoVendor = process.env.VIDEO_VENDOR || null;
    const videoReady = dailyApiKey || twilioVideo;

    res.status(200).json({
      ok: true,
      appointments: counts,
      paymentEvents: paymentEvents || 0,
      providers: providers || 0,
      staff: {
        email: auth.staff.email,
        providerId: auth.staff.providerId,
        isAllowlisted: auth.staff.isAllowlisted,
      },
      launch: {
        hasPaidVisit: readyForClinician,
        hasPaymentLedger: ledgerOk,
        hasStaffProvider: Boolean(auth.staff.providerId),
        awaitingPayment: awaiting,
        videoReady,
        video: {
          dailyApiKey,
          twilioVideo,
          vendor: videoVendor,
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "status_failed", message });
  }
}

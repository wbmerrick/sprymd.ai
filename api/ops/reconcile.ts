import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { handlePreflight, applyCors } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
import { requireStaff } from "../_lib/staffAuth";
import {
  checkoutSessionEligibleToMarkPaid,
  markAppointmentPaidFromSession,
} from "../_lib/markCheckoutPaid";

/**
 * POST /api/ops/reconcile — { appointmentId? , sessionId? , allAwaiting? }
 * Staff: pull Stripe Checkout state and mark paid if payment cleared
 * (covers webhook lag / missed events).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const auth = await requireStaff(req.headers.authorization);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const body =
    typeof req.body === "string"
      ? (JSON.parse(req.body || "{}") as Record<string, unknown>)
      : ((req.body || {}) as Record<string, unknown>);

  const allAwaiting =
    body.allAwaiting === true || body.allAwaiting === "true";
  let sessionId = String(body.sessionId || req.query.session_id || "").trim();
  const appointmentId = String(
    body.appointmentId || req.query.appointment_id || "",
  ).trim();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(500).json({ error: "stripe_not_configured" });
    return;
  }

  try {
    const admin = getSupabaseAdmin();
    const stripe = new Stripe(stripeKey);

    if (allAwaiting) {
      const { data: rows, error } = await admin
        .from("appointments")
        .select("id, stripe_checkout_session_id, status")
        .eq("status", "awaiting_payment")
        .not("stripe_checkout_session_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        res.status(500).json({ error: "lookup_failed", message: error.message });
        return;
      }

      const results: Array<Record<string, unknown>> = [];
      for (const row of rows || []) {
        const sid = String(row.stripe_checkout_session_id || "");
        if (!sid) continue;
        try {
          const session = await stripe.checkout.sessions.retrieve(sid, {
            expand: ["payment_intent"],
          });
          if (!checkoutSessionEligibleToMarkPaid(session)) {
            const expiredByClock =
              typeof session.expires_at === "number" &&
              session.expires_at * 1000 <= Date.now() &&
              session.payment_status !== "paid";
            const isExpired =
              session.status === "expired" || expiredByClock;

            // Drop abandoned/expired checkouts from the waiting queue
            if (isExpired) {
              if (session.status === "open") {
                try {
                  await stripe.checkout.sessions.expire(sid);
                } catch {
                  /* already expired or not expireable */
                }
              }
              const now = new Date().toISOString();
              const { data: cancelled } = await admin
                .from("appointments")
                .update({ status: "cancelled", updated_at: now })
                .eq("id", row.id)
                .eq("status", "awaiting_payment")
                .select("id")
                .maybeSingle();
              results.push({
                appointmentId: row.id,
                sessionId: sid,
                unpaid: true,
                expired: true,
                cancelled: Boolean(cancelled),
                paymentStatus: session.payment_status,
                sessionStatus: session.status,
              });
              continue;
            }
            // Fully refunded but session still shows paid — cancel awaiting noise
            const looksPaid =
              session.payment_status === "paid" || session.status === "complete";
            if (looksPaid) {
              const now = new Date().toISOString();
              const { data: cancelled } = await admin
                .from("appointments")
                .update({ status: "cancelled", updated_at: now })
                .eq("id", row.id)
                .eq("status", "awaiting_payment")
                .select("id")
                .maybeSingle();
              results.push({
                appointmentId: row.id,
                sessionId: sid,
                unpaid: true,
                refunded: true,
                cancelled: Boolean(cancelled),
                paymentStatus: session.payment_status,
                sessionStatus: session.status,
              });
              continue;
            }
            results.push({
              appointmentId: row.id,
              sessionId: sid,
              unpaid: true,
              paymentStatus: session.payment_status,
              sessionStatus: session.status,
            });
            continue;
          }
          const marked = await markAppointmentPaidFromSession({
            supabase: admin,
            session,
            stripeEventId: `reconcile:${session.id}`,
            eventType: "checkout.session.reconciled",
          });
          results.push({ appointmentId: row.id, sessionId: sid, ...marked });
        } catch (err) {
          results.push({
            appointmentId: row.id,
            sessionId: sid,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      const paid = results.filter((r) => r.updated || r.alreadyPaid).length;
      const cancelled = results.filter((r) => r.cancelled).length;
      res.status(200).json({
        ok: true,
        scanned: results.length,
        paid,
        cancelled,
        results,
      });
      return;
    }

    if (!sessionId && appointmentId) {
      const { data: appt, error } = await admin
        .from("appointments")
        .select("id, stripe_checkout_session_id, status")
        .eq("id", appointmentId)
        .maybeSingle();
      if (error) {
        res.status(500).json({ error: "lookup_failed", message: error.message });
        return;
      }
      if (!appt) {
        res.status(404).json({ error: "appointment_not_found" });
        return;
      }
      sessionId = String(appt.stripe_checkout_session_id || "");
      if (!sessionId) {
        res.status(400).json({ error: "no_stripe_session_on_appointment" });
        return;
      }
      if (appt.status === "paid") {
        res.status(200).json({
          ok: true,
          alreadyPaid: true,
          appointmentId: appt.id,
        });
        return;
      }
      if (appt.status !== "awaiting_payment") {
        res.status(409).json({
          error: "not_awaiting_payment",
          status: appt.status,
          appointmentId: appt.id,
          message:
            "Only awaiting_payment visits can be reconciled to paid (refuses cancelled/refunded revival).",
        });
        return;
      }
    }

    if (!sessionId) {
      res.status(400).json({ error: "missing_session_or_appointment" });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!checkoutSessionEligibleToMarkPaid(session)) {
      res.status(200).json({
        ok: false,
        unpaid: true,
        paymentStatus: session.payment_status,
        sessionStatus: session.status,
        sessionId: session.id,
        refunded:
          session.payment_status === "paid" || session.status === "complete",
      });
      return;
    }

    const result = await markAppointmentPaidFromSession({
      supabase: admin,
      session,
      stripeEventId: `reconcile:${session.id}`,
      eventType: "checkout.session.reconciled",
    });

    res.status(200).json({
      ok: true,
      ...result,
      paymentStatus: session.payment_status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "reconcile_failed", message });
  }
}

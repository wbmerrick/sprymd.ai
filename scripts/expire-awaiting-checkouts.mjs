#!/usr/bin/env node
/**
 * Staff-equivalent Sync for abandoned awaiting_payment rows.
 * Requires STRIPE_SECRET_KEY + SUPABASE_SERVICE_ROLE_KEY (+ SUPABASE_URL or VITE_SUPABASE_URL).
 *
 * Usage: node scripts/expire-awaiting-checkouts.mjs
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeKey || !supabaseUrl || !serviceKey) {
  console.error(
    JSON.stringify({
      ok: false,
      error: "missing_env",
      need: [
        "STRIPE_SECRET_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_URL|VITE_SUPABASE_URL",
      ],
    }),
  );
  process.exit(2);
}

const stripe = new Stripe(stripeKey);
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: rows, error } = await admin
  .from("appointments")
  .select("id, stripe_checkout_session_id, status, created_at")
  .eq("status", "awaiting_payment")
  .not("stripe_checkout_session_id", "is", null)
  .order("created_at", { ascending: false })
  .limit(50);

if (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exit(1);
}

const results = [];
for (const row of rows || []) {
  const sid = String(row.stripe_checkout_session_id || "");
  if (!sid) continue;
  try {
    const session = await stripe.checkout.sessions.retrieve(sid, {
      expand: ["payment_intent"],
    });
    const paid =
      session.payment_status === "paid" || session.status === "complete";
    const expiredByClock =
      typeof session.expires_at === "number" &&
      session.expires_at * 1000 <= Date.now();
    const isExpired = session.status === "expired" || expiredByClock;

    if (paid) {
      // Leave paid marking to /api/ops/reconcile with staff session
      results.push({
        appointmentId: row.id,
        sessionId: sid,
        action: "skip_paid_needs_staff_reconcile",
        paymentStatus: session.payment_status,
      });
      continue;
    }

    const ageMs = Date.now() - new Date(String(row.created_at)).getTime();
    const abandonedOpen =
      session.status === "open" && Number.isFinite(ageMs) && ageMs >= 60 * 60 * 1000;

    if (isExpired || abandonedOpen) {
      if (session.status === "open") {
        try {
          await stripe.checkout.sessions.expire(sid);
        } catch (err) {
          results.push({
            appointmentId: row.id,
            sessionId: sid,
            expireError: err instanceof Error ? err.message : String(err),
          });
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
        action: "cancelled",
        cancelled: Boolean(cancelled),
        sessionStatus: session.status,
        expiredByClock,
        abandonedOpen,
      });
      continue;
    }

    results.push({
      appointmentId: row.id,
      sessionId: sid,
      action: "left",
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
    });
  } catch (err) {
    results.push({
      appointmentId: row.id,
      sessionId: sid,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

const cancelled = results.filter((r) => r.cancelled).length;
console.log(
  JSON.stringify(
    { ok: true, scanned: results.length, cancelled, results },
    null,
    2,
  ),
);

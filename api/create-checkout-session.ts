/**
 * Env vars required for cash-pay Stripe Checkout:
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET (webhook handler)
 * - SUPABASE_SERVICE_ROLE_KEY
 * - SUPABASE_URL (or VITE_SUPABASE_URL)
 * - RESEND_API_KEY (optional — confirmation email)
 * - CHECKOUT_FROM_EMAIL (optional)
 * - APP_URL (optional — success/cancel base + CORS)
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getServiceTier } from "../shared/serviceTiers";
import { handlePreflight } from "./_lib/cors";
import { getSupabaseAdmin } from "./_lib/supabaseAdmin";

type CheckoutBody = {
  appointmentId?: string;
  serviceTierId?: string;
  patientEmail?: string;
  patientName?: string;
  successUrl?: string;
  cancelUrl?: string;
};

function getAppBaseUrl(req: VercelRequest): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host =
    (req.headers["x-forwarded-host"] as string) ||
    (req.headers.host as string) ||
    "localhost:8080";
  return `${proto}://${host}`.replace(/\/$/, "");
}

function parseBody(req: VercelRequest): CheckoutBody {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}") as CheckoutBody;
    } catch {
      return {};
    }
  }
  return req.body as CheckoutBody;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(500).json({ error: "stripe_not_configured" });
    return;
  }

  const body = parseBody(req);
  const serviceTierId = String(body.serviceTierId || "").trim();
  const appointmentId = body.appointmentId
    ? String(body.appointmentId).trim()
    : "";
  const patientEmail = body.patientEmail
    ? String(body.patientEmail).trim()
    : "";
  const patientName = body.patientName
    ? String(body.patientName).trim()
    : "";

  if (!serviceTierId) {
    res.status(400).json({ error: "missing_service_tier_id" });
    return;
  }

  if (!appointmentId && !patientEmail) {
    res.status(400).json({
      error: "missing_appointment_or_patient",
      message:
        "Provide appointmentId, or patientEmail (+ optional patientName) with serviceTierId",
    });
    return;
  }

  const tier = getServiceTier(serviceTierId);
  if (!tier) {
    res.status(400).json({ error: "unknown_service_tier", serviceTierId });
    return;
  }

  const baseUrl = getAppBaseUrl(req);
  const successUrl =
    body.successUrl ||
    `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = body.cancelUrl || `${baseUrl}/checkout?canceled=1`;

  try {
    const stripe = new Stripe(stripeKey);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: tier.currency,
            unit_amount: tier.amountCents,
            product_data: {
              name: tier.name,
              description: tier.description,
            },
          },
        },
      ],
      customer_email: patientEmail || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        appointment_id: appointmentId || "",
        service_tier_id: tier.id,
        patient_email: patientEmail || "",
        patient_name: patientName || "",
      },
    });

    if (appointmentId) {
      try {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase
          .from("appointments")
          .update({
            stripe_checkout_session_id: session.id,
            status: "awaiting_payment",
            service_tier: tier.id,
            amount_cents: tier.amountCents,
          })
          .eq("id", appointmentId);

        if (error) {
          console.error(
            JSON.stringify({
              event: "appointment_checkout_update_failed",
              appointmentId,
              message: error.message,
            }),
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          JSON.stringify({
            event: "appointment_checkout_update_error",
            appointmentId,
            message,
          }),
        );
      }
    }

    if (!session.url) {
      res.status(500).json({ error: "checkout_session_missing_url" });
      return;
    }

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({ event: "create_checkout_session_failed", message }),
    );
    res.status(500).json({ error: "checkout_session_failed", message });
  }
}

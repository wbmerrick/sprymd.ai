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
import { getServiceTier } from "./_lib/serviceTiers";
import {
  complianceBlockReason,
  type ComplianceAnswers,
} from "./_lib/complianceGate";
import { handlePreflight } from "./_lib/cors";
import { getSupabaseAdmin } from "./_lib/supabaseAdmin";
import { ensureCheckoutAppointment } from "./_lib/ensureCheckoutAppointment";
import { STATEMENT_DESCRIPTOR } from "./_lib/statementDescriptor";

type CheckoutBody = {
  appointmentId?: string;
  serviceTierId?: string;
  patientEmail?: string;
  patientName?: string;
  successUrl?: string;
  cancelUrl?: string;
  physicalState?: string;
  cashPayTermsAccepted?: boolean | string;
  telehealthLimitationsAcknowledged?: boolean | string;
  conditionId?: string;
  treatmentId?: string;
  /** e.g. `ispry` — used for branding + success redirect defaults */
  source?: string;
};

function affirmed(value: boolean | string | undefined): boolean {
  return value === true || value === "true";
}

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
  // Single product: Physician GLP-1 Evaluation ($100). Legacy tier ids alias to it.
  const serviceTierId =
    String(body.serviceTierId || "").trim() || "evaluation";
  let appointmentId = body.appointmentId
    ? String(body.appointmentId).trim()
    : "";
  const patientEmail = body.patientEmail
    ? String(body.patientEmail).trim()
    : "";
  const patientName = body.patientName
    ? String(body.patientName).trim()
    : "";
  const conditionId = body.conditionId
    ? String(body.conditionId).trim().toLowerCase()
    : "";
  const treatmentId = body.treatmentId
    ? String(body.treatmentId).trim()
    : "";
  const source = body.source ? String(body.source).trim().toLowerCase() : "";

  if (!appointmentId && !patientEmail) {
    res.status(400).json({
      error: "missing_appointment_or_patient",
      message:
        "Provide appointmentId, or patientEmail (+ optional patientName)",
    });
    return;
  }

  const tier = getServiceTier(serviceTierId);
  if (!tier) {
    res.status(400).json({ error: "unknown_service_tier", serviceTierId });
    return;
  }

  const compliance: ComplianceAnswers = {
    cashPayTermsAccepted: affirmed(body.cashPayTermsAccepted),
    telehealthLimitationsAcknowledged: affirmed(
      body.telehealthLimitationsAcknowledged,
    ),
    physicalState: String(body.physicalState || ""),
  };
  const consentBlock = complianceBlockReason(compliance);
  if (consentBlock) {
    res.status(403).json({ error: "compliance_blocked", message: consentBlock });
    return;
  }

  let patientId = "";
  try {
    const ensured = await ensureCheckoutAppointment({
      supabase: getSupabaseAdmin(),
      appointmentId: appointmentId || undefined,
      patientEmail: patientEmail || "unknown@sprymd.local",
      patientName,
      serviceTierId: tier.id,
      amountCents: tier.amountCents,
      currency: tier.currency,
      physicalState: compliance.physicalState,
      conditionId: conditionId || undefined,
      treatmentId: treatmentId || undefined,
    });
    appointmentId = ensured.appointmentId;
    patientId = ensured.patientId;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({
        event: "ensure_checkout_appointment_failed",
        message,
      }),
    );
    // Chart tables may not be applied yet — still allow Stripe checkout; webhook
    // will retry chart writes after migrations land.
    if (
      message.includes("PGRST") ||
      message.includes("schema cache") ||
      message.includes("does not exist") ||
      message.includes("appointment_not_found")
    ) {
      console.log(
        JSON.stringify({
          event: "ensure_checkout_appointment_skipped",
          message,
          note: "Proceeding without appointment row — apply clinical migrations",
        }),
      );
    } else {
      res.status(500).json({ error: "appointment_provision_failed", message });
      return;
    }
  }

  // When we only had appointmentId, recover email from the chart if possible.
  let emailForStripe = patientEmail;
  if (!emailForStripe && patientId) {
    try {
      const { data } = await getSupabaseAdmin()
        .from("patients")
        .select("email")
        .eq("id", patientId)
        .maybeSingle();
      if (data?.email) emailForStripe = String(data.email);
    } catch {
      /* ignore */
    }
  }

  const baseUrl = getAppBaseUrl(req);
  // Stripe substitutes the literal `{CHECKOUT_SESSION_ID}` token — do not encode braces.
  const isprySuccessDefault = "https://ispry.ai/?welcome=1";
  const successUrl =
    body.successUrl ||
    (source === "ispry" || tier.brand === "ispry"
      ? isprySuccessDefault
      : appointmentId
        ? `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${encodeURIComponent(appointmentId)}`
        : `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  const cancelUrl =
    body.cancelUrl ||
    (source === "ispry" || tier.brand === "ispry"
      ? `${baseUrl}/checkout?source=ispry&plan=ispry_membership&canceled=1`
      : `${baseUrl}/checkout?canceled=1`);

  try {
    const stripe = new Stripe(stripeKey);
    const isSubscription = tier.billing === "subscription";
    // No PHI in Stripe metadata — ids and product flags only.
    const metadata = {
      appointment_id: appointmentId || "",
      patient_id: patientId || "",
      service_tier_id: tier.id,
      source: source || tier.brand || "sprymd",
    };

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
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
            ...(isSubscription ? { recurring: { interval: "month" as const } } : {}),
          },
        },
      ],
      customer_email: emailForStripe || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(isSubscription
        ? {
            subscription_data: {
              metadata,
            },
          }
        : {
            payment_intent_data: {
              // Card charges require suffix (account prefix + this). Keep discreet.
              statement_descriptor_suffix: STATEMENT_DESCRIPTOR,
            },
          }),
      metadata,
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

    res.status(200).json({
      url: session.url,
      sessionId: session.id,
      appointmentId: appointmentId || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({ event: "create_checkout_session_failed", message }),
    );
    res.status(500).json({ error: "checkout_session_failed", message });
  }
}

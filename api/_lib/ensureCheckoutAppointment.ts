import type { SupabaseClient } from "@supabase/supabase-js";

export type EnsureCheckoutAppointmentInput = {
  supabase: SupabaseClient;
  appointmentId?: string;
  patientEmail: string;
  patientName?: string;
  serviceTierId: string;
  amountCents: number;
  currency?: string;
  physicalState?: string;
  stripeCheckoutSessionId?: string;
};

export type EnsureCheckoutAppointmentResult = {
  appointmentId: string;
  patientId: string;
  created: boolean;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Upsert a patients row by email (guest-safe when user_id is nullable) and
 * ensure an appointments row exists for this cash-pay checkout.
 */
export async function ensureCheckoutAppointment(
  input: EnsureCheckoutAppointmentInput,
): Promise<EnsureCheckoutAppointmentResult> {
  const email = normalizeEmail(input.patientEmail);
  if (!email) {
    throw new Error("patient_email_required");
  }

  const { supabase } = input;

  if (input.appointmentId) {
    const { data: existing, error } = await supabase
      .from("appointments")
      .select("id, patient_id, status")
      .eq("id", input.appointmentId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!existing?.id || !existing.patient_id) {
      throw new Error("appointment_not_found");
    }

    // Never revive cancelled/paid/completed/in-visit rows back to awaiting_payment.
    // Pre-payment statuses (scheduled, awaiting_payment, empty) may be moved into checkout.
    const status = String(existing.status || "");
    const terminal = new Set([
      "cancelled",
      "canceled",
      "paid",
      "completed",
      "no_show",
      "in_progress",
      "claimed",
      "refunded",
    ]);
    if (status && terminal.has(status)) {
      return {
        appointmentId: existing.id as string,
        patientId: existing.patient_id as string,
        created: false,
      };
    }

    const patch: Record<string, unknown> = {
      status: "awaiting_payment",
      service_tier: input.serviceTierId,
      amount_cents: input.amountCents,
      currency: input.currency || "usd",
      updated_at: new Date().toISOString(),
    };
    if (input.stripeCheckoutSessionId) {
      patch.stripe_checkout_session_id = input.stripeCheckoutSessionId;
    }

    const { error: updateError } = await supabase
      .from("appointments")
      .update(patch)
      .eq("id", existing.id)
      .in("status", ["awaiting_payment", "scheduled"]);

    if (updateError) throw new Error(updateError.message);

    return {
      appointmentId: existing.id as string,
      patientId: existing.patient_id as string,
      created: false,
    };
  }

  const { data: byEmail, error: findError } = await supabase
    .from("patients")
    .select("id, full_name")
    .ilike("email", email)
    .maybeSingle();

  if (findError) throw new Error(findError.message);

  let patientId = byEmail?.id as string | undefined;

  if (!patientId) {
    const { data: inserted, error: insertError } = await supabase
      .from("patients")
      .insert({
        email,
        full_name: (input.patientName || "").trim(),
        state_of_residence: input.physicalState
          ? input.physicalState.toUpperCase()
          : null,
        user_id: null,
      })
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);
    patientId = inserted.id as string;
  } else if (input.patientName?.trim() && !byEmail?.full_name) {
    await supabase
      .from("patients")
      .update({
        full_name: input.patientName.trim(),
        ...(input.physicalState
          ? { state_of_residence: input.physicalState.toUpperCase() }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", patientId);
  }

  const appointmentRow: Record<string, unknown> = {
    patient_id: patientId,
    service_tier: input.serviceTierId,
    amount_cents: input.amountCents,
    currency: input.currency || "usd",
    status: "awaiting_payment",
  };
  if (input.stripeCheckoutSessionId) {
    appointmentRow.stripe_checkout_session_id = input.stripeCheckoutSessionId;
  }

  const { data: appointment, error: apptError } = await supabase
    .from("appointments")
    .insert(appointmentRow)
    .select("id")
    .single();

  if (apptError) throw new Error(apptError.message);

  return {
    appointmentId: appointment.id as string,
    patientId,
    created: true,
  };
}

export type PaymentEventInput = {
  supabase: SupabaseClient;
  stripeEventId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  appointmentId?: string | null;
  patientId?: string | null;
  eventType: string;
  amountCents?: number | null;
  currency?: string | null;
  status?: string | null;
  payload?: Record<string, unknown>;
};

/** Best-effort ledger write — never throws (logs via return). */
export async function recordPaymentEvent(
  input: PaymentEventInput,
): Promise<{ ok: boolean; skipped?: boolean; message?: string }> {
  try {
    const row = {
      stripe_event_id: input.stripeEventId || null,
      stripe_checkout_session_id: input.stripeCheckoutSessionId || null,
      stripe_payment_intent_id: input.stripePaymentIntentId || null,
      appointment_id: input.appointmentId || null,
      patient_id: input.patientId || null,
      event_type: input.eventType,
      amount_cents: input.amountCents ?? null,
      currency: input.currency || "usd",
      status: input.status || null,
      payload: input.payload || {},
    };

    const { error } = await input.supabase.from("payment_events").insert(row);
    if (error) {
      // Unique stripe_event_id → already recorded
      if (error.code === "23505") return { ok: true, skipped: true };
      return { ok: false, message: error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

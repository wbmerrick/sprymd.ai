import { describe, expect, it } from "vitest";
import { markAppointmentPaidFromSession } from "../../api/_lib/markCheckoutPaid";
import type Stripe from "stripe";

type Row = Record<string, unknown>;

function mockSupabase(state: {
  appointments?: Row[];
  paymentEvents?: Row[];
}) {
  const appointments = state.appointments || [];
  const paymentEvents = state.paymentEvents || [];

  const from = (table: string) => {
    const list = table === "appointments" ? appointments : paymentEvents;
    let filters: Array<(r: Row) => boolean> = [];
    let updatePayload: Row | null = null;
    let mode: "select" | "update" | "insert" = "select";

    const api: Record<string, unknown> = {};
    const run = () => {
      let rows = [...list];
      for (const f of filters) rows = rows.filter(f);
      return rows;
    };

    api.select = () => api;
    api.eq = (col: string, val: unknown) => {
      filters.push((r) => r[col] === val);
      return api;
    };
    api.maybeSingle = async () => {
      if (mode === "update" && updatePayload) {
        const rows = run();
        const row = rows[0];
        if (!row) return { data: null, error: null };
        Object.assign(row, updatePayload);
        return { data: row, error: null };
      }
      return { data: run()[0] || null, error: null };
    };
    api.insert = (payload: Row) => {
      mode = "insert";
      const thenable = {
        then: (
          resolve: (v: { data: Row | null; error: null }) => void,
          reject?: (e: unknown) => void,
        ) => {
          try {
            const row = { id: `pe-${paymentEvents.length + 1}`, ...payload };
            paymentEvents.push(row);
            resolve({ data: row, error: null });
          } catch (e) {
            reject?.(e);
          }
        },
        select: () => api,
      };
      return thenable;
    };
    api.update = (payload: Row) => {
      mode = "update";
      updatePayload = payload;
      filters = [];
      return api;
    };

    return api;
  };

  return {
    client: { from } as never,
    appointments,
    paymentEvents,
  };
}

function paidSession(overrides: Partial<Stripe.Checkout.Session> = {}) {
  return {
    id: "cs_test_abc",
    payment_status: "paid",
    status: "complete",
    amount_total: 9900,
    currency: "usd",
    payment_intent: "pi_test_1",
    metadata: {
      appointment_id: "appt-1",
      patient_id: "pat-1",
      service_tier_id: "protocol_start",
      patient_email: "p@example.com",
    },
    ...overrides,
  } as Stripe.Checkout.Session;
}

describe("markAppointmentPaidFromSession", () => {
  it("promotes awaiting_payment to paid and writes payment_events", async () => {
    const { client, appointments, paymentEvents } = mockSupabase({
      appointments: [
        {
          id: "appt-1",
          status: "awaiting_payment",
          patient_id: "pat-1",
          stripe_checkout_session_id: "cs_test_abc",
        },
      ],
    });

    const result = await markAppointmentPaidFromSession({
      supabase: client,
      session: paidSession(),
      stripeEventId: "reconcile:cs_test_abc",
      eventType: "checkout.session.reconciled",
    });

    expect(result.updated).toBe(true);
    expect(result.alreadyPaid).toBe(false);
    expect(appointments[0].status).toBe("paid");
    expect(appointments[0].stripe_payment_intent_id).toBe("pi_test_1");
    expect(paymentEvents.length).toBe(1);
    expect(paymentEvents[0].event_type).toBe("checkout.session.reconciled");
    expect(paymentEvents[0].appointment_id).toBe("appt-1");
  });

  it("refuses to revive cancelled appointments after refund", async () => {
    const { client, appointments, paymentEvents } = mockSupabase({
      appointments: [
        {
          id: "appt-1",
          status: "cancelled",
          patient_id: "pat-1",
          stripe_checkout_session_id: "cs_test_abc",
        },
      ],
    });

    const result = await markAppointmentPaidFromSession({
      supabase: client,
      session: paidSession(),
      stripeEventId: "reconcile:cs_test_abc",
    });

    expect(result.updated).toBe(false);
    expect(result.skippedNonAwaiting).toBe(true);
    expect(appointments[0].status).toBe("cancelled");
    expect(paymentEvents.length).toBe(0);
  });

  it("returns alreadyPaid when status is already paid", async () => {
    const { client, paymentEvents } = mockSupabase({
      appointments: [
        {
          id: "appt-1",
          status: "paid",
          patient_id: "pat-1",
          stripe_checkout_session_id: "cs_test_abc",
        },
      ],
    });

    const result = await markAppointmentPaidFromSession({
      supabase: client,
      session: paidSession(),
    });

    expect(result.alreadyPaid).toBe(true);
    expect(result.updated).toBe(false);
    expect(paymentEvents.length).toBe(0);
  });

  it("skips fully refunded PaymentIntents even when session.payment_status is paid", async () => {
    const { client, appointments, paymentEvents } = mockSupabase({
      appointments: [
        {
          id: "appt-1",
          status: "awaiting_payment",
          patient_id: "pat-1",
          stripe_checkout_session_id: "cs_test_abc",
        },
      ],
    });

    const result = await markAppointmentPaidFromSession({
      supabase: client,
      session: paidSession({
        payment_intent: {
          id: "pi_test_1",
          object: "payment_intent",
          status: "succeeded",
          amount_received: 7500,
          amount_refunded: 7500,
        } as Stripe.PaymentIntent,
      }),
    });

    expect(result.updated).toBe(false);
    expect(result.skippedRefunded).toBe(true);
    expect(appointments[0].status).toBe("awaiting_payment");
    expect(paymentEvents.length).toBe(0);
  });
});

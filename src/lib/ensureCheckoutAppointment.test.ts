import { describe, expect, it, vi } from "vitest";
import {
  ensureCheckoutAppointment,
  recordPaymentEvent,
} from "../../api/_lib/ensureCheckoutAppointment";

type Row = Record<string, unknown>;

function mockSupabase(state: {
  patients?: Row[];
  appointments?: Row[];
  paymentEvents?: Row[];
}) {
  const patients = state.patients || [];
  const appointments = state.appointments || [];
  const paymentEvents = state.paymentEvents || [];

  const from = (table: string) => {
    const api: Record<string, unknown> = {};
    let filters: Array<(r: Row) => boolean> = [];
    let insertPayload: Row | null = null;
    let updatePayload: Row | null = null;
    let mode: "select" | "insert" | "update" = "select";

    const runSelect = () => {
      let rows =
        table === "patients"
          ? patients
          : table === "appointments"
            ? appointments
            : paymentEvents;
      for (const f of filters) rows = rows.filter(f);
      return rows;
    };

    api.select = () => api;
    api.eq = (col: string, val: unknown) => {
      filters.push((r) => r[col] === val);
      return api;
    };
    api.ilike = (col: string, val: string) => {
      const needle = String(val).toLowerCase();
      filters.push((r) => String(r[col] || "").toLowerCase() === needle);
      return api;
    };
    api.maybeSingle = async () => {
      const rows = runSelect();
      return { data: rows[0] || null, error: null };
    };
    api.single = async () => {
      if (mode === "insert" && insertPayload) {
        const id = `${table}-${Math.random().toString(36).slice(2, 8)}`;
        const row = { id, ...insertPayload };
        if (table === "patients") patients.push(row);
        if (table === "appointments") appointments.push(row);
        if (table === "payment_events") paymentEvents.push(row);
        return { data: row, error: null };
      }
      const rows = runSelect();
      return { data: rows[0] || null, error: rows[0] ? null : { message: "not found" } };
    };
    api.insert = (payload: Row) => {
      mode = "insert";
      insertPayload = payload;
      // Support both `.insert(row)` (awaited) and `.insert(row).select().single()`.
      const thenable = {
        then: (
          resolve: (v: { data: Row | null; error: null }) => void,
          reject?: (e: unknown) => void,
        ) => {
          try {
            const id = `${table}-${Math.random().toString(36).slice(2, 8)}`;
            const row = { id, ...payload };
            if (table === "patients") patients.push(row);
            if (table === "appointments") appointments.push(row);
            if (table === "payment_events") paymentEvents.push(row);
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
      const chain: Record<string, unknown> = {};
      const apply = async () => {
        const list =
          table === "patients"
            ? patients
            : table === "appointments"
              ? appointments
              : paymentEvents;
        let rows = [...list];
        for (const f of filters) rows = rows.filter(f);
        const row = rows[0];
        if (row && updatePayload) Object.assign(row, updatePayload);
        return { data: row || null, error: null };
      };
      chain.eq = (col: string, val: unknown) => {
        filters.push((r) => r[col] === val);
        return chain;
      };
      chain.in = (col: string, vals: unknown[]) => {
        const set = new Set(vals);
        filters.push((r) => set.has(r[col]));
        return chain;
      };
      chain.then = (
        resolve: (v: { data: Row | null; error: null }) => void,
        reject?: (e: unknown) => void,
      ) => {
        apply().then(resolve, reject);
      };
      return chain;
    };

    return api;
  };

  return {
    client: { from } as never,
    patients,
    appointments,
    paymentEvents,
  };
}

describe("ensureCheckoutAppointment", () => {
  it("creates a guest patient and appointment when none exist", async () => {
    const { client, patients, appointments } = mockSupabase({});
    const result = await ensureCheckoutAppointment({
      supabase: client,
      patientEmail: "Pat@Example.com",
      patientName: "Pat Example",
      serviceTierId: "protocol_start",
      amountCents: 7500,
      physicalState: "TN",
    });

    expect(result.created).toBe(true);
    expect(patients).toHaveLength(1);
    expect(patients[0]).toMatchObject({
      email: "pat@example.com",
      full_name: "Pat Example",
      user_id: null,
      state_of_residence: "TN",
    });
    expect(appointments).toHaveLength(1);
    expect(appointments[0]).toMatchObject({
      patient_id: result.patientId,
      service_tier: "protocol_start",
      amount_cents: 7500,
      status: "awaiting_payment",
    });
    expect(result.appointmentId).toBeTruthy();
  });

  it("reuses an existing patient by email", async () => {
    const { client, patients, appointments } = mockSupabase({
      patients: [{ id: "p1", email: "pat@example.com", full_name: "Pat" }],
    });
    const result = await ensureCheckoutAppointment({
      supabase: client,
      patientEmail: "pat@example.com",
      serviceTierId: "protocol_start",
      amountCents: 7500,
    });
    expect(result.patientId).toBe("p1");
    expect(patients).toHaveLength(1);
    expect(appointments).toHaveLength(1);
  });

  it("updates an existing appointment when appointmentId is provided", async () => {
    const { client, appointments } = mockSupabase({
      appointments: [
        {
          id: "a1",
          patient_id: "p1",
          status: "scheduled",
          service_tier: "old",
          amount_cents: 1,
        },
      ],
    });
    const result = await ensureCheckoutAppointment({
      supabase: client,
      appointmentId: "a1",
      patientEmail: "pat@example.com",
      serviceTierId: "protocol_start",
      amountCents: 7500,
      stripeCheckoutSessionId: "cs_test",
    });
    expect(result.created).toBe(false);
    expect(result.appointmentId).toBe("a1");
    expect(appointments[0]).toMatchObject({
      status: "awaiting_payment",
      service_tier: "protocol_start",
      amount_cents: 7500,
      stripe_checkout_session_id: "cs_test",
    });
  });

  it("refuses to revive cancelled appointments into awaiting_payment", async () => {
    const { client, appointments } = mockSupabase({
      appointments: [
        {
          id: "a1",
          patient_id: "p1",
          status: "cancelled",
          service_tier: "protocol_start",
          amount_cents: 7500,
        },
      ],
    });
    const result = await ensureCheckoutAppointment({
      supabase: client,
      appointmentId: "a1",
      patientEmail: "pat@example.com",
      serviceTierId: "protocol_start",
      amountCents: 7500,
      stripeCheckoutSessionId: "cs_refunded",
    });
    expect(result.created).toBe(false);
    expect(appointments[0].status).toBe("cancelled");
    expect(appointments[0].stripe_checkout_session_id).toBeUndefined();
  });
});

describe("recordPaymentEvent", () => {
  it("inserts a ledger row", async () => {
    const { client, paymentEvents } = mockSupabase({});
    const result = await recordPaymentEvent({
      supabase: client,
      eventType: "checkout.session.completed",
      stripeCheckoutSessionId: "cs_1",
      appointmentId: "a1",
      amountCents: 7500,
    });
    expect(result.ok).toBe(true);
    expect(paymentEvents).toHaveLength(1);
  });
});

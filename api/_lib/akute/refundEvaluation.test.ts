import { describe, expect, it, vi, beforeEach } from "vitest";

const createRefund = vi.fn();
const recordPaymentEvent = vi.fn(async () => ({ ok: true }));

vi.mock("../ensureCheckoutAppointment", () => ({
  recordPaymentEvent: (...args: unknown[]) => recordPaymentEvent(...args),
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    refunds = { create: (...args: unknown[]) => createRefund(...args) };
    checkout = { sessions: { retrieve: vi.fn() } };
  },
}));

import { refundEvaluationForAppointment } from "./refundEvaluation";

function mockSupabase(
  appointment: Record<string, unknown> | null,
  prior = false,
) {
  return {
    from(table: string) {
      if (table === "appointments") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: appointment, error: null }),
            }),
          }),
          update: () => ({
            eq: () => ({
              in: async () => ({ data: null, error: null }),
            }),
          }),
        };
      }
      if (table === "payment_events") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: () => ({
                  maybeSingle: async () => ({
                    data: prior ? { id: "pe1" } : null,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
      return {};
    },
  };
}

describe("refundEvaluationForAppointment", () => {
  beforeEach(() => {
    createRefund.mockReset();
    recordPaymentEvent.mockClear();
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
  });

  it("auto-refunds on hard_stop when payment intent present", async () => {
    createRefund.mockResolvedValue({
      id: "re_1",
      amount: 10000,
      status: "succeeded",
    });

    const result = await refundEvaluationForAppointment({
      supabase: mockSupabase({
        id: "appt1",
        status: "paid",
        patient_id: "p1",
        amount_cents: 10000,
        stripe_payment_intent_id: "pi_123",
        stripe_checkout_session_id: "cs_123",
      }) as never,
      appointmentId: "appt1",
      reason: "hard_stop",
    });

    expect(result.ok).toBe(true);
    expect(result.refunded).toBe(true);
    expect(createRefund).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: "pi_123" }),
    );
  });

  it("auto-refunds on not_clinically_appropriate", async () => {
    createRefund.mockResolvedValue({
      id: "re_2",
      amount: 10000,
      status: "succeeded",
    });

    const result = await refundEvaluationForAppointment({
      supabase: mockSupabase({
        id: "appt2",
        status: "paid",
        patient_id: "p2",
        amount_cents: 10000,
        stripe_payment_intent_id: "pi_456",
      }) as never,
      appointmentId: "appt2",
      reason: "not_clinically_appropriate",
    });

    expect(result.ok).toBe(true);
    expect(result.refunded).toBe(true);
  });

  it("ignores duplicate when evaluation_refund already recorded", async () => {
    const result = await refundEvaluationForAppointment({
      supabase: mockSupabase(
        {
          id: "appt1",
          status: "paid",
          patient_id: "p1",
          amount_cents: 10000,
          stripe_payment_intent_id: "pi_123",
        },
        true,
      ) as never,
      appointmentId: "appt1",
      reason: "not_clinically_appropriate",
    });
    expect(result.ok).toBe(true);
    expect(result.already).toBe(true);
    expect(result.refunded).toBe(false);
    expect(createRefund).not.toHaveBeenCalled();
  });
});

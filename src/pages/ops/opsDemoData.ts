import type { OpsDetailResponse, OpsQueueItem } from "./opsHelpers";

const DEMO_PROVIDER = "11111111-1111-4111-8111-111111111111";

const PAID_UNASSIGNED = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PAID_ASSIGNED = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const AWAITING = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const COMPLETED = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

export const DEMO_QUEUE: OpsQueueItem[] = [
  {
    id: PAID_UNASSIGNED,
    status: "paid",
    serviceTier: "protocol",
    amountCents: 7900,
    currency: "usd",
    paidAt: new Date(Date.now() - 25 * 60_000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 60_000).toISOString(),
    providerId: null,
    patient: {
      id: "p-demo-1",
      email: "jordan.demo@example.com",
      fullName: "Jordan Demo",
      phone: "615-555-0142",
      state: "TN",
    },
  },
  {
    id: PAID_ASSIGNED,
    status: "paid",
    serviceTier: "clinician",
    amountCents: 9900,
    currency: "usd",
    paidAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    providerId: DEMO_PROVIDER,
    patient: {
      id: "p-demo-2",
      email: "sam.demo@example.com",
      fullName: "Sam Demo",
      phone: "615-555-0199",
      state: "TN",
    },
  },
  {
    id: AWAITING,
    status: "awaiting_payment",
    serviceTier: "protocol",
    amountCents: 7900,
    currency: "usd",
    paidAt: null,
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    providerId: null,
    patient: {
      id: "p-demo-3",
      email: "alex.demo@example.com",
      fullName: "Alex Demo",
      state: "TN",
    },
  },
  {
    id: COMPLETED,
    status: "completed",
    serviceTier: "protocol",
    amountCents: 7900,
    currency: "usd",
    paidAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    createdAt: new Date(Date.now() - 28 * 3600_000).toISOString(),
    providerId: DEMO_PROVIDER,
    patient: {
      id: "p-demo-4",
      email: "riley.demo@example.com",
      fullName: "Riley Demo",
      state: "TN",
    },
  },
];

const DETAILS: Record<string, OpsDetailResponse> = {
  [PAID_UNASSIGNED]: {
    appointment: {
      id: PAID_UNASSIGNED,
      status: "paid",
      serviceTier: "protocol",
      amountCents: 7900,
      currency: "usd",
      paidAt: DEMO_QUEUE[0].paidAt,
      createdAt: DEMO_QUEUE[0].createdAt,
      updatedAt: DEMO_QUEUE[0].paidAt!,
      providerId: null,
      stripeCheckoutSessionId: "cs_live_demo_jordan",
      stripePaymentIntentId: "pi_live_demo_jordan",
      pharmacyStatus: null,
      pharmacyNotes: null,
      pharmacySentAt: null,
      patient: {
        id: "p-demo-1",
        email: "jordan.demo@example.com",
        fullName: "Jordan Demo",
        phone: "615-555-0142",
        state: "TN",
        dateOfBirth: "1988-04-12",
      },
    },
    payments: [
      {
        id: "pay-demo-1",
        event_type: "checkout.session.completed",
        status: "paid",
        amount_cents: 7900,
        created_at: DEMO_QUEUE[0].paidAt!,
      },
    ],
    intakes: [
      {
        id: "intake-demo-1",
        status: "submitted",
        summary:
          "Erectile dysfunction for ~8 months. Interested in tadalafil. No chest pain. No nitrate use. TN resident.",
        updatedAt: new Date(Date.now() - 50 * 60_000).toISOString(),
      },
    ],
  },
  [PAID_ASSIGNED]: {
    appointment: {
      id: PAID_ASSIGNED,
      status: "paid",
      serviceTier: "clinician",
      amountCents: 9900,
      currency: "usd",
      paidAt: DEMO_QUEUE[1].paidAt,
      createdAt: DEMO_QUEUE[1].createdAt,
      updatedAt: DEMO_QUEUE[1].paidAt!,
      providerId: DEMO_PROVIDER,
      stripeCheckoutSessionId: "cs_live_demo_sam",
      stripePaymentIntentId: "pi_live_demo_sam",
      pharmacyStatus: "sent",
      pharmacyNotes: "Tadalafil 5mg daily · faxed to compounding partner",
      pharmacySentAt: new Date(Date.now() - 30 * 60_000).toISOString(),
      patient: {
        id: "p-demo-2",
        email: "sam.demo@example.com",
        fullName: "Sam Demo",
        phone: "615-555-0199",
        state: "TN",
        dateOfBirth: "1979-11-03",
      },
    },
    payments: [
      {
        id: "pay-demo-2",
        event_type: "checkout.session.completed",
        status: "paid",
        amount_cents: 9900,
        created_at: DEMO_QUEUE[1].paidAt!,
      },
    ],
    intakes: [
      {
        id: "intake-demo-2",
        status: "submitted",
        summary: "Primary care check-in. Fatigue and sleep questions. No urgent red flags.",
        updatedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
      },
    ],
  },
};

export const DEMO_STAFF = {
  email: "demo@ops.local",
  providerId: DEMO_PROVIDER,
};

export function getDemoDetail(id: string): OpsDetailResponse | null {
  if (DETAILS[id]) return DETAILS[id];
  const row = DEMO_QUEUE.find((i) => i.id === id);
  if (!row) return null;
  return {
    appointment: {
      id: row.id,
      status: row.status,
      serviceTier: row.serviceTier,
      amountCents: row.amountCents,
      currency: row.currency,
      paidAt: row.paidAt,
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
      providerId: row.providerId,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      pharmacyStatus: null,
      pharmacyNotes: null,
      pharmacySentAt: null,
      patient: row.patient
        ? { ...row.patient, dateOfBirth: "1990-01-01" }
        : null,
    },
    payments: [],
    intakes: [],
  };
}

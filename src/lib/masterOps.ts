import { supabase } from "@/integrations/supabase/client";
import { listStaffInbox } from "@/lib/messaging";
import { listStaffTeamThreads } from "@/lib/staffMessaging";
import { getClinicalCasesForReview, hydrateClinicalReviewQueue } from "@/lib/patientCareStore";

export interface MemberRow {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  state: string;
  createdAt: string;
  stripeCustomerId: string | null;
}

export interface PaymentRow {
  id: string;
  eventType: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  patientId: string | null;
}

export interface DailyPoint {
  /** YYYY-MM-DD */
  date: string;
  /** Short label for axis (e.g. "Mar 12") */
  label: string;
}

export interface FinanceDailyPoint extends DailyPoint {
  cents: number;
  count: number;
}

export interface MemberDailyPoint extends DailyPoint {
  count: number;
  cumulative: number;
}

export interface NamedCount {
  name: string;
  count: number;
  cents?: number;
}

export interface MasterOpsSnapshot {
  generatedAt: string;
  members: {
    total: number;
    last7d: number;
    last30d: number;
    withStripe: number;
    rows: MemberRow[];
    /** New signups per day for the last 30 days + running total */
    dailySignups: MemberDailyPoint[];
    /** Top states by member count */
    byState: NamedCount[];
    stripeMix: { linked: number; missing: number };
  };
  finance: {
    grossCents: number;
    paymentEvents: number;
    avgTicketCents: number;
    last7dCents: number;
    last30dCents: number;
    recent: PaymentRow[];
    /** Revenue (cents) and event count per day for the last 30 days */
    dailyRevenue: FinanceDailyPoint[];
    /** Totals by payment event type */
    byEventType: NamedCount[];
  };
  clinical: {
    appointments: number;
    paidAppointments: number;
    pendingCharts: number;
    patientInboxOpen: number;
    patientInboxUrgent: number;
    teamThreads: number;
  };
  health: {
    score: number;
    alerts: string[];
  };
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function inLastDays(iso: string, n: number): boolean {
  return new Date(iso).getTime() >= daysAgo(n).getTime();
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Contiguous last-N calendar days ending today (local). */
function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(dayKey(daysAgo(i)));
  }
  return keys;
}

function buildFinanceDaily(payments: PaymentRow[], days = 30): FinanceDailyPoint[] {
  const keys = lastNDayKeys(days);
  const map = new Map(keys.map((k) => [k, { cents: 0, count: 0 }]));
  for (const p of payments) {
    const k = dayKey(new Date(p.createdAt));
    const bucket = map.get(k);
    if (!bucket) continue;
    bucket.cents += p.amountCents || 0;
    bucket.count += 1;
  }
  return keys.map((date) => {
    const b = map.get(date)!;
    return { date, label: dayLabel(date), cents: b.cents, count: b.count };
  });
}

function buildMemberDaily(members: MemberRow[], days = 30): MemberDailyPoint[] {
  const keys = lastNDayKeys(days);
  const map = new Map(keys.map((k) => [k, 0]));
  for (const m of members) {
    const k = dayKey(new Date(m.createdAt));
    if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
  }
  // Baseline = members who joined before the window
  const windowStart = daysAgo(days - 1);
  windowStart.setHours(0, 0, 0, 0);
  let cumulative = members.filter((m) => new Date(m.createdAt).getTime() < windowStart.getTime()).length;
  return keys.map((date) => {
    const count = map.get(date) || 0;
    cumulative += count;
    return { date, label: dayLabel(date), count, cumulative };
  });
}

function buildByState(members: MemberRow[], limit = 8): NamedCount[] {
  const tallies = new Map<string, number>();
  for (const m of members) {
    const state = (m.state || "").trim().toUpperCase() || "Unknown";
    tallies.set(state, (tallies.get(state) || 0) + 1);
  }
  return [...tallies.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function buildByEventType(payments: PaymentRow[]): NamedCount[] {
  const tallies = new Map<string, { count: number; cents: number }>();
  for (const p of payments) {
    const name = p.eventType || "unknown";
    const cur = tallies.get(name) || { count: 0, cents: 0 };
    cur.count += 1;
    cur.cents += p.amountCents || 0;
    tallies.set(name, cur);
  }
  return [...tallies.entries()]
    .map(([name, v]) => ({ name, count: v.count, cents: v.cents }))
    .sort((a, b) => (b.cents || 0) - (a.cents || 0));
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100);
}

/**
 * Aggregate venture health metrics for the owner command center.
 */
export async function loadMasterOpsSnapshot(ownerEmail: string): Promise<MasterOpsSnapshot> {
  const generatedAt = new Date().toISOString();

  const [patientsRes, paymentsRes, appointmentsRes, inbox, team] = await Promise.all([
    supabase
      .from("patients")
      .select("id, email, full_name, phone, state_of_residence, created_at, stripe_customer_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("payment_events")
      .select("id, event_type, amount_cents, currency, status, created_at, patient_id")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("appointments").select("id, status, amount_cents, paid_at, created_at"),
    listStaffInbox(),
    listStaffTeamThreads(ownerEmail),
  ]);

  const patientRows = patientsRes.data || [];
  const paymentRows = paymentsRes.data || [];
  const appointmentRows = appointmentsRes.data || [];

  const members: MemberRow[] = patientRows.map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name || p.email,
    phone: p.phone || "",
    state: p.state_of_residence || "",
    createdAt: p.created_at,
    stripeCustomerId: p.stripe_customer_id,
  }));

  const recentPayments: PaymentRow[] = paymentRows.map((p) => ({
    id: p.id,
    eventType: p.event_type,
    amountCents: p.amount_cents || 0,
    currency: p.currency || "usd",
    status: p.status || "",
    createdAt: p.created_at,
    patientId: p.patient_id,
  }));

  const grossCents = recentPayments.reduce((sum, p) => sum + (p.amountCents || 0), 0);
  const last7dCents = recentPayments
    .filter((p) => inLastDays(p.createdAt, 7))
    .reduce((sum, p) => sum + (p.amountCents || 0), 0);
  const last30dCents = recentPayments
    .filter((p) => inLastDays(p.createdAt, 30))
    .reduce((sum, p) => sum + (p.amountCents || 0), 0);

  await hydrateClinicalReviewQueue();
  const pendingCharts = getClinicalCasesForReview(ownerEmail).filter(
    (c) => c.status === "pending_review" || c.status === "needs_info",
  ).length;

  const urgent = inbox.filter((t) => t.urgency === "urgent").length;
  const paidAppointments = appointmentRows.filter(
    (a) => a.paid_at || a.status === "paid" || a.status === "meds_paid" || a.status === "completed",
  ).length;

  const alerts: string[] = [];
  if (urgent > 0) alerts.push(`${urgent} urgent patient thread${urgent === 1 ? "" : "s"} need reply.`);
  if (pendingCharts > 0) alerts.push(`${pendingCharts} chart${pendingCharts === 1 ? "" : "s"} awaiting authorization.`);
  if (grossCents === 0) alerts.push("No recorded payment events yet — verify Stripe webhooks.");
  if (members.filter((m) => !m.stripeCustomerId).length > members.length * 0.5 && members.length > 2) {
    alerts.push("Over half of members lack a Stripe customer id — billing linkage may be incomplete.");
  }

  const withStripe = members.filter((m) => Boolean(m.stripeCustomerId)).length;

  const snapshot: MasterOpsSnapshot = {
    generatedAt,
    members: {
      total: members.length,
      last7d: members.filter((m) => inLastDays(m.createdAt, 7)).length,
      last30d: members.filter((m) => inLastDays(m.createdAt, 30)).length,
      withStripe,
      rows: members,
      dailySignups: buildMemberDaily(members, 30),
      byState: buildByState(members),
      stripeMix: { linked: withStripe, missing: members.length - withStripe },
    },
    finance: {
      grossCents,
      paymentEvents: recentPayments.length,
      avgTicketCents:
        recentPayments.length > 0 ? Math.round(grossCents / recentPayments.length) : 0,
      last7dCents,
      last30dCents,
      recent: recentPayments.slice(0, 25),
      dailyRevenue: buildFinanceDaily(recentPayments, 30),
      byEventType: buildByEventType(recentPayments),
    },
    clinical: {
      appointments: appointmentRows.length,
      paidAppointments,
      pendingCharts,
      patientInboxOpen: inbox.length,
      patientInboxUrgent: urgent,
      teamThreads: team.length,
    },
    health: {
      score: 100,
      alerts: [],
    },
  };

  if (snapshot.members.last7d === 0 && snapshot.members.total > 0) {
    alerts.push("No new members in the last 7 days — watch acquisition funnel.");
  }

  // Simple health score: start 100, subtract for open risks.
  let score = 100;
  score -= Math.min(30, urgent * 8);
  score -= Math.min(25, pendingCharts * 5);
  if (grossCents === 0) score -= 10;
  if (snapshot.members.last7d === 0 && snapshot.members.total > 0) score -= 10;
  snapshot.health = { score: Math.max(35, score), alerts };

  return snapshot;
}

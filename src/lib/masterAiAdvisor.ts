import type { MasterOpsSnapshot } from "@/lib/masterOps";
import { formatUsd } from "@/lib/masterOps";

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

/**
 * Deterministic ops advisor grounded in live snapshot metrics.
 * No external LLM keys required — answers stay on-device from your data.
 */
export function buildOpsBriefing(snapshot: MasterOpsSnapshot): string {
  const lines = [
    `Venture pulse · health score ${snapshot.health.score}/100`,
    ``,
    `Members: ${snapshot.members.total} total · +${snapshot.members.last7d} (7d) · +${snapshot.members.last30d} (30d)`,
    `Revenue recorded: ${formatUsd(snapshot.finance.grossCents)} lifetime · ${formatUsd(snapshot.finance.last30dCents)} (30d) · avg ticket ${formatUsd(snapshot.finance.avgTicketCents)}`,
    `Clinical load: ${snapshot.clinical.patientInboxUrgent} urgent threads · ${snapshot.clinical.pendingCharts} charts pending · ${snapshot.clinical.appointments} appointments`,
  ];
  if (snapshot.health.alerts.length) {
    lines.push("", "Watchouts:");
    for (const a of snapshot.health.alerts) lines.push(`• ${a}`);
  } else {
    lines.push("", "No critical watchouts — queues look manageable.");
  }
  return lines.join("\n");
}

export function answerOpsQuestion(question: string, snapshot: MasterOpsSnapshot): string {
  const q = question.trim().toLowerCase();
  if (!q) return "Ask about revenue, members, queues, or risk.";

  if (/(revenue|money|finance|mrr|cash|payment|stripe)/.test(q)) {
    return [
      `Recorded payment volume: ${formatUsd(snapshot.finance.grossCents)} across ${snapshot.finance.paymentEvents} events.`,
      `Last 7 days: ${formatUsd(snapshot.finance.last7dCents)} · Last 30 days: ${formatUsd(snapshot.finance.last30dCents)}.`,
      `Average ticket: ${formatUsd(snapshot.finance.avgTicketCents)}.`,
      snapshot.finance.grossCents === 0
        ? "Action: confirm Stripe webhooks write into payment_events so owner dashboards stay trustworthy."
        : "Action: review refunds/declines weekly and keep avg ticket above protocol COGS + clinician time.",
    ].join("\n");
  }

  if (/(member|patient|user|growth|churn|signup)/.test(q)) {
    return [
      `Members on file: ${snapshot.members.total} (${snapshot.members.withStripe} linked to Stripe).`,
      `New members: ${snapshot.members.last7d} in 7d · ${snapshot.members.last30d} in 30d.`,
      snapshot.members.last7d === 0
        ? "Action: push intake CTAs on landing + quiz completion reminders — acquisition is flat."
        : "Action: convert new members into active protocols within 48h (chart review + messaging).",
    ].join("\n");
  }

  if (/(urgent|inbox|message|queue|sla)/.test(q)) {
    return [
      `Patient inbox: ${snapshot.clinical.patientInboxOpen} open · ${snapshot.clinical.patientInboxUrgent} urgent.`,
      `Team threads: ${snapshot.clinical.teamThreads}.`,
      snapshot.clinical.patientInboxUrgent > 0
        ? "Action: clear urgent patient threads before noon — SLA risk and trust risk."
        : "Inbox urgency is clear. Keep same-day replies on 'soon' threads.",
    ].join("\n");
  }

  if (/(chart|review|rx|prescrib|authorize)/.test(q)) {
    return [
      `Pending chart reviews: ${snapshot.clinical.pendingCharts}.`,
      `Appointments: ${snapshot.clinical.appointments} total · ${snapshot.clinical.paidAppointments} paid/completed markers.`,
      snapshot.clinical.pendingCharts > 0
        ? "Action: finish pending authorizations so pharmacy handoff and cash conversion don't stall."
        : "Chart queue is clear — good for fulfillment latency.",
    ].join("\n");
  }

  if (/(risk|health|safeguard|thrive|priority|what should)/.test(q)) {
    return buildOpsBriefing(snapshot);
  }

  return [
    buildOpsBriefing(snapshot),
    "",
    "Try asking: “How is revenue?”, “Member growth?”, “Any urgent queues?”, or “What should I prioritize?”",
  ].join("\n");
}

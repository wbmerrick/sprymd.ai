export type OpsQueueItem = {
  id: string;
  status: string;
  serviceTier: string;
  amountCents: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  providerId: string | null;
  patient: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    state?: string;
  } | null;
};

export type OpsDetailResponse = {
  appointment: {
    id: string;
    status: string;
    serviceTier: string;
    amountCents: number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    providerId: string | null;
    stripeCheckoutSessionId: string | null;
    stripePaymentIntentId?: string | null;
    pharmacyStatus?: string | null;
    pharmacyNotes?: string | null;
    pharmacySentAt?: string | null;
    patient: {
      id: string;
      email: string;
      fullName: string;
      phone?: string;
      state?: string;
      dateOfBirth?: string;
    } | null;
  };
  payments: Array<{
    id: string;
    event_type: string;
    status: string | null;
    amount_cents: number | null;
    created_at: string;
    stripe_checkout_session_id?: string | null;
    stripe_payment_intent_id?: string | null;
  }>;
  intakes: Array<{
    id: string;
    status: string;
    summary: string;
    updatedAt: string;
  }>;
};

export const STATUS_PRIORITY: Record<string, number> = {
  paid: 0,
  awaiting_payment: 1,
  scheduled: 2,
  completed: 3,
  no_show: 4,
  cancelled: 5,
};

export function money(cents: number, currency = "usd") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format((cents || 0) / 100);
  } catch {
    return `$${((cents || 0) / 100).toFixed(2)}`;
  }
}

export function relativeTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const abs = Math.abs(Date.now() - t);
  const mins = Math.round(abs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function statusTone(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
    case "awaiting_payment":
      return "bg-amber-500/15 text-amber-100 border-amber-500/30";
    case "completed":
      return "bg-sky-500/15 text-sky-100 border-sky-500/30";
    case "cancelled":
    case "no_show":
      return "bg-rose-500/15 text-rose-100 border-rose-500/30";
    default:
      return "bg-white/10 text-white/80 border-white/15";
  }
}

export function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export function nextActionLabel(item: Pick<OpsQueueItem, "status" | "providerId">) {
  switch (item.status) {
    case "paid":
      return item.providerId ? "Review chart" : "Claim & review";
    case "awaiting_payment":
      return "Waiting on pay";
    case "scheduled":
      return "Confirm time";
    case "completed":
      return "Done";
    case "cancelled":
    case "no_show":
      return "Closed";
    default:
      return "Review";
  }
}

export function guidance(
  status: string,
  assigned: boolean,
): { title: string; body: string } {
  switch (status) {
    case "paid":
      return {
        title: assigned ? "Async review ready" : "Claim this case, then review",
        body: assigned
          ? "Read the intake, write the SOAP / decision, then fulfill via pharmacy or refund in Stripe if not a candidate. Video room is optional."
          : "Assign yourself, review the chart intake, document the decision, then pharmacy handoff or full refund.",
      };
    case "awaiting_payment":
      return {
        title: "Checkout not finished",
        body: "No clinician action yet — payment has not cleared. Use Sync payment if Stripe already succeeded.",
      };
    case "scheduled":
      return {
        title: "Visit scheduled",
        body: "Confirm timing. When paid, review the chart (video only if needed).",
      };
    case "completed":
      return {
        title: "Encounter closed",
        body: "Review the chart if needed. Reopen only to fix a mistake.",
      };
    case "cancelled":
    case "no_show":
      return {
        title: "Closed without visit",
        body: "If the patient paid and was declined, confirm the Stripe refund already posted.",
      };
    default:
      return {
        title: "Review case",
        body: "Check patient, payment, and intake before acting.",
      };
  }
}

export function ageFromDob(dob: string | null | undefined): string | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (!Number.isFinite(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 130 ? String(age) : null;
}

export function isDemoRequest(search: string) {
  return new URLSearchParams(search).get("demo") === "1";
}

export function withDemo(path: string, demo: boolean) {
  if (!demo) return path;
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}demo=1`;
}

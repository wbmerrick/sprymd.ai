import type {
  DashboardData,
  DashboardUser,
  MessageThread,
  NotificationItem,
  Shipment,
  Subscription,
  SupportTopic,
  Transaction,
  Treatment,
} from "@/types/dashboard";
import {
  addCustomerOrder,
  addCustomerProtocol,
  buildCustomerProfile,
  getSessionEmail,
  getStoredAccount,
  updateCustomerProfile,
  upsertStoredAccount,
} from "@/lib/customerAccounts";

const CARE_KEY = "sprymd_patient_care_v1";

export type ClinicalCaseStatus = "pending_review" | "needs_info" | "approved" | "denied";

export interface ClinicalCase {
  id: string;
  email: string;
  treatmentId?: string;
  conditionId?: string;
  planName?: string;
  intake?: Record<string, unknown>;
  status: ClinicalCaseStatus;
  createdAt: string;
  reviewedAt?: string;
}

export interface PatientCareRecord {
  email: string;
  treatments: Treatment[];
  notifications: NotificationItem[];
  shipments: Shipment[];
  subscriptions: Subscription[];
  messages: MessageThread[];
  transactions: Transaction[];
  clinicalCases: ClinicalCase[];
  updatedAt: string;
}

const SUPPORT_TOPICS: SupportTopic[] = [
  { id: "topic_1", title: "Refills & shipping", description: "When to renew, cold-chain, and tracking" },
  { id: "topic_2", title: "Side effects", description: "What is expected vs when to message care" },
  { id: "topic_3", title: "Billing & autoship", description: "Charges, pauses, and payment methods" },
  { id: "topic_4", title: "Labs & visits", description: "Ordering labs and reviewing results" },
];

function emailKey(email: string) {
  return String(email || "").trim().toLowerCase();
}

function readAll(): Record<string, PatientCareRecord> {
  try {
    return JSON.parse(localStorage.getItem(CARE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(store: Record<string, PatientCareRecord>) {
  localStorage.setItem(CARE_KEY, JSON.stringify(store));
}

function emptyCare(email: string): PatientCareRecord {
  return {
    email: emailKey(email),
    treatments: [],
    notifications: [],
    shipments: [],
    subscriptions: [],
    messages: [],
    transactions: [],
    clinicalCases: [],
    updatedAt: new Date().toISOString(),
  };
}

/** Ensure care record exists and is synced with account shell. */
export function getPatientCare(email: string): PatientCareRecord {
  const key = emailKey(email);
  if (!key) return emptyCare("");
  const store = readAll();
  if (store[key]) return store[key];

  // Migrate any legacy protocols/orders from customerAccounts into care shapes.
  const account = getStoredAccount(key);
  const care = emptyCare(key);
  if (account?.protocols?.length) {
    care.treatments = account.protocols.map((p: Record<string, unknown>, idx: number) =>
      protocolToTreatment(p, idx),
    );
  }
  if (account?.orders?.length) {
    care.transactions = account.orders.map((o: Record<string, unknown>) => ({
      id: String(o.id || `txn_${Date.now()}`),
      date: String(o.createdAt || new Date().toISOString()).slice(0, 10),
      product: String(o.label || o.mode || "Order"),
      quantity: 1,
      amount: Number(o.total || 0),
      status: "Pending review",
    }));
  }
  store[key] = care;
  writeAll(store);
  return care;
}

function saveCare(care: PatientCareRecord): PatientCareRecord {
  const key = emailKey(care.email);
  const store = readAll();
  const next = { ...care, email: key, updatedAt: new Date().toISOString() };
  store[key] = next;
  writeAll(store);
  return next;
}

function protocolToTreatment(p: Record<string, unknown>, idx: number): Treatment {
  const start = String(p.startedAt || new Date().toISOString()).slice(0, 10);
  const through = new Date(start);
  through.setMonth(through.getMonth() + 1);
  const statusRaw = String(p.status || "pending");
  const status =
    statusRaw.includes("pending") ? "pending" : statusRaw.includes("inactive") ? "inactive" : "active";
  return {
    id: String(p.id || `tx_migrated_${idx}`),
    medicationName: String(p.name || "Protocol"),
    dosage: String(p.sub || "Clinician-titrated"),
    goal: String(p.goal || "Follow your clinician-directed protocol"),
    startDate: start,
    refillThroughDate: through.toISOString().slice(0, 10),
    status: status as Treatment["status"],
    refillsRemaining: status === "pending" ? 0 : 3,
    category: String(p.category || "Protocol"),
    dosingInstructions: "Your clinician will confirm exact dosing after chart review.",
    storage: "Follow the label on your shipment.",
    howItWorks: "This protocol was started from your SpryMD intake and is tied to your account.",
    sideEffects: [],
    troubleshooting: "Message Support from your account if you miss a dose or have questions.",
    warnings: "Do not share medication. Seek urgent care for severe allergic symptoms.",
  };
}

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function buildDashboardForEmail(email: string): DashboardData | null {
  const key = emailKey(email);
  if (!key) return null;
  const account = getStoredAccount(key) || buildCustomerProfile(key);
  const care = getPatientCare(key);
  const user: DashboardUser = {
    id: account.id || key,
    name: account.name || key.split("@")[0],
    email: key,
    avatarInitials: initials(account.name || "", key),
  };
  return {
    user,
    treatments: care.treatments,
    notifications: care.notifications,
    shipments: care.shipments,
    subscriptions: care.subscriptions,
    messages: care.messages,
    transactions: care.transactions,
    supportTopics: SUPPORT_TOPICS,
  };
}

export function dismissCareNotification(email: string, id: string) {
  const care = getPatientCare(email);
  care.notifications = care.notifications.map((n) => (n.id === id ? { ...n, dismissed: true } : n));
  return saveCare(care);
}

export function clearCareNotifications(email: string) {
  const care = getPatientCare(email);
  care.notifications = care.notifications.map((n) => ({ ...n, dismissed: true }));
  return saveCare(care);
}

export function toggleCareAutoship(email: string, subscriptionId: string, enabled: boolean) {
  const care = getPatientCare(email);
  care.subscriptions = care.subscriptions.map((s) =>
    s.id === subscriptionId ? { ...s, autoshipEnabled: enabled } : s,
  );
  return saveCare(care);
}

export function updateCareProfile(
  email: string,
  patch: { name?: string; phone?: string; dob?: string; address?: Record<string, string> },
) {
  updateCustomerProfile(email, patch);
  return buildDashboardForEmail(email);
}

function pushNotification(care: PatientCareRecord, n: Omit<NotificationItem, "id" | "dismissed" | "timestamp"> & { timestamp?: string }) {
  care.notifications.unshift({
    id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    dismissed: false,
    timestamp: n.timestamp || new Date().toISOString(),
    icon: n.icon,
    title: n.title,
    description: n.description,
  });
}

/** Record a subscription checkout into the signed-in patient's care record. */
export function recordSubscriptionCheckout(input: {
  email: string;
  plan: { name: string; sub?: string; price: number; chilled?: boolean };
  conditionId?: string;
  conditionName?: string;
  goal?: string;
  answers?: Record<string, unknown>;
}) {
  const email = emailKey(input.email);
  const care = getPatientCare(email);
  const now = new Date();
  const through = new Date(now);
  through.setDate(through.getDate() + 28);
  const treatmentId = `tx_${Date.now()}`;

  const treatment: Treatment = {
    id: treatmentId,
    medicationName: input.plan.name,
    dosage: input.plan.sub || "Clinician-titrated",
    goal: input.goal || `Start ${input.conditionName || "care"} with SpryMD`,
    startDate: now.toISOString().slice(0, 10),
    refillThroughDate: through.toISOString().slice(0, 10),
    status: "pending",
    refillsRemaining: 0,
    category: input.conditionName || "Protocol",
    dosingInstructions:
      "Pending clinician review. Exact dose and titration schedule will be confirmed before the first shipment.",
    storage: input.plan.chilled
      ? "Refrigerate after arrival (36–46°F). Do not freeze."
      : "Store at room temperature unless the label says otherwise.",
    howItWorks: "Your intake was submitted for chart review. Medication ships only after a clinician approves.",
    sideEffects: [],
    troubleshooting: "Message Support if your symptoms change while waiting for review.",
    warnings: "Do not start leftover or shared medication while this case is pending.",
  };

  care.treatments.unshift(treatment);
  care.subscriptions.unshift({
    id: `sub_${Date.now()}`,
    treatmentId,
    price: input.plan.price,
    billingCadence: "Every 4 weeks",
    nextChargeDate: through.toISOString().slice(0, 10),
    autoshipEnabled: true,
  });
  care.transactions.unshift({
    id: `txn_${Date.now()}`,
    date: now.toISOString().slice(0, 10),
    product: `${input.plan.name} · subscription`,
    quantity: 1,
    amount: input.plan.price,
    status: "Pending review",
  });
  care.clinicalCases.unshift({
    id: `case_${Date.now()}`,
    email,
    treatmentId,
    conditionId: input.conditionId,
    planName: input.plan.name,
    intake: input.answers || {},
    status: "pending_review",
    createdAt: now.toISOString(),
  });
  care.messages.unshift({
    id: `msg_${Date.now()}`,
    subject: `Intake received · ${input.plan.name}`,
    preview: "A SpryMD clinician will review your case before any prescription is issued.",
    updatedAt: now.toISOString(),
    status: "no_action",
  });
  pushNotification(care, {
    icon: "pill",
    title: "Case submitted for clinician review",
    description: `${input.plan.name} is pending approval. You’ll be notified when it’s reviewed.`,
  });
  care.shipments.unshift({
    id: `shp_${Date.now()}`,
    treatmentId,
    medicationName: input.plan.name,
    nextShipmentDate: null,
    status: "scheduled",
    quantity: 1,
  });

  saveCare(care);
  addCustomerProtocol(email, {
    name: input.plan.name,
    sub: input.plan.sub,
    price: input.plan.price,
    chilled: input.plan.chilled,
    category: input.conditionName,
    status: "pending_review",
  });
  addCustomerOrder(email, {
    label: input.plan.name,
    mode: "subscription",
    total: input.plan.price,
  });
  return care;
}

export function recordCartCheckout(input: {
  email: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
}) {
  const email = emailKey(input.email);
  const care = getPatientCare(email);
  const label = input.items.map((i) => `${i.name} ×${i.qty}`).join(", ") || "Marketplace order";
  care.transactions.unshift({
    id: `txn_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    product: label,
    quantity: input.items.reduce((s, i) => s + i.qty, 0),
    amount: input.total,
    status: "Payment pending",
  });
  pushNotification(care, {
    icon: "truck",
    title: "Marketplace order placed",
    description: "Your stack order is recorded. Payment processing will be confirmed by email.",
  });
  saveCare(care);
  addCustomerOrder(email, { label, mode: "cart", total: input.total });
  return care;
}

export function recordRefillCheckout(input: {
  email: string;
  items: { rxId?: string; name: string; price: number; treatmentId?: string }[];
  total: number;
}) {
  const email = emailKey(input.email);
  const care = getPatientCare(email);
  const now = new Date();
  const shipDate = new Date(now);
  shipDate.setDate(shipDate.getDate() + 2);

  for (const item of input.items) {
    const treatmentId =
      item.treatmentId ||
      care.treatments.find((t) => t.medicationName === item.name)?.id ||
      `tx_refill_${Date.now()}`;
    care.shipments.unshift({
      id: `shp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      treatmentId,
      medicationName: item.name,
      nextShipmentDate: shipDate.toISOString().slice(0, 10),
      status: "processing",
      quantity: 1,
    });
  }

  care.transactions.unshift({
    id: `txn_${Date.now()}`,
    date: now.toISOString().slice(0, 10),
    product: `Refill · ${input.items.map((i) => i.name).join(", ")}`,
    quantity: input.items.length,
    amount: input.total,
    status: "Pending review",
  });
  care.messages.unshift({
    id: `msg_${Date.now()}`,
    subject: "Refill request received",
    preview: "Your refill request is queued for clinician confirmation before pharmacy release.",
    updatedAt: now.toISOString(),
    status: "no_action",
  });
  pushNotification(care, {
    icon: "truck",
    title: "Refill requested",
    description: "We’ll confirm with your clinician, then release to pharmacy fulfillment.",
  });
  saveCare(care);
  addCustomerOrder(email, {
    label: `Refill · ${input.items.map((i) => i.name).join(", ")}`,
    mode: "refill",
    total: input.total,
  });
  return care;
}

export function getSignedInEmail(): string | null {
  return getSessionEmail();
}

export function ensureAccountShell(email: string, name?: string) {
  const key = emailKey(email);
  const existing = getStoredAccount(key);
  if (!existing) {
    upsertStoredAccount(
      buildCustomerProfile(key, {
        name: name || key.split("@")[0],
        protocols: [],
        orders: [],
        rxHistory: [],
      }),
    );
  }
  getPatientCare(key);
}

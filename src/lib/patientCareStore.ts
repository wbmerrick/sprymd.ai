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
  WearableDevice,
  WearableKind,
  WearableReading,
  WearableSyncMode,
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
import { defaultWearableDevices } from "@/data/wearables";

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
  wearableDevices: WearableDevice[];
  wearableReadings: WearableReading[];
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
    wearableDevices: defaultWearableDevices(),
    wearableReadings: [],
    updatedAt: new Date().toISOString(),
  };
}

/** Ensure care record exists and is synced with account shell. */
export function getPatientCare(email: string): PatientCareRecord {
  const key = emailKey(email);
  if (!key) return emptyCare("");
  const store = readAll();
  if (store[key]) {
    const care = store[key];
    // Backfill wearables for records created before this feature.
    if (!care.wearableDevices?.length) {
      care.wearableDevices = defaultWearableDevices();
      care.wearableReadings = care.wearableReadings || [];
      return saveCare(care);
    }
    if (!Array.isArray(care.wearableReadings)) {
      care.wearableReadings = [];
      return saveCare(care);
    }
    return care;
  }

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
    wearableDevices: care.wearableDevices || defaultWearableDevices(),
    wearableReadings: care.wearableReadings || [],
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

function statusForMode(mode: WearableSyncMode): WearableDevice["status"] {
  if (mode === "continuous") return "monitoring";
  if (mode === "sync") return "paired";
  return "disconnected";
}

/** Update sync / continuous monitoring mode for a home wearable. */
export function setWearableSyncMode(email: string, deviceId: WearableKind, syncMode: WearableSyncMode) {
  const care = getPatientCare(email);
  care.wearableDevices = (care.wearableDevices || defaultWearableDevices()).map((d) =>
    d.id === deviceId
      ? {
          ...d,
          syncMode,
          status: statusForMode(syncMode),
          lastSyncedAt: syncMode === "manual" ? d.lastSyncedAt : new Date().toISOString(),
          enabled: true,
        }
      : d,
  );
  const device = care.wearableDevices.find((d) => d.id === deviceId);
  if (device) {
    pushNotification(care, {
      icon: "activity",
      title:
        syncMode === "continuous"
          ? `${device.name} · continuous monitoring on`
          : syncMode === "sync"
            ? `${device.name} · sync enabled`
            : `${device.name} · manual upload`,
      description:
        syncMode === "continuous"
          ? "Readings will stream into your dashboard when the device is in range."
          : syncMode === "sync"
            ? "Pull the latest session from your home device anytime."
            : "Upload files or enter readings manually for this device.",
    });
  }
  return saveCare(care);
}

/** Simulate a device sync pull and persist generated readings. */
export function syncWearableDevice(email: string, deviceId: WearableKind) {
  const care = getPatientCare(email);
  const devices = care.wearableDevices || defaultWearableDevices();
  const device = devices.find((d) => d.id === deviceId);
  if (!device) return care;

  care.wearableDevices = devices.map((d) =>
    d.id === deviceId
      ? { ...d, status: "syncing", lastSyncedAt: new Date().toISOString(), syncMode: d.syncMode === "manual" ? "sync" : d.syncMode }
      : d,
  );

  const sample = sampleReadingForDevice(deviceId);
  care.wearableReadings = [sample, ...(care.wearableReadings || [])].slice(0, 200);
  care.wearableDevices = care.wearableDevices.map((d) =>
    d.id === deviceId ? { ...d, status: d.syncMode === "continuous" ? "monitoring" : "paired" } : d,
  );
  pushNotification(care, {
    icon: "activity",
    title: `${device.name} synced`,
    description: `${sample.metric}: ${formatReadingValue(sample)} saved to your dashboard.`,
  });
  return saveCare(care);
}

/** Save a manual or uploaded reading to the patient dashboard. */
export function recordWearableReading(
  email: string,
  input: {
    deviceId: WearableKind;
    metric: string;
    value: number;
    unit: string;
    secondaryValue?: number;
    secondaryUnit?: string;
    note?: string;
    source?: WearableReading["source"];
    recordedAt?: string;
  },
) {
  const care = getPatientCare(email);
  const reading: WearableReading = {
    id: `wr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    deviceId: input.deviceId,
    metric: input.metric,
    value: input.value,
    unit: input.unit,
    secondaryValue: input.secondaryValue,
    secondaryUnit: input.secondaryUnit,
    note: input.note,
    source: input.source || "manual",
    recordedAt: input.recordedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  care.wearableReadings = [reading, ...(care.wearableReadings || [])].slice(0, 200);
  care.wearableDevices = (care.wearableDevices || defaultWearableDevices()).map((d) =>
    d.id === input.deviceId ? { ...d, lastSyncedAt: reading.recordedAt, status: d.status === "disconnected" ? "paired" : d.status } : d,
  );
  const device = care.wearableDevices.find((d) => d.id === input.deviceId);
  pushNotification(care, {
    icon: "activity",
    title: `${device?.name || "Device"} reading saved`,
    description: `${reading.metric}: ${formatReadingValue(reading)}`,
  });
  return saveCare(care);
}

/** Parse a simple CSV/TSV/JSON upload into readings for a device. */
export function importWearableUpload(
  email: string,
  deviceId: WearableKind,
  fileName: string,
  text: string,
) {
  const rows = parseWearableFile(text, deviceId);
  if (!rows.length) {
    throw new Error("No readable rows found. Use CSV with value columns, or a JSON array of readings.");
  }
  const care = getPatientCare(email);
  const stamped = rows.map((r, i) => ({
    ...r,
    id: `wr_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
    deviceId,
    source: "upload" as const,
    createdAt: new Date().toISOString(),
  }));
  care.wearableReadings = [...stamped, ...(care.wearableReadings || [])].slice(0, 200);
  care.wearableDevices = (care.wearableDevices || defaultWearableDevices()).map((d) =>
    d.id === deviceId
      ? { ...d, lastSyncedAt: new Date().toISOString(), status: d.syncMode === "continuous" ? "monitoring" : "paired" }
      : d,
  );
  const device = care.wearableDevices.find((d) => d.id === deviceId);
  pushNotification(care, {
    icon: "activity",
    title: `${device?.name || "Device"} upload saved`,
    description: `Imported ${stamped.length} reading${stamped.length === 1 ? "" : "s"} from ${fileName}.`,
  });
  return saveCare(care);
}

function formatReadingValue(r: Pick<WearableReading, "value" | "unit" | "secondaryValue" | "secondaryUnit">) {
  const primary = `${r.value}${r.unit ? ` ${r.unit}` : ""}`;
  if (r.secondaryValue != null) {
    return `${primary} · ${r.secondaryValue}${r.secondaryUnit ? ` ${r.secondaryUnit}` : ""}`;
  }
  return primary;
}

function sampleReadingForDevice(deviceId: WearableKind): WearableReading {
  const now = new Date().toISOString();
  const base = {
    id: `wr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    deviceId,
    source: "sync" as const,
    recordedAt: now,
    createdAt: now,
  };
  switch (deviceId) {
    case "bp_monitor":
      return { ...base, metric: "Blood pressure", value: 118 + Math.round(Math.random() * 10), unit: "mmHg", secondaryValue: 74 + Math.round(Math.random() * 6), secondaryUnit: "mmHg", note: "Systolic / diastolic" };
    case "pulse_oximeter":
      return { ...base, metric: "SpO₂", value: 96 + Math.round(Math.random() * 3), unit: "%", secondaryValue: 62 + Math.round(Math.random() * 12), secondaryUnit: "bpm" };
    case "smart_scale":
      return { ...base, metric: "Weight", value: Number((165 + Math.random() * 4).toFixed(1)), unit: "lb", secondaryValue: Number((22 + Math.random() * 2).toFixed(1)), secondaryUnit: "%" };
    case "cpap":
      return { ...base, metric: "AHI", value: Number((1.2 + Math.random() * 2).toFixed(1)), unit: "events/hr", secondaryValue: Number((6.5 + Math.random()).toFixed(1)), secondaryUnit: "hr" };
    case "sleep_tracker":
      return { ...base, metric: "Sleep score", value: 78 + Math.round(Math.random() * 15), unit: "/100", secondaryValue: Number((6.8 + Math.random()).toFixed(1)), secondaryUnit: "hr" };
    default:
      return { ...base, metric: "Reading", value: 0, unit: "" };
  }
}

function parseWearableFile(text: string, deviceId: WearableKind): Omit<WearableReading, "id" | "deviceId" | "source" | "createdAt">[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      return arr
        .map((row) => normalizeJsonReading(row, deviceId))
        .filter(Boolean) as Omit<WearableReading, "id" | "deviceId" | "source" | "createdAt">[];
    } catch {
      /* fall through to CSV */
    }
  }

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 1) return [];
  const delim = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delim).map((h) => h.trim().toLowerCase());
  const hasHeader = headers.some((h) => /value|systolic|weight|spo|ahi|score|pulse|diastolic/.test(h));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => {
      const cols = line.split(delim).map((c) => c.trim());
      if (hasHeader) {
        const get = (keys: string[]) => {
          const idx = headers.findIndex((h) => keys.some((k) => h.includes(k)));
          return idx >= 0 ? cols[idx] : undefined;
        };
        const value = Number(get(["systolic", "weight", "spo", "ahi", "score", "value", "primary"]));
        if (!Number.isFinite(value)) return null;
        const secondaryRaw = get(["diastolic", "pulse", "fat", "usage", "hours", "secondary"]);
        const secondaryValue = secondaryRaw != null && secondaryRaw !== "" ? Number(secondaryRaw) : undefined;
        return normalizeFromValues(deviceId, value, Number.isFinite(secondaryValue as number) ? secondaryValue : undefined, get(["date", "time", "recorded"]));
      }
      const value = Number(cols[0]);
      if (!Number.isFinite(value)) return null;
      const secondaryValue = cols[1] != null && cols[1] !== "" ? Number(cols[1]) : undefined;
      return normalizeFromValues(deviceId, value, Number.isFinite(secondaryValue as number) ? secondaryValue : undefined, cols[2]);
    })
    .filter(Boolean) as Omit<WearableReading, "id" | "deviceId" | "source" | "createdAt">[];
}

function normalizeJsonReading(row: Record<string, unknown>, deviceId: WearableKind) {
  const value = Number(row.value ?? row.systolic ?? row.weight ?? row.spo2 ?? row.ahi ?? row.score);
  if (!Number.isFinite(value)) return null;
  const secondaryValueRaw = row.secondaryValue ?? row.diastolic ?? row.pulse ?? row.bodyFat ?? row.usageHours ?? row.hours;
  const secondaryValue = secondaryValueRaw != null && secondaryValueRaw !== "" ? Number(secondaryValueRaw) : undefined;
  return normalizeFromValues(
    deviceId,
    value,
    Number.isFinite(secondaryValue as number) ? (secondaryValue as number) : undefined,
    String(row.recordedAt || row.date || ""),
    String(row.metric || ""),
    String(row.unit || ""),
    String(row.note || ""),
  );
}

function normalizeFromValues(
  deviceId: WearableKind,
  value: number,
  secondaryValue?: number,
  recordedAt?: string,
  metric?: string,
  unit?: string,
  note?: string,
): Omit<WearableReading, "id" | "deviceId" | "source" | "createdAt"> {
  const defaults = sampleReadingForDevice(deviceId);
  return {
    metric: metric || defaults.metric,
    value,
    unit: unit || defaults.unit,
    secondaryValue: secondaryValue ?? undefined,
    secondaryUnit: secondaryValue != null ? defaults.secondaryUnit : undefined,
    note: note || undefined,
    recordedAt: recordedAt && !Number.isNaN(Date.parse(recordedAt)) ? new Date(recordedAt).toISOString() : new Date().toISOString(),
  };
}

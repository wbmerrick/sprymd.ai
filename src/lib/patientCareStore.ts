import type {
  BodyGoal,
  BodyGoalMetric,
  BodyProfile,
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
  WearableOAuthLink,
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
import {
  buildCustomWearable,
  defaultWearableDevices,
  MARKETPLACE_DEVICE_MAP,
  mergeWearableCatalog,
  metricDefaults,
  WEARABLE_CATALOG,
} from "@/data/wearables";
import {
  DEFAULT_DASHBOARD_WIDGETS,
  type DashboardLayoutConfig,
  type DashboardWidgetId,
} from "@/types/dashboard";
import { publishVitalsEvent } from "@/lib/vitalsBus";
import { isMasterEmail } from "@/lib/masterAccount";
import { dispatchPrescriptionToPharmacy } from "@/lib/pharmacyFulfillment";
import { syncTreatmentApprovalToDatabase } from "@/lib/supabaseSync";

const READINGS_CAP = 500;

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

export function emptyBodyProfile(): BodyProfile {
  return {
    heightCm: null,
    weightLb: null,
    targetWeightLb: null,
    updatedAt: new Date().toISOString(),
  };
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
  bodyProfile: BodyProfile;
  bodyGoals: BodyGoal[];
  dashboardLayout?: DashboardLayoutConfig;
  oauthLinks?: WearableOAuthLink[];
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
    bodyProfile: emptyBodyProfile(),
    bodyGoals: [],
    dashboardLayout: defaultDashboardLayout(),
    oauthLinks: [],
    updatedAt: new Date().toISOString(),
  };
}


/** Unlock full device rack + seed body profile for master accounts. */
export function bootstrapMasterCare(email: string): PatientCareRecord {
  const care = getPatientCare(email);
  if (!isMasterEmail(email)) return care;

  care.wearableDevices = mergeWearableCatalog(care.wearableDevices).map((d) => ({
    ...d,
    owned: true,
    enabled: true,
    status: d.status === "disconnected" ? "paired" : d.status,
  }));

  if (!care.bodyProfile?.heightCm) {
    care.bodyProfile = {
      heightCm: 180,
      weightLb: care.bodyProfile?.weightLb ?? 185,
      targetWeightLb: care.bodyProfile?.targetWeightLb ?? 175,
      updatedAt: new Date().toISOString(),
    };
  }

  if (!care.bodyGoals?.length) {
    const now = new Date().toISOString();
    care.bodyGoals = [
      {
        id: "goal_master_weight",
        title: "Master target weight",
        metric: "weight",
        targetValue: care.bodyProfile.targetWeightLb || 175,
        unit: "lb",
        currentValue: care.bodyProfile.weightLb || 185,
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  if (!care.notifications.some((n) => n.title.includes("Master account"))) {
    pushNotification(care, {
      icon: "activity",
      title: "Master account ready",
      description: "Full wearable rack unlocked. Open the clinical terminal to stream, upload, and manage care.",
    });
  }

  return saveCare(care);
}

/** Ensure care record exists and is synced with account shell. */
export function getPatientCare(email: string): PatientCareRecord {
  const key = emailKey(email);
  if (!key) return emptyCare("");
  const store = readAll();
  if (store[key]) {
    const care = store[key];
    let dirty = false;
    // Backfill wearables for records created before this feature.
    if (!care.wearableDevices?.length) {
      care.wearableDevices = defaultWearableDevices();
      care.wearableReadings = care.wearableReadings || [];
      dirty = true;
    } else {
      const merged = mergeWearableCatalog(care.wearableDevices);
      if (merged.length !== care.wearableDevices.length || merged.some((d, i) => d.id !== care.wearableDevices[i]?.id || d.owned !== care.wearableDevices[i]?.owned)) {
        care.wearableDevices = merged;
        dirty = true;
      } else {
        care.wearableDevices = merged;
      }
    }
    if (!Array.isArray(care.wearableReadings)) {
      care.wearableReadings = [];
      dirty = true;
    }
    if (!care.bodyProfile) {
      care.bodyProfile = emptyBodyProfile();
      dirty = true;
    }
    if (!Array.isArray(care.bodyGoals)) {
      care.bodyGoals = [];
      dirty = true;
    }
    if (dirty) return saveCare(care);
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
    bodyProfile: care.bodyProfile || emptyBodyProfile(),
    bodyGoals: care.bodyGoals || [],
    clinicalCases: care.clinicalCases || [],
    dashboardLayout: care.dashboardLayout || defaultDashboardLayout(),
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

/**
 * Record a "request a clinician call" from a disqualified intake. The case is
 * flagged `needs_info` so it is distinguishable from a plan awaiting approval,
 * and the patient gets a message + notification describing the next step.
 */
export function recordConsultRequest(input: {
  email: string;
  conditionId?: string;
  conditionName?: string;
  disqualifier: string;
  crisis?: boolean;
  phone: string;
  bestTime?: string;
  answers?: Record<string, unknown>;
}) {
  const email = emailKey(input.email);
  const care = getPatientCare(email);
  const now = new Date().toISOString();
  const label = input.conditionName || "care";

  care.clinicalCases.unshift({
    id: `case_${Date.now()}`,
    email,
    conditionId: input.conditionId,
    planName: `Clinician call · ${label}`,
    intake: {
      ...(input.answers || {}),
      consult_requested: true,
      disqualifier: input.disqualifier,
      crisis: !!input.crisis,
      phone: input.phone,
      best_time_to_call: input.bestTime || "",
    },
    status: "needs_info",
    createdAt: now,
  });
  care.messages.unshift({
    id: `msg_${Date.now()}`,
    subject: `Clinician call requested · ${label}`,
    preview: `We'll call ${input.phone}${input.bestTime ? ` (${input.bestTime})` : ""} to talk through your answers before any treatment decision.`,
    updatedAt: now,
    status: "no_action",
  });
  pushNotification(care, {
    icon: "pill",
    title: "Clinician call requested",
    description: `Your ${label.toLowerCase()} answers need a live conversation first. Expect a call within one business day.`,
  });
  return saveCare(care);
}

export function recordCartCheckout(input: {
  email: string;
  items: { name: string; qty: number; price: number; productId?: string }[];
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
  linkMarketplacePurchaseToWearables(email, input.items, care);
  saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: "cart", at: new Date().toISOString() });
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

  for (const item of input.items) {
    const treatmentId =
      item.treatmentId ||
      care.treatments.find((t) => t.medicationName === item.name)?.id ||
      `tx_refill_${Date.now()}`;
    care.shipments.unshift({
      id: `shp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      treatmentId,
      medicationName: item.name,
      nextShipmentDate: null,
      status: "scheduled",
      quantity: 1,
    });
  }

  care.transactions.unshift({
    id: `txn_${Date.now()}`,
    date: now.toISOString().slice(0, 10),
    product: `Refill request · ${input.items.map((i) => i.name).join(", ")}`,
    quantity: input.items.length,
    amount: input.total,
    status: "Pending review",
  });
  care.messages.unshift({
    id: `msg_${Date.now()}`,
    subject: "Refill request received",
    preview: "Your refill request is queued for clinician confirmation. We will confirm payment before pharmacy release.",
    updatedAt: now.toISOString(),
    status: "no_action",
  });
  pushNotification(care, {
    icon: "truck",
    title: "Refill requested",
    description: "A clinician will confirm appropriateness, then we coordinate payment and pharmacy fulfillment.",
  });
  saveCare(care);
  addCustomerOrder(email, {
    label: `Refill request · ${input.items.map((i) => i.name).join(", ")}`,
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
  if (isMasterEmail(key)) {
    bootstrapMasterCare(key);
  }
}

function statusForMode(mode: WearableSyncMode): WearableDevice["status"] {
  if (mode === "continuous") return "monitoring";
  if (mode === "sync") return "paired";
  return "disconnected";
}

/** Update sync / continuous monitoring mode for a home wearable. */
export function setWearableSyncMode(email: string, deviceId: WearableKind, syncMode: WearableSyncMode) {
  const care = getPatientCare(email);
  const target = (care.wearableDevices || []).find((d) => d.id === deviceId);
  if (target && target.owned === false) {
    throw new Error("Purchase this device in the marketplace to unlock monitoring.");
  }
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
  care.wearableReadings = [sample, ...(care.wearableReadings || [])].slice(0, READINGS_CAP);
  care.wearableDevices = care.wearableDevices.map((d) =>
    d.id === deviceId ? { ...d, status: d.syncMode === "continuous" ? "monitoring" : "paired" } : d,
  );
  applyReadingToBodyProfile(care, sample);
  pushNotification(care, {
    icon: "activity",
    title: `${device.name} synced`,
    description: `${sample.metric}: ${formatReadingValue(sample)} saved to your dashboard.`,
  });
  const saved = saveCare(care);
  publishVitalsEvent({ type: "reading", deviceId, readingId: sample.id, at: sample.recordedAt });
  return saved;
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
  care.wearableReadings = [reading, ...(care.wearableReadings || [])].slice(0, READINGS_CAP);
  care.wearableDevices = (care.wearableDevices || defaultWearableDevices()).map((d) =>
    d.id === input.deviceId ? { ...d, lastSyncedAt: reading.recordedAt, status: d.status === "disconnected" ? "paired" : d.status } : d,
  );
  applyReadingToBodyProfile(care, reading);
  const device = care.wearableDevices.find((d) => d.id === input.deviceId);
  if (input.source !== "continuous") {
    pushNotification(care, {
      icon: "activity",
      title: `${device?.name || "Device"} reading saved`,
      description: `${reading.metric}: ${formatReadingValue(reading)}`,
    });
  }
  const saved = saveCare(care);
  publishVitalsEvent({ type: "reading", deviceId: input.deviceId, readingId: reading.id, at: reading.recordedAt });
  return saved;
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
  care.wearableReadings = [...stamped, ...(care.wearableReadings || [])].slice(0, READINGS_CAP);
  care.wearableDevices = (care.wearableDevices || defaultWearableDevices()).map((d) =>
    d.id === deviceId
      ? { ...d, lastSyncedAt: new Date().toISOString(), status: d.syncMode === "continuous" ? "monitoring" : "paired" }
      : d,
  );
  for (const row of stamped) applyReadingToBodyProfile(care, row);
  const device = care.wearableDevices.find((d) => d.id === deviceId);
  pushNotification(care, {
    icon: "activity",
    title: `${device?.name || "Device"} upload saved`,
    description: `Imported ${stamped.length} reading${stamped.length === 1 ? "" : "s"} from ${fileName}.`,
  });
  const saved = saveCare(care);
  publishVitalsEvent({ type: "reading", deviceId, readingId: stamped[0]?.id || "", at: new Date().toISOString() });
  return saved;
}

function formatReadingValue(r: Pick<WearableReading, "value" | "unit" | "secondaryValue" | "secondaryUnit">) {
  const primary = `${r.value}${r.unit ? ` ${r.unit}` : ""}`;
  if (r.secondaryValue != null) {
    return `${primary} · ${r.secondaryValue}${r.secondaryUnit ? ` ${r.secondaryUnit}` : ""}`;
  }
  return primary;
}


export function defaultDashboardLayout(): DashboardLayoutConfig {
  return {
    preset: "care_simple",
    widgets: [...DEFAULT_DASHBOARD_WIDGETS],
    pinnedDeviceIds: [],
    selectedMetrics: ["hr", "spo2", "weight", "glucose", "sleep_score"],
    updatedAt: new Date().toISOString(),
  };
}

export function saveDashboardLayout(email: string, patch: Partial<DashboardLayoutConfig>) {
  const care = getPatientCare(email);
  const prev = care.dashboardLayout || defaultDashboardLayout();
  care.dashboardLayout = {
    ...prev,
    ...patch,
    widgets: patch.widgets ? [...patch.widgets] : prev.widgets,
    pinnedDeviceIds: patch.pinnedDeviceIds ? [...patch.pinnedDeviceIds] : prev.pinnedDeviceIds,
    selectedMetrics: patch.selectedMetrics ? [...patch.selectedMetrics] : prev.selectedMetrics,
    updatedAt: new Date().toISOString(),
  };
  return saveCare(care);
}

/** Unlock a catalog device and mark it ready to sync. */
export function connectWearableDevice(email: string, kind: WearableKind) {
  const care = getPatientCare(email);
  care.wearableDevices = mergeWearableCatalog(care.wearableDevices);
  const exists = care.wearableDevices.some((d) => d.id === kind);
  if (!exists) {
    const catalog = WEARABLE_CATALOG.find((d) => d.id === kind);
    if (!catalog) throw new Error("Unknown wearable. Use Add any device for custom gear.");
    care.wearableDevices.push({
      ...catalog,
      syncMode: "manual",
      status: "paired",
      lastSyncedAt: null,
      enabled: true,
      owned: true,
    });
  } else {
    care.wearableDevices = care.wearableDevices.map((d) =>
      d.id === kind
        ? { ...d, owned: true, enabled: true, status: d.status === "disconnected" ? "paired" : d.status }
        : d,
    );
  }
  const device = care.wearableDevices.find((d) => d.id === kind)!;
  pushNotification(care, {
    icon: "activity",
    title: `${device.brand} ${device.name} connected`,
    description: "Sync, upload a file, or turn on live stream to see readings on your dashboard.",
  });
  const saved = saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: kind, at: new Date().toISOString() });
  return saved;
}

/** Register any brand/model so patients can sync gear not yet in the stock catalog. */
export function registerCustomWearable(
  email: string,
  input: { brand: string; name: string; metrics?: string[] },
) {
  const care = getPatientCare(email);
  const device = buildCustomWearable(input);
  care.wearableDevices = [...mergeWearableCatalog(care.wearableDevices), device];
  pushNotification(care, {
    icon: "activity",
    title: `${device.brand} ${device.name} added`,
    description: "Upload CSV/JSON exports from the maker's app, or log readings manually.",
  });
  const saved = saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: device.id, at: new Date().toISOString() });
  return { care: saved, device };
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
    case "oura_ring":
      return { ...base, metric: "HRV", value: 38 + Math.round(Math.random() * 28), unit: "ms", secondaryValue: 72 + Math.round(Math.random() * 20), secondaryUnit: "/100" };
    case "whoop_band":
      return { ...base, metric: "Recovery", value: 45 + Math.round(Math.random() * 45), unit: "%", secondaryValue: Number((8 + Math.random() * 12).toFixed(1)), secondaryUnit: "" };
    case "apple_watch":
      return { ...base, metric: "Heart rate", value: 58 + Math.round(Math.random() * 30), unit: "bpm", secondaryValue: 96 + Math.round(Math.random() * 3), secondaryUnit: "%" };
    case "garmin_watch":
      return { ...base, metric: "Heart rate", value: 60 + Math.round(Math.random() * 28), unit: "bpm", secondaryValue: 40 + Math.round(Math.random() * 30), secondaryUnit: "ms" };
    case "cgm":
      return { ...base, metric: "Glucose", value: 90 + Math.round(Math.random() * 50), unit: "mg/dL" };
    default: {
      const d = metricDefaults(deviceId);
      const primary = 50 + Math.round(Math.random() * 50);
      const secondary =
        d.secondaryMetric != null ? 20 + Math.round(Math.random() * 40) : undefined;
      return {
        ...base,
        metric: d.metric,
        value: primary,
        unit: d.unit,
        secondaryValue: secondary,
        secondaryUnit: secondary != null ? d.secondaryUnit : undefined,
      };
    }
  }
}

function applyReadingToBodyProfile(care: PatientCareRecord, reading: Pick<WearableReading, "deviceId" | "metric" | "value" | "unit">) {
  if (!care.bodyProfile) care.bodyProfile = emptyBodyProfile();
  const metric = reading.metric.toLowerCase();
  if (metric.includes("weight") || (reading.unit === "lb" && /scale|weight/i.test(reading.deviceId))) {
    care.bodyProfile.weightLb = reading.value;
    care.bodyProfile.updatedAt = new Date().toISOString();
  }
  // Keep active weight goals current
  care.bodyGoals = (care.bodyGoals || []).map((g) => {
    if (g.metric === "weight" && metric.includes("weight")) {
      return { ...g, currentValue: reading.value, updatedAt: new Date().toISOString(), status: reading.value <= g.targetValue ? "achieved" : g.status };
    }
    return g;
  });
}

/** Quiet continuous tick — no notification spam. */
export function appendContinuousTick(email: string, deviceId: WearableKind) {
  const care = getPatientCare(email);
  const device = (care.wearableDevices || []).find((d) => d.id === deviceId);
  if (!device?.owned || !device.enabled || device.syncMode !== "continuous") return care;

  const sample = { ...sampleReadingForDevice(deviceId), source: "continuous" as const };
  care.wearableReadings = [sample, ...(care.wearableReadings || [])].slice(0, READINGS_CAP);
  care.wearableDevices = care.wearableDevices.map((d) =>
    d.id === deviceId ? { ...d, lastSyncedAt: sample.recordedAt, status: "monitoring" } : d,
  );
  applyReadingToBodyProfile(care, sample);
  const saved = saveCare(care);
  publishVitalsEvent({ type: "reading", deviceId, readingId: sample.id, at: sample.recordedAt });
  return saved;
}

export function unlockWearableDevice(email: string, kind: WearableKind) {
  const care = getPatientCare(email);
  care.wearableDevices = mergeWearableCatalog(care.wearableDevices).map((d) =>
    d.id === kind ? { ...d, owned: true, enabled: true, status: d.status === "disconnected" ? "paired" : d.status } : d,
  );
  const device = care.wearableDevices.find((d) => d.id === kind);
  if (device) {
    pushNotification(care, {
      icon: "activity",
      title: `${device.brand} ${device.name} unlocked`,
      description: "Device is ready to sync, upload, or stream on your dashboard.",
    });
  }
  const saved = saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: kind, at: new Date().toISOString() });
  return saved;
}

export function setWearableEnabled(email: string, kind: WearableKind, enabled: boolean) {
  const care = getPatientCare(email);
  care.wearableDevices = (care.wearableDevices || []).map((d) =>
    d.id === kind ? { ...d, enabled, status: enabled ? d.status : "disconnected", syncMode: enabled ? d.syncMode : "manual" } : d,
  );
  const saved = saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: kind, at: new Date().toISOString() });
  return saved;
}

export function getOwnedWearableKinds(email: string): WearableKind[] {
  return (getPatientCare(email).wearableDevices || []).filter((d) => d.owned).map((d) => d.id);
}

export function linkMarketplacePurchaseToWearables(
  email: string,
  items: { productId?: string; name?: string }[],
  existingCare?: PatientCareRecord,
) {
  const care = existingCare || getPatientCare(email);
  care.wearableDevices = mergeWearableCatalog(care.wearableDevices);
  let unlocked = 0;
  for (const item of items) {
    const kind =
      (item.productId && MARKETPLACE_DEVICE_MAP[item.productId]) ||
      WEARABLE_NAME_HINTS.find((h) => item.name && h.re.test(item.name))?.kind;
    if (!kind) continue;
    care.wearableDevices = care.wearableDevices.map((d) =>
      d.id === kind ? { ...d, owned: true, enabled: true, status: "paired" as const } : d,
    );
    unlocked += 1;
  }
  if (unlocked && !existingCare) {
    pushNotification(care, {
      icon: "activity",
      title: "Wearable unlocked on your terminal",
      description: "Open the Signals panel to sync or start continuous monitoring.",
    });
    return saveCare(care);
  }
  return care;
}

const WEARABLE_NAME_HINTS: { re: RegExp; kind: WearableKind }[] = [
  { re: /blood pressure|omron/i, kind: "bp_monitor" },
  { re: /pulse ox|masimo|spo/i, kind: "pulse_oximeter" },
  { re: /body composition|withings|scale/i, kind: "smart_scale" },
  { re: /oura/i, kind: "oura_ring" },
  { re: /whoop/i, kind: "whoop_band" },
  { re: /apple watch/i, kind: "apple_watch" },
  { re: /garmin|venu/i, kind: "garmin_watch" },
  { re: /dexcom|cgm|glucose/i, kind: "cgm" },
];

export function getVitalsProfile(email: string): BodyProfile {
  return getPatientCare(email).bodyProfile || emptyBodyProfile();
}

export function updateVitalsProfile(
  email: string,
  patch: Partial<Pick<BodyProfile, "heightCm" | "weightLb" | "targetWeightLb">>,
) {
  const care = getPatientCare(email);
  care.bodyProfile = {
    ...(care.bodyProfile || emptyBodyProfile()),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (patch.weightLb != null) {
    care.bodyGoals = (care.bodyGoals || []).map((g) =>
      g.metric === "weight"
        ? {
            ...g,
            currentValue: patch.weightLb!,
            updatedAt: new Date().toISOString(),
            status: patch.weightLb! <= g.targetValue ? "achieved" : g.status === "achieved" ? "active" : g.status,
          }
        : g,
    );
  }
  const saved = saveCare(care);
  publishVitalsEvent({ type: "profile", at: new Date().toISOString() });
  return saved;
}

export function upsertBodyGoal(
  email: string,
  input: {
    id?: string;
    title: string;
    metric: BodyGoalMetric;
    targetValue: number;
    unit: string;
    treatmentId?: string;
    deviceId?: WearableKind;
    status?: BodyGoal["status"];
  },
) {
  const care = getPatientCare(email);
  const now = new Date().toISOString();
  const current =
    input.metric === "weight" && care.bodyProfile?.weightLb != null
      ? care.bodyProfile.weightLb
      : undefined;
  if (input.id) {
    care.bodyGoals = (care.bodyGoals || []).map((g) =>
      g.id === input.id
        ? {
            ...g,
            title: input.title,
            metric: input.metric,
            targetValue: input.targetValue,
            unit: input.unit,
            treatmentId: input.treatmentId,
            deviceId: input.deviceId,
            status: input.status || g.status,
            currentValue: current ?? g.currentValue,
            updatedAt: now,
          }
        : g,
    );
  } else {
    care.bodyGoals = [
      {
        id: `goal_${Date.now()}`,
        title: input.title,
        metric: input.metric,
        targetValue: input.targetValue,
        unit: input.unit,
        treatmentId: input.treatmentId,
        deviceId: input.deviceId,
        status: input.status || "active",
        currentValue: current,
        createdAt: now,
        updatedAt: now,
      },
      ...(care.bodyGoals || []),
    ];
  }
  const saved = saveCare(care);
  publishVitalsEvent({ type: "goal", at: now });
  return saved;
}

export function deleteBodyGoal(email: string, goalId: string) {
  const care = getPatientCare(email);
  care.bodyGoals = (care.bodyGoals || []).filter((g) => g.id !== goalId);
  const saved = saveCare(care);
  publishVitalsEvent({ type: "goal", at: new Date().toISOString() });
  return saved;
}

export function clearWearableReadings(email: string, kind?: WearableKind) {
  const care = getPatientCare(email);
  care.wearableReadings = kind
    ? (care.wearableReadings || []).filter((r) => r.deviceId !== kind)
    : [];
  return saveCare(care);
}

export function listLatestReadingsByDevice(email: string): Partial<Record<WearableKind, WearableReading>> {
  const readings = getPatientCare(email).wearableReadings || [];
  const out: Partial<Record<WearableKind, WearableReading>> = {};
  for (const r of readings) {
    if (!out[r.deviceId]) out[r.deviceId] = r;
  }
  return out;
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


/** Persist OEM OAuth link metadata on the care record (tokens stay in the vault). */
export function markWearableOAuthLinked(
  email: string,
  link: WearableOAuthLink,
) {
  const care = getPatientCare(email);
  const links = [...(care.oauthLinks || [])].filter((l) => l.deviceId !== link.deviceId);
  links.push(link);
  care.oauthLinks = links;
  care.wearableDevices = (care.wearableDevices || []).map((d) =>
    d.id === link.deviceId
      ? { ...d, owned: true, enabled: true, status: d.status === "disconnected" ? "paired" : d.status, syncMode: d.syncMode === "manual" ? "sync" : d.syncMode }
      : d,
  );
  pushNotification(care, {
    icon: "activity",
    title: `${link.providerId} cloud linked`,
    description: link.sandbox
      ? "Sandbox OAuth complete. Sync pulls OEM-shaped cloud readings into your dashboard."
      : "Live OEM OAuth complete. Sync pulls from the vendor cloud API.",
  });
  const saved = saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: link.deviceId, at: new Date().toISOString() });
  return saved;
}

/** Sync via OEM cloud when linked; otherwise fall back to local simulator. */
export async function syncWearableDeviceFromCloud(email: string, deviceId: WearableKind) {
  const { hasOemCloudLink, syncOemCloud } = await import("@/connectors");
  if (!hasOemCloudLink(email, deviceId)) {
    return syncWearableDevice(email, deviceId);
  }
  const care = getPatientCare(email);
  const device = (care.wearableDevices || []).find((d) => d.id === deviceId);
  if (!device) return care;

  care.wearableDevices = (care.wearableDevices || []).map((d) =>
    d.id === deviceId
      ? { ...d, status: "syncing", lastSyncedAt: new Date().toISOString(), syncMode: d.syncMode === "manual" ? "sync" : d.syncMode }
      : d,
  );
  saveCare(care);

  const { readings, liveApi, providerName } = await syncOemCloud(email, deviceId);
  const next = getPatientCare(email);
  next.wearableReadings = [...readings, ...(next.wearableReadings || [])].slice(0, READINGS_CAP);
  next.wearableDevices = (next.wearableDevices || []).map((d) =>
    d.id === deviceId
      ? { ...d, status: d.syncMode === "continuous" ? "monitoring" : "paired", lastSyncedAt: new Date().toISOString() }
      : d,
  );
  next.oauthLinks = (next.oauthLinks || []).map((l) =>
    l.deviceId === deviceId ? { ...l, lastSyncAt: new Date().toISOString(), status: "connected" } : l,
  );
  for (const r of readings) applyReadingToBodyProfile(next, r);
  const sample = readings[0];
  pushNotification(next, {
    icon: "activity",
    title: `${providerName} cloud sync`,
    description: sample
      ? `${sample.metric}: ${formatReadingValue(sample)} · ${liveApi ? "live OEM API" : "sandbox cloud"}`
      : "No new readings.",
  });
  const saved = saveCare(next);
  if (sample) publishVitalsEvent({ type: "reading", deviceId, readingId: sample.id, at: sample.recordedAt });
  return saved;
}

/**
 * Clinician Review Queue: Fetch all pending clinical intake cases across accounts.
 */
export function getClinicalCasesForReview(userEmail?: string): ClinicalCase[] {
  const store = readAll();
  const cases: ClinicalCase[] = [];

  // If user is a master email / clinician, aggregate across all stored accounts
  const isClinician = isMasterEmail(userEmail);
  
  if (isClinician) {
    for (const email of Object.keys(store)) {
      const record = store[email];
      if (record?.clinicalCases?.length) {
        cases.push(...record.clinicalCases);
      }
    }
  } else if (userEmail) {
    const key = emailKey(userEmail);
    const record = store[key];
    if (record?.clinicalCases?.length) {
      cases.push(...record.clinicalCases);
    }
  }

  return cases.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Clinician Action: Approve patient intake case, trigger prescription dispatch, and schedule TN next-day delivery.
 */
export async function approveClinicalCase(
  caseId: string,
  reviewerEmail: string = "clinician@sprymd.ai"
): Promise<{ success: boolean; trackingNumber?: string; message: string }> {
  const store = readAll();
  let targetEmail: string | null = null;
  let targetCase: ClinicalCase | null = null;

  for (const [email, record] of Object.entries(store)) {
    const c = record.clinicalCases?.find((item) => item.id === caseId);
    if (c) {
      targetEmail = email;
      targetCase = c;
      break;
    }
  }

  if (!targetEmail || !targetCase) {
    return { success: false, message: "Clinical case not found." };
  }

  const care = getPatientCare(targetEmail);
  const now = new Date();
  
  // 1. Update case status
  care.clinicalCases = (care.clinicalCases || []).map((c) =>
    c.id === caseId
      ? { ...c, status: "approved" as const, reviewedAt: now.toISOString() }
      : c
  );

  // 2. Activate treatment
  const treatment = care.treatments.find((t) => t.id === targetCase?.treatmentId || t.medicationName === targetCase?.planName);
  if (treatment) {
    treatment.status = "active";
    treatment.refillsRemaining = 3;
    treatment.startDate = now.toISOString().slice(0, 10);
    const refillThru = new Date(now);
    refillThru.setDate(refillThru.getDate() + 90);
    treatment.refillThroughDate = refillThru.toISOString().slice(0, 10);
    treatment.dosingInstructions = `Clinician authorized: Take as directed by your physician. Compounded by Empower Pharmacy. Next refill eligible in 28 days.`;
  }

  // 3. Dispatch to pharmacy API queue (Next-Business-Day TN fulfillment)
  const pharmacyDispatch = await dispatchPrescriptionToPharmacy({
    patientEmail: targetEmail,
    medicationName: targetCase.planName || treatment?.medicationName || "Prescription Protocol",
    dosage: treatment?.dosage,
    treatmentId: targetCase.treatmentId,
  });

  // 4. Update shipment with pharmacy tracking
  const shipment = care.shipments.find((s) => s.treatmentId === targetCase?.treatmentId || s.medicationName === targetCase?.planName);
  if (shipment) {
    shipment.status = "processing";
    shipment.nextShipmentDate = pharmacyDispatch.estimatedDelivery;
  } else {
    care.shipments.unshift({
      id: `shp_${Date.now()}`,
      treatmentId: targetCase.treatmentId || `tx_${Date.now()}`,
      medicationName: targetCase.planName || "Prescription Protocol",
      nextShipmentDate: pharmacyDispatch.estimatedDelivery,
      status: "processing",
      quantity: 1,
    });
  }

  // 5. Update transaction status to Paid/Active
  care.transactions = (care.transactions || []).map((txn) =>
    txn.status === "Pending review" ? { ...txn, status: "Paid / In Fulfillment" } : txn
  );

  // 6. Push notifications and secure message
  pushNotification(care, {
    icon: "pill",
    title: "Prescription Approved by Clinician",
    description: `Your protocol for ${targetCase.planName || "treatment"} was approved and transmitted to Empower Pharmacy. Carrier: ${pharmacyDispatch.carrier}. Estimated delivery: ${pharmacyDispatch.estimatedDelivery}.`,
  });

  care.messages.unshift({
    id: `msg_approved_${Date.now()}`,
    subject: `Treatment Plan Authorized · ${targetCase.planName || "Protocol"}`,
    preview: `Dr. SpryMD has reviewed your health questionnaire and authorized your protocol. Your shipment is scheduled for ${pharmacyDispatch.estimatedDelivery}. Message here with any titration questions.`,
    updatedAt: now.toISOString(),
    status: "no_action",
  });

  saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: "care", at: now.toISOString() });

  // Sync to backend DB
  await syncTreatmentApprovalToDatabase({
    caseId,
    treatmentName: targetCase.planName || "Protocol",
    status: "approved",
    reviewerEmail,
  });

  return {
    success: true,
    trackingNumber: pharmacyDispatch.trackingNumber,
    message: `Case approved. Prescription dispatched to Empower Pharmacy queue for Tennessee delivery on ${pharmacyDispatch.estimatedDelivery}.`,
  };
}

/**
 * Clinician Action: Request additional health information or labs from patient.
 */
export async function requestMoreInfoClinicalCase(
  caseId: string,
  question: string,
  reviewerEmail: string = "clinician@sprymd.ai"
): Promise<{ success: boolean; message: string }> {
  const store = readAll();
  let targetEmail: string | null = null;
  let targetCase: ClinicalCase | null = null;

  for (const [email, record] of Object.entries(store)) {
    const c = record.clinicalCases?.find((item) => item.id === caseId);
    if (c) {
      targetEmail = email;
      targetCase = c;
      break;
    }
  }

  if (!targetEmail || !targetCase) {
    return { success: false, message: "Clinical case not found." };
  }

  const care = getPatientCare(targetEmail);
  const now = new Date();

  care.clinicalCases = (care.clinicalCases || []).map((c) =>
    c.id === caseId ? { ...c, status: "needs_info" as const } : c
  );

  care.messages.unshift({
    id: `msg_info_${Date.now()}`,
    subject: `Clinician Question · ${targetCase.planName || "Care Protocol"}`,
    preview: question || "Your clinician requires clarification regarding your medical intake before authorizing your prescription.",
    updatedAt: now.toISOString(),
    status: "action_required",
  });

  pushNotification(care, {
    icon: "activity",
    title: "Clinician clarification needed",
    description: "Your physician sent a secure message regarding your recent intake questionnaire.",
  });

  saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: "care", at: now.toISOString() });

  await syncTreatmentApprovalToDatabase({
    caseId,
    treatmentName: targetCase.planName || "Protocol",
    status: "needs_info",
    reviewerEmail,
  });

  return { success: true, message: "Follow-up message sent to patient." };
}

/**
 * Clinician Action: Decline treatment and issue full refund.
 */
export async function denyClinicalCase(
  caseId: string,
  reason: string,
  reviewerEmail: string = "clinician@sprymd.ai"
): Promise<{ success: boolean; message: string }> {
  const store = readAll();
  let targetEmail: string | null = null;
  let targetCase: ClinicalCase | null = null;

  for (const [email, record] of Object.entries(store)) {
    const c = record.clinicalCases?.find((item) => item.id === caseId);
    if (c) {
      targetEmail = email;
      targetCase = c;
      break;
    }
  }

  if (!targetEmail || !targetCase) {
    return { success: false, message: "Clinical case not found." };
  }

  const care = getPatientCare(targetEmail);
  const now = new Date();

  care.clinicalCases = (care.clinicalCases || []).map((c) =>
    c.id === caseId
      ? { ...c, status: "denied" as const, reviewedAt: now.toISOString() }
      : c
  );

  const treatment = care.treatments.find((t) => t.id === targetCase?.treatmentId || t.medicationName === targetCase?.planName);
  if (treatment) {
    treatment.status = "inactive";
    treatment.howItWorks = `Declined by clinician: ${reason || "Contraindication detected"}. Full refund processed.`;
  }

  care.transactions.unshift({
    id: `txn_refund_${Date.now()}`,
    date: now.toISOString().slice(0, 10),
    product: `Full Refund · ${targetCase.planName || "Care Protocol"}`,
    quantity: 1,
    amount: 0,
    status: "Refunded in full",
  });

  pushNotification(care, {
    icon: "shield",
    title: "Intake Review Complete (Refund Processed)",
    description: `A clinician reviewed your case. Because treatment was not clinically appropriate, your card was not charged and a full refund was issued.`,
  });

  care.messages.unshift({
    id: `msg_denied_${Date.now()}`,
    subject: `Clinical Assessment Summary · ${targetCase.planName || "Care Protocol"}`,
    preview: `After evaluating your medical questionnaire, our physician determined that this protocol is not clinically appropriate for you at this time (${reason || "safety contraindication"}). You have not been charged.`,
    updatedAt: now.toISOString(),
    status: "no_action",
  });

  saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: "care", at: now.toISOString() });

  await syncTreatmentApprovalToDatabase({
    caseId,
    treatmentName: targetCase.planName || "Protocol",
    status: "denied",
    reviewerEmail,
  });

  return { success: true, message: "Case declined and full refund recorded." };
}

/**
 * Send secure message from patient to assigned Tennessee clinician.
 */
export function sendPatientCareMessage(
  email: string,
  subject: string,
  body: string
): MessageThread {
  const care = getPatientCare(email);
  const now = new Date();
  const threadId = `msg_${Date.now()}`;

  const newThread: MessageThread = {
    id: threadId,
    subject: subject.trim() || "Patient Inquiry",
    preview: body.trim(),
    updatedAt: now.toISOString(),
    status: "no_action",
  };

  care.messages.unshift(newThread);

  logPhiAccess({
    actorId: email,
    actorRole: "patient",
    actorEmail: email,
    action: "message_physician",
    patientId: email,
    resourceType: "message",
    resourceId: threadId,
    metadata: { subject },
  });

  pushNotification(care, {
    icon: "activity",
    title: "Message Transmitted to Care Team",
    description: `Your message "${subject}" was securely delivered to your physician. Expected response within 24 hours.`,
  });

  saveCare(care);
  publishVitalsEvent({ type: "device", deviceId: "care", at: now.toISOString() });
  return newThread;
}



/** Patient account dashboard data shapes */

export type TreatmentStatus = "active" | "pending" | "expiring_soon" | "inactive";

export interface Treatment {
  id: string;
  medicationName: string;
  dosage: string;
  goal: string;
  startDate: string;
  refillThroughDate: string;
  status: TreatmentStatus;
  refillsRemaining: number;
  category: string;
  /** Detail-page content */
  dosingInstructions?: string;
  storage?: string;
  howItWorks?: string;
  sideEffects?: { effect: string; mitigation: string }[];
  troubleshooting?: string;
  warnings?: string;
}

export interface NotificationItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  dismissed: boolean;
}

export type ShipmentStatus = "scheduled" | "processing" | "shipped" | "delivered";

export interface Shipment {
  id: string;
  treatmentId: string;
  medicationName: string;
  nextShipmentDate: string | null;
  status: ShipmentStatus;
  quantity?: number;
}

export interface Subscription {
  id: string;
  treatmentId: string;
  price: number;
  billingCadence: string;
  nextChargeDate: string;
  autoshipEnabled: boolean;
}

export type MessageThreadStatus = "no_action" | "action_required";

export interface MessageThread {
  id: string;
  subject: string;
  preview: string;
  updatedAt: string;
  status: MessageThreadStatus;
}

export interface Transaction {
  id: string;
  date: string;
  product: string;
  quantity: number;
  amount: number;
  status: string;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
}

export interface SupportTopic {
  id: string;
  title: string;
  description: string;
}

export type WearableKind =
  | "bp_monitor"
  | "pulse_oximeter"
  | "smart_scale"
  | "cpap"
  | "sleep_tracker"
  | "oura_ring"
  | "whoop_band"
  | "apple_watch"
  | "garmin_watch"
  | "cgm";

export type WearableSyncMode = "manual" | "sync" | "continuous";

export type WearableConnectionStatus = "disconnected" | "paired" | "syncing" | "monitoring";

export interface WearableDevice {
  id: WearableKind;
  name: string;
  brand: string;
  kind: WearableKind;
  metrics: string[];
  imageKey: string;
  syncMode: WearableSyncMode;
  status: WearableConnectionStatus;
  lastSyncedAt: string | null;
  enabled: boolean;
  /** Purchase-gated — unlocked via marketplace checkout */
  owned: boolean;
  marketplaceProductId?: string;
  priceUsd?: number;
  tier?: "clinical" | "recovery" | "metabolic" | "sleep";
}

export interface WearableReading {
  id: string;
  deviceId: WearableKind;
  metric: string;
  value: number;
  unit: string;
  secondaryValue?: number;
  secondaryUnit?: string;
  note?: string;
  source: "upload" | "manual" | "sync" | "continuous";
  recordedAt: string;
  createdAt: string;
}

export interface BodyProfile {
  heightCm: number | null;
  weightLb: number | null;
  targetWeightLb: number | null;
  updatedAt: string;
}

export type BodyGoalMetric =
  | "weight"
  | "bmi"
  | "bp_sys"
  | "spo2"
  | "sleep_score"
  | "glucose"
  | "hr"
  | "custom";

export interface BodyGoal {
  id: string;
  title: string;
  metric: BodyGoalMetric;
  targetValue: number;
  unit: string;
  currentValue?: number;
  treatmentId?: string;
  deviceId?: WearableKind;
  status: "active" | "achieved" | "paused";
  createdAt: string;
  updatedAt: string;
}

export type DashboardLayoutPreset = "care_simple" | "clinical_terminal" | "device_ops";

export interface DashboardData {
  user: DashboardUser;
  treatments: Treatment[];
  notifications: NotificationItem[];
  shipments: Shipment[];
  subscriptions: Subscription[];
  messages: MessageThread[];
  transactions: Transaction[];
  supportTopics: SupportTopic[];
  wearableDevices: WearableDevice[];
  wearableReadings: WearableReading[];
  bodyProfile: BodyProfile;
  bodyGoals: BodyGoal[];
}

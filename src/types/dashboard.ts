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

export interface DashboardData {
  user: DashboardUser;
  treatments: Treatment[];
  notifications: NotificationItem[];
  shipments: Shipment[];
  subscriptions: Subscription[];
  messages: MessageThread[];
  transactions: Transaction[];
  supportTopics: SupportTopic[];
}

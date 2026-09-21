/**
 * TypeScript interfaces for the SpryMD cash-pay clinical tables.
 * Column names match supabase/migrations/20260921_telehealth_clinical.sql
 * and 20260921_intake_and_visits.sql.
 */

export type AppointmentStatus =
  | "scheduled"
  | "awaiting_payment"
  | "paid"
  | "completed"
  | "cancelled"
  | "no_show";

export type NoteStatus = "draft" | "signed";

export type IntakeStatus = "draft" | "submitted";

export type AllergyStatus = "unknown" | "none" | "has_allergies";

export type VisitRole = "patient" | "provider";

export interface Patient {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  date_of_birth: string | null;
  phone: string | null;
  state_of_residence: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  npi: string | null;
  license_states: string[];
  specialty: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderPatientAssignment {
  id: string;
  provider_id: string;
  patient_id: string;
  active: boolean;
  assigned_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string | null;
  service_tier: string;
  amount_cents: number;
  currency: string;
  status: AppointmentStatus;
  scheduled_at: string | null;
  paid_at: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultationNote {
  id: string;
  appointment_id: string;
  patient_id: string;
  provider_id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  private_to_provider: boolean;
  status: NoteStatus;
  created_at: string;
  updated_at: string;
}

export interface PatientIntake {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  chief_complaints: string[];
  chief_complaint_detail: string;
  past_medical_history: string[];
  past_medical_history_notes: string;
  allergy_status: AllergyStatus;
  allergy_disclosure: string;
  answers: Record<string, string | string[]>;
  status: IntakeStatus;
  created_at: string;
  updated_at: string;
}

export interface VisitSession {
  id: string;
  appointment_id: string;
  patient_joined_at: string | null;
  provider_joined_at: string | null;
  both_joined_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  video_vendor: string;
  created_at: string;
  updated_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          date_of_birth: string | null
          phone: string | null
          state_of_residence: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string
          date_of_birth?: string | null
          phone?: string | null
          state_of_residence?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          date_of_birth?: string | null
          phone?: string | null
          state_of_residence?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          npi: string | null
          license_states: string[]
          specialty: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string
          npi?: string | null
          license_states?: string[]
          specialty?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          npi?: string | null
          license_states?: string[]
          specialty?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_patient_assignments: {
        Row: {
          id: string
          provider_id: string
          patient_id: string
          active: boolean
          assigned_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          patient_id: string
          active?: boolean
          assigned_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          patient_id?: string
          active?: boolean
          assigned_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          provider_id: string | null
          service_tier: string
          amount_cents: number
          currency: string
          status: string
          scheduled_at: string | null
          paid_at: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          provider_id?: string | null
          service_tier: string
          amount_cents: number
          currency?: string
          status?: string
          scheduled_at?: string | null
          paid_at?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          provider_id?: string | null
          service_tier?: string
          amount_cents?: number
          currency?: string
          status?: string
          scheduled_at?: string | null
          paid_at?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultation_notes: {
        Row: {
          id: string
          appointment_id: string
          patient_id: string
          provider_id: string
          subjective: string | null
          objective: string | null
          assessment: string | null
          plan: string | null
          private_to_provider: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          patient_id: string
          provider_id: string
          subjective?: string | null
          objective?: string | null
          assessment?: string | null
          plan?: string | null
          private_to_provider?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          patient_id?: string
          provider_id?: string
          subjective?: string | null
          objective?: string | null
          assessment?: string | null
          plan?: string | null
          private_to_provider?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_intakes: {
        Row: {
          id: string
          patient_id: string
          appointment_id: string | null
          chief_complaints: string[]
          chief_complaint_detail: string
          past_medical_history: string[]
          past_medical_history_notes: string
          allergy_status: string
          allergy_disclosure: string
          answers: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          appointment_id?: string | null
          chief_complaints?: string[]
          chief_complaint_detail?: string
          past_medical_history?: string[]
          past_medical_history_notes?: string
          allergy_status?: string
          allergy_disclosure?: string
          answers?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          appointment_id?: string | null
          chief_complaints?: string[]
          chief_complaint_detail?: string
          past_medical_history?: string[]
          past_medical_history_notes?: string
          allergy_status?: string
          allergy_disclosure?: string
          answers?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      visit_sessions: {
        Row: {
          id: string
          appointment_id: string
          patient_joined_at: string | null
          provider_joined_at: string | null
          both_joined_at: string | null
          ended_at: string | null
          duration_seconds: number
          video_vendor: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          patient_joined_at?: string | null
          provider_joined_at?: string | null
          both_joined_at?: string | null
          ended_at?: string | null
          duration_seconds?: number
          video_vendor?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          patient_joined_at?: string | null
          provider_joined_at?: string | null
          both_joined_at?: string | null
          ended_at?: string | null
          duration_seconds?: number
          video_vendor?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

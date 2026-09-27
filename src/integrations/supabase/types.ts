export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          amount_cents: number
          condition_id: string | null
          created_at: string
          currency: string
          id: string
          med_amount_cents: number | null
          med_name: string | null
          meds_billing_mode: string | null
          meds_paid_at: string | null
          paid_at: string | null
          patient_id: string
          pharmacy_notes: string | null
          pharmacy_sent_at: string | null
          pharmacy_status: string | null
          provider_id: string | null
          reminder_due_at: string | null
          reminder_sent_at: string | null
          scheduled_at: string | null
          service_tier: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_meds_checkout_session_id: string | null
          stripe_meds_payment_intent_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          treatment_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          condition_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          med_amount_cents?: number | null
          med_name?: string | null
          meds_billing_mode?: string | null
          meds_paid_at?: string | null
          paid_at?: string | null
          patient_id: string
          pharmacy_notes?: string | null
          pharmacy_sent_at?: string | null
          pharmacy_status?: string | null
          provider_id?: string | null
          reminder_due_at?: string | null
          reminder_sent_at?: string | null
          scheduled_at?: string | null
          service_tier: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_meds_checkout_session_id?: string | null
          stripe_meds_payment_intent_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          treatment_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          condition_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          med_amount_cents?: number | null
          med_name?: string | null
          meds_billing_mode?: string | null
          meds_paid_at?: string | null
          paid_at?: string | null
          patient_id?: string
          pharmacy_notes?: string | null
          pharmacy_sent_at?: string | null
          pharmacy_status?: string | null
          provider_id?: string | null
          reminder_due_at?: string | null
          reminder_sent_at?: string | null
          scheduled_at?: string | null
          service_tier?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_meds_checkout_session_id?: string | null
          stripe_meds_payment_intent_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          treatment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      care_body_goals: {
        Row: {
          created_at: string
          current_value: number | null
          id: string
          metric: string
          patient_id: string
          status: string
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          id?: string
          metric: string
          patient_id: string
          status?: string
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          id?: string
          metric?: string
          patient_id?: string
          status?: string
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_body_goals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_body_profiles: {
        Row: {
          height_cm: number | null
          patient_id: string
          target_weight_lb: number | null
          updated_at: string
          weight_lb: number | null
        }
        Insert: {
          height_cm?: number | null
          patient_id: string
          target_weight_lb?: number | null
          updated_at?: string
          weight_lb?: number | null
        }
        Update: {
          height_cm?: number | null
          patient_id?: string
          target_weight_lb?: number | null
          updated_at?: string
          weight_lb?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "care_body_profiles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_clinical_cases: {
        Row: {
          condition_id: string | null
          created_at: string
          id: string
          intake: Json
          patient_email: string
          patient_id: string
          plan_name: string | null
          reviewed_at: string | null
          status: string
          treatment_id: string | null
        }
        Insert: {
          condition_id?: string | null
          created_at?: string
          id?: string
          intake?: Json
          patient_email?: string
          patient_id: string
          plan_name?: string | null
          reviewed_at?: string | null
          status?: string
          treatment_id?: string | null
        }
        Update: {
          condition_id?: string | null
          created_at?: string
          id?: string
          intake?: Json
          patient_email?: string
          patient_id?: string
          plan_name?: string | null
          reviewed_at?: string | null
          status?: string
          treatment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_clinical_cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_clinical_cases_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "care_treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      care_notifications: {
        Row: {
          created_at: string
          description: string
          dismissed: boolean
          icon: string
          id: string
          patient_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          dismissed?: boolean
          icon?: string
          id?: string
          patient_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          dismissed?: boolean
          icon?: string
          id?: string
          patient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_orders: {
        Row: {
          created_at: string
          id: string
          label: string
          mode: string
          patient_id: string
          status: string
          total: number
          treatment_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          mode: string
          patient_id: string
          status?: string
          total?: number
          treatment_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          mode?: string
          patient_id?: string
          status?: string
          total?: number
          treatment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_orders_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "care_treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      care_patient_preferences: {
        Row: {
          dashboard_layout: Json
          oauth_links: Json
          patient_id: string
          updated_at: string
        }
        Insert: {
          dashboard_layout?: Json
          oauth_links?: Json
          patient_id: string
          updated_at?: string
        }
        Update: {
          dashboard_layout?: Json
          oauth_links?: Json
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_patient_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_shipments: {
        Row: {
          created_at: string
          id: string
          medication_name: string
          next_shipment_date: string | null
          patient_id: string
          quantity: number
          status: string
          treatment_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          medication_name: string
          next_shipment_date?: string | null
          patient_id: string
          quantity?: number
          status?: string
          treatment_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          medication_name?: string
          next_shipment_date?: string | null
          patient_id?: string
          quantity?: number
          status?: string
          treatment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_shipments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_shipments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "care_treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      care_subscriptions: {
        Row: {
          autoship_enabled: boolean
          billing_cadence: string
          created_at: string
          id: string
          next_charge_date: string | null
          patient_id: string
          price: number
          treatment_id: string | null
        }
        Insert: {
          autoship_enabled?: boolean
          billing_cadence?: string
          created_at?: string
          id?: string
          next_charge_date?: string | null
          patient_id: string
          price: number
          treatment_id?: string | null
        }
        Update: {
          autoship_enabled?: boolean
          billing_cadence?: string
          created_at?: string
          id?: string
          next_charge_date?: string | null
          patient_id?: string
          price?: number
          treatment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_subscriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_subscriptions_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "care_treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      care_treatments: {
        Row: {
          category: string
          created_at: string
          dosage: string
          dosing_instructions: string | null
          goal: string
          how_it_works: string | null
          id: string
          medication_name: string
          patient_id: string
          refill_through_date: string | null
          refills_remaining: number
          side_effects: Json
          start_date: string
          status: string
          storage: string | null
          troubleshooting: string | null
          warnings: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          dosage?: string
          dosing_instructions?: string | null
          goal?: string
          how_it_works?: string | null
          id?: string
          medication_name: string
          patient_id: string
          refill_through_date?: string | null
          refills_remaining?: number
          side_effects?: Json
          start_date?: string
          status?: string
          storage?: string | null
          troubleshooting?: string | null
          warnings?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          dosage?: string
          dosing_instructions?: string | null
          goal?: string
          how_it_works?: string | null
          id?: string
          medication_name?: string
          patient_id?: string
          refill_through_date?: string | null
          refills_remaining?: number
          side_effects?: Json
          start_date?: string
          status?: string
          storage?: string | null
          troubleshooting?: string | null
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_wearable_devices: {
        Row: {
          id: string
          patient_id: string
          payload: Json
          updated_at: string
        }
        Insert: {
          id: string
          patient_id: string
          payload?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_wearable_devices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_wearable_readings: {
        Row: {
          device_id: string
          id: string
          metric: string
          patient_id: string
          payload: Json
          recorded_at: string
          unit: string | null
          value: number | null
        }
        Insert: {
          device_id: string
          id?: string
          metric: string
          patient_id: string
          payload?: Json
          recorded_at?: string
          unit?: string | null
          value?: number | null
        }
        Update: {
          device_id?: string
          id?: string
          metric?: string
          patient_id?: string
          payload?: Json
          recorded_at?: string
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "care_wearable_readings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_notes: {
        Row: {
          appointment_id: string
          assessment: string | null
          created_at: string
          id: string
          objective: string | null
          patient_id: string
          plan: string | null
          private_to_provider: boolean
          provider_id: string
          status: string
          subjective: string | null
          updated_at: string
        }
        Insert: {
          appointment_id: string
          assessment?: string | null
          created_at?: string
          id?: string
          objective?: string | null
          patient_id: string
          plan?: string | null
          private_to_provider?: boolean
          provider_id: string
          status?: string
          subjective?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          assessment?: string | null
          created_at?: string
          id?: string
          objective?: string | null
          patient_id?: string
          plan?: string | null
          private_to_provider?: boolean
          provider_id?: string
          status?: string
          subjective?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_notes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          patient_unread: boolean
          preview: string
          provider_id: string | null
          staff_unread: boolean
          status: string
          subject: string
          updated_at: string
          urgency: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          patient_unread?: boolean
          preview?: string
          provider_id?: string | null
          staff_unread?: boolean
          status?: string
          subject: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          patient_unread?: boolean
          preview?: string
          provider_id?: string | null
          staff_unread?: boolean
          status?: string
          subject?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_role: string
          sender_user_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_role: string
          sender_user_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_role?: string
          sender_user_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_intakes: {
        Row: {
          allergy_disclosure: string
          allergy_status: string
          answers: Json
          appointment_id: string | null
          chief_complaint_detail: string
          chief_complaints: string[]
          created_at: string
          id: string
          past_medical_history: string[]
          past_medical_history_notes: string
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          allergy_disclosure?: string
          allergy_status?: string
          answers?: Json
          appointment_id?: string | null
          chief_complaint_detail?: string
          chief_complaints?: string[]
          created_at?: string
          id?: string
          past_medical_history?: string[]
          past_medical_history_notes?: string
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          allergy_disclosure?: string
          allergy_status?: string
          answers?: Json
          appointment_id?: string | null
          chief_complaint_detail?: string
          chief_complaints?: string[]
          created_at?: string
          id?: string
          past_medical_history?: string[]
          past_medical_history_notes?: string
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_intakes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_intakes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          state_of_residence: string | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string
          id?: string
          phone?: string | null
          state_of_residence?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          state_of_residence?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount_cents: number | null
          appointment_id: string | null
          created_at: string
          currency: string
          event_type: string
          id: string
          patient_id: string | null
          payload: Json
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_event_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          appointment_id?: string | null
          created_at?: string
          currency?: string
          event_type: string
          id?: string
          patient_id?: string | null
          payload?: Json
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          appointment_id?: string | null
          created_at?: string
          currency?: string
          event_type?: string
          id?: string
          patient_id?: string | null
          payload?: Json
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_patient_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          id: string
          patient_id: string
          provider_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          id?: string
          patient_id: string
          provider_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          id?: string
          patient_id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_patient_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_patient_assignments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          active: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          license_states: string[]
          npi: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          full_name?: string
          id?: string
          license_states?: string[]
          npi?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          license_states?: string[]
          npi?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      refill_orders: {
        Row: {
          condition_id: string | null
          created_at: string
          currency: string
          fulfilled_at: string | null
          id: string
          med_amount_cents: number
          med_name: string
          paid_at: string | null
          patient_id: string
          patient_note: string | null
          pharmacy_released_at: string | null
          pharmacy_released_by: string | null
          source_appointment_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          treatment_id: string | null
          updated_at: string
        }
        Insert: {
          condition_id?: string | null
          created_at?: string
          currency?: string
          fulfilled_at?: string | null
          id?: string
          med_amount_cents: number
          med_name: string
          paid_at?: string | null
          patient_id: string
          patient_note?: string | null
          pharmacy_released_at?: string | null
          pharmacy_released_by?: string | null
          source_appointment_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          treatment_id?: string | null
          updated_at?: string
        }
        Update: {
          condition_id?: string | null
          created_at?: string
          currency?: string
          fulfilled_at?: string | null
          id?: string
          med_amount_cents?: number
          med_name?: string
          paid_at?: string | null
          patient_id?: string
          patient_note?: string | null
          pharmacy_released_at?: string | null
          pharmacy_released_by?: string | null
          source_appointment_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          treatment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refill_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refill_orders_pharmacy_released_by_fkey"
            columns: ["pharmacy_released_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refill_orders_source_appointment_id_fkey"
            columns: ["source_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_provider_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_provider_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_provider_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_messages_sender_provider_id_fkey"
            columns: ["sender_provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "staff_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_threads: {
        Row: {
          created_at: string
          created_by_provider_id: string
          id: string
          preview: string
          recipient_provider_id: string | null
          status: string
          subject: string
          updated_at: string
          urgency: string
        }
        Insert: {
          created_at?: string
          created_by_provider_id: string
          id?: string
          preview?: string
          recipient_provider_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          created_at?: string
          created_by_provider_id?: string
          id?: string
          preview?: string
          recipient_provider_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_threads_created_by_provider_id_fkey"
            columns: ["created_by_provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_threads_recipient_provider_id_fkey"
            columns: ["recipient_provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_sessions: {
        Row: {
          appointment_id: string
          both_joined_at: string | null
          created_at: string
          duration_seconds: number
          ended_at: string | null
          id: string
          patient_joined_at: string | null
          provider_joined_at: string | null
          updated_at: string
          video_vendor: string
        }
        Insert: {
          appointment_id: string
          both_joined_at?: string | null
          created_at?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          patient_joined_at?: string | null
          provider_joined_at?: string | null
          updated_at?: string
          video_vendor?: string
        }
        Update: {
          appointment_id?: string
          both_joined_at?: string | null
          created_at?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          patient_joined_at?: string | null
          provider_joined_at?: string | null
          updated_at?: string
          video_vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_appointment: {
        Args: { p_appointment_id: string }
        Returns: boolean
      }
      care_is_active_provider: { Args: never; Returns: boolean }
      care_is_own_patient: { Args: { p_patient_id: string }; Returns: boolean }
      care_prune_wearable_readings: {
        Args: { p_keep?: number; p_patient_id: string }
        Returns: undefined
      }
      current_patient_id: { Args: never; Returns: string }
      current_provider_id: { Args: never; Returns: string }
      is_active_provider: { Args: never; Returns: boolean }
      is_platform_owner: { Args: never; Returns: boolean }
      provider_has_patient: { Args: { p_patient_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

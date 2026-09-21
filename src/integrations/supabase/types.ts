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
      patient_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          dob: string | null;
          phone: string;
          address: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          dob?: string | null;
          phone?: string;
          address?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          dob?: string | null;
          phone?: string;
          address?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      treatments: {
        Row: {
          id: string;
          user_id: string;
          medication_name: string;
          dosage: string;
          goal: string;
          category: string;
          start_date: string;
          refill_through_date: string | null;
          status: "active" | "pending" | "expiring_soon" | "inactive";
          refills_remaining: number;
          dosing_instructions: string | null;
          storage: string | null;
          how_it_works: string | null;
          side_effects: Json;
          troubleshooting: string | null;
          warnings: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_name: string;
          dosage?: string;
          goal?: string;
          category?: string;
          start_date?: string;
          refill_through_date?: string | null;
          status?: "active" | "pending" | "expiring_soon" | "inactive";
          refills_remaining?: number;
          dosing_instructions?: string | null;
          storage?: string | null;
          how_it_works?: string | null;
          side_effects?: Json;
          troubleshooting?: string | null;
          warnings?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_name?: string;
          dosage?: string;
          goal?: string;
          category?: string;
          start_date?: string;
          refill_through_date?: string | null;
          status?: "active" | "pending" | "expiring_soon" | "inactive";
          refills_remaining?: number;
          dosing_instructions?: string | null;
          storage?: string | null;
          how_it_works?: string | null;
          side_effects?: Json;
          troubleshooting?: string | null;
          warnings?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          treatment_id: string | null;
          label: string;
          mode: "subscription" | "cart" | "refill";
          total: number;
          status: "pending_review" | "approved" | "payment_pending" | "paid" | "fulfilled" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          treatment_id?: string | null;
          label: string;
          mode: "subscription" | "cart" | "refill";
          total?: number;
          status?: "pending_review" | "approved" | "payment_pending" | "paid" | "fulfilled" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          treatment_id?: string | null;
          label?: string;
          mode?: "subscription" | "cart" | "refill";
          total?: number;
          status?: "pending_review" | "approved" | "payment_pending" | "paid" | "fulfilled" | "cancelled";
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          treatment_id: string;
          price: number;
          billing_cadence: string;
          next_charge_date: string | null;
          autoship_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          treatment_id: string;
          price: number;
          billing_cadence?: string;
          next_charge_date?: string | null;
          autoship_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          treatment_id?: string;
          price?: number;
          billing_cadence?: string;
          next_charge_date?: string | null;
          autoship_enabled?: boolean;
          created_at?: string;
        };
      };
      shipments: {
        Row: {
          id: string;
          user_id: string;
          treatment_id: string | null;
          medication_name: string;
          next_shipment_date: string | null;
          status: "scheduled" | "processing" | "shipped" | "delivered";
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          treatment_id?: string | null;
          medication_name: string;
          next_shipment_date?: string | null;
          status?: "scheduled" | "processing" | "shipped" | "delivered";
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          treatment_id?: string | null;
          medication_name?: string;
          next_shipment_date?: string | null;
          status?: "scheduled" | "processing" | "shipped" | "delivered";
          quantity?: number;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          icon: string;
          title: string;
          description: string;
          dismissed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          icon?: string;
          title: string;
          description?: string;
          dismissed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          icon?: string;
          title?: string;
          description?: string;
          dismissed?: boolean;
          created_at?: string;
        };
      };
      clinical_cases: {
        Row: {
          id: string;
          user_id: string;
          treatment_id: string | null;
          condition_id: string | null;
          intake: Json;
          plan: Json;
          status: "pending_review" | "needs_info" | "approved" | "denied";
          created_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          treatment_id?: string | null;
          condition_id?: string | null;
          intake?: Json;
          plan?: Json;
          status?: "pending_review" | "needs_info" | "approved" | "denied";
          created_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          treatment_id?: string | null;
          condition_id?: string | null;
          intake?: Json;
          plan?: Json;
          status?: "pending_review" | "needs_info" | "approved" | "denied";
          created_at?: string;
          reviewed_at?: string | null;
        };
      };
      message_threads: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          preview: string;
          status: "no_action" | "action_required";
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          preview?: string;
          status?: "no_action" | "action_required";
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          preview?: string;
          status?: "no_action" | "action_required";
          updated_at?: string;
        };
      };
    };
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

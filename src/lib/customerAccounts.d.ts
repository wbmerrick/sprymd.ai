declare module "@/lib/customerAccounts" {
  export interface CustomerAddress {
    line1: string;
    city: string;
    state: string;
    zip: string;
  }

  /**
   * Loosely-typed customer record persisted in localStorage. Protocols, orders
   * and rx entries are legacy shapes migrated by `patientCareStore`, so they
   * stay as open records rather than strict interfaces.
   */
  export interface CustomerProfile {
    id: string;
    email: string;
    name: string;
    dob: string;
    phone: string;
    address: CustomerAddress;
    memberSince: string;
    createdAt: string;
    authProvider: string;
    protocols: Record<string, unknown>[];
    orders: Record<string, unknown>[];
    rxHistory: Record<string, unknown>[];
    passwordHash?: string;
    updatedAt?: string;
    [key: string]: unknown;
  }

  export type CustomerProfilePatch = Partial<Omit<CustomerProfile, "address">> & {
    address?: Partial<CustomerAddress> | Record<string, string>;
    user_metadata?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export interface CustomerCredentials {
    email: string;
    password: string;
    name?: string;
    dob?: string;
  }

  export interface CustomerAuthResult {
    profile: CustomerProfile;
    provider: "supabase" | "local";
    needsEmailConfirm?: boolean;
  }

  export function getStoredAccount(email: string): CustomerProfile | null;
  export function upsertStoredAccount(account: CustomerProfilePatch & { email: string }): CustomerProfile | null;
  export function setSessionEmail(email: string): void;
  export function getSessionEmail(): string | null;
  export function clearSession(): void;
  export function buildCustomerProfile(email: string, overrides?: CustomerProfilePatch): CustomerProfile;
  export function registerLocalAccount(input: CustomerCredentials): Promise<CustomerProfile>;
  export function signInLocalAccount(input: CustomerCredentials): Promise<CustomerProfile>;
  export function signUpCustomer(input: CustomerCredentials): Promise<CustomerAuthResult>;
  export function signInCustomer(input: CustomerCredentials): Promise<CustomerAuthResult>;
  export function signOutCustomer(): Promise<void>;
  export function restoreCustomerSession(): Promise<CustomerProfile | null>;
  export function updateCustomerProfile(email: string, patch: CustomerProfilePatch): CustomerProfile;
  export function addCustomerOrder(email: string, order: Record<string, unknown>): CustomerProfile;
  export function addCustomerProtocol(email: string, protocol: Record<string, unknown>): CustomerProfile;
}

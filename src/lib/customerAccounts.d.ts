declare module "@/lib/customerAccounts" {
  export function getStoredAccount(email: string): any;
  export function upsertStoredAccount(account: any): any;
  export function setSessionEmail(email: string): void;
  export function getSessionEmail(): string | null;
  export function clearSession(): void;
  export function buildCustomerProfile(email: string, overrides?: any): any;
  export function registerLocalAccount(input: any): Promise<any>;
  export function signInLocalAccount(input: any): Promise<any>;
  export function signUpCustomer(input: any): Promise<any>;
  export function signInCustomer(input: any): Promise<any>;
  export function signOutCustomer(): Promise<void>;
  export function restoreCustomerSession(): Promise<any>;
  export function updateCustomerProfile(email: string, patch: any): any;
  export function addCustomerOrder(email: string, order: any): any;
  export function addCustomerProtocol(email: string, protocol: any): any;
}

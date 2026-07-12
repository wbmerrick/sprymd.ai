const SESSION_KEY = "sprymd_provider_session";
const DEFAULT_ACCESS_CODE = "merrick-demo";

export function isProviderAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "authenticated";
}

export function authenticateProvider(accessCode: string): boolean {
  const expected =
    import.meta.env.VITE_PROVIDER_ACCESS_CODE?.trim() || DEFAULT_ACCESS_CODE;
  if (accessCode.trim() !== expected) return false;
  sessionStorage.setItem(SESSION_KEY, "authenticated");
  return true;
}

export function signOutProvider(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

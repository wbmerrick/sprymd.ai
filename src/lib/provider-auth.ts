import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/intake/persist";

const SESSION_KEY = "sprymd_provider_session";
const IDENTITY_KEY = "sprymd_provider_identity";

export type ProviderAuthMode = "code" | "supabase" | "unconfigured";

export interface ProviderIdentity {
  name: string;
  role: "provider";
}

/**
 * Resolves how providers authenticate:
 * - "code": VITE_PROVIDER_ACCESS_CODE is set → shared access code (env only,
 *   no hardcoded fallback).
 * - "supabase": no access code but Supabase is configured → email OTP with a
 *   profiles.role === 'provider' check.
 * - "unconfigured": neither → no access.
 */
export function getProviderAuthMode(): ProviderAuthMode {
  if (import.meta.env.VITE_PROVIDER_ACCESS_CODE?.trim()) return "code";
  if (isSupabaseConfigured()) return "supabase";
  return "unconfigured";
}

export function isProviderAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "authenticated";
}

/** Code-mode sign-in. Compares against the env access code only. */
export function authenticateProvider(accessCode: string): boolean {
  if (getProviderAuthMode() !== "code") return false;
  const expected = import.meta.env.VITE_PROVIDER_ACCESS_CODE?.trim();
  if (!expected || accessCode.trim() !== expected) return false;
  sessionStorage.setItem(SESSION_KEY, "authenticated");
  return true;
}

/** Supabase-mode: send a magic link that returns to /provider. */
export async function sendProviderOtp(email: string): Promise<{ error: string | null }> {
  if (getProviderAuthMode() !== "supabase") {
    return { error: "Provider email sign-in is not configured." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/provider` },
  });

  return { error: error?.message ?? null };
}

/**
 * Supabase-mode: after the magic-link return, confirms the signed-in user has
 * profiles.role === 'provider'. On success, marks the session authenticated
 * and caches the display identity so getProviderIdentity() is synchronous.
 * Non-provider accounts are signed out and rejected with a clear error.
 */
export async function verifyProviderSession(): Promise<{ ok: boolean; error: string | null }> {
  if (getProviderAuthMode() !== "supabase") {
    return { ok: false, error: null };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    return { ok: false, error: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, error: `Could not verify provider access: ${profileError.message}` };
  }

  if (profile?.role !== "provider") {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "This account does not have provider access. Sign in with a provider account.",
    };
  }

  const name = profile.full_name?.trim() || user.email || "Provider";
  sessionStorage.setItem(SESSION_KEY, "authenticated");
  sessionStorage.setItem(IDENTITY_KEY, name);
  return { ok: true, error: null };
}

/**
 * Synchronous identity for the signed-in provider. Supabase mode returns the
 * identity cached at verification time (profile full_name, falling back to
 * the account email); code mode or a missing cache returns "Provider".
 */
export function getProviderIdentity(): ProviderIdentity {
  const cached = sessionStorage.getItem(IDENTITY_KEY);
  return { name: cached?.trim() || "Provider", role: "provider" };
}

/**
 * Clears the provider session flag and cached identity; in Supabase mode also
 * ends the Supabase session (fire-and-forget so callers stay synchronous).
 */
export function signOutProvider(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(IDENTITY_KEY);
  if (getProviderAuthMode() === "supabase") {
    void supabase.auth.signOut();
  }
}

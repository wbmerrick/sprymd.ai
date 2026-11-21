/**
 * Device-local account fallback (password hash + profile in localStorage).
 *
 * Allowed in non-production builds and when `?demo=1` is present (ops/demo
 * dress rehearsal). Production patient identity is Supabase Auth only.
 */

export type LocalAccountGateOpts = {
  /** Override production detection (tests). */
  prod?: boolean;
  /** Override `window.location.search` (tests). */
  search?: string;
};

export function isLocalAccountFallbackEnabled(
  opts: LocalAccountGateOpts = {},
): boolean {
  const prod =
    opts.prod ??
    (typeof import.meta !== "undefined" && Boolean(import.meta.env?.PROD));
  if (!prod) return true;

  const search =
    opts.search ??
    (typeof window !== "undefined" ? window.location.search : "");
  try {
    if (new URLSearchParams(search).get("demo") === "1") return true;
  } catch {
    /* ignore malformed search */
  }
  return false;
}

export function localAuthDisabledError(action = "Local account"): Error {
  const err = new Error(
    `${action} is unavailable on production. Use Sign in / Create account with SpryMD Auth (confirm email if prompted).`,
  ) as Error & { code?: string };
  err.code = "local_auth_disabled";
  return err;
}

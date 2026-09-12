/**
 * Master account emails — unlock full clinical terminal privileges.
 * Never store passwords here. Override / extend via VITE_MASTER_EMAIL
 * (comma-separated allowlist) at build time.
 */

const DEFAULT_MASTER_EMAILS = ["wbmerrick@gmail.com"] as const;

function parseEnvMasterEmails(): string[] {
  const raw = import.meta.env?.VITE_MASTER_EMAIL;
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Built-in owner allowlist plus optional VITE_MASTER_EMAIL entries. */
export const MASTER_EMAILS: readonly string[] = Object.freeze([
  ...new Set<string>([...DEFAULT_MASTER_EMAILS, ...parseEnvMasterEmails()]),
]);

export function isMasterEmail(email: string | null | undefined): boolean {
  const key = String(email || "")
    .trim()
    .toLowerCase();
  return MASTER_EMAILS.includes(key);
}

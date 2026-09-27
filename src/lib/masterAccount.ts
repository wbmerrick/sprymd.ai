/**
 * Role allowlists for SpryMD.
 * - Owner/master: command center (/master) + full clinical tools
 * - Staff: clinical workspace (/staff)
 * Never store passwords here. Extend via VITE_MASTER_EMAIL / VITE_STAFF_EMAIL.
 */

const DEFAULT_OWNER_EMAILS = [
  "wbmerrick@gmail.com",
  "wbmerrick@sprymd.ai",
] as const;

const DEFAULT_STAFF_EMAILS = ["staff@sprymd.ai"] as const;

function parseEnvList(raw: unknown): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function emailKey(email: string | null | undefined): string {
  return String(email || "")
    .trim()
    .toLowerCase();
}

/** Platform owners — financials, member ops, AI command center. */
export const OWNER_EMAILS: readonly string[] = Object.freeze([
  ...new Set<string>([
    ...DEFAULT_OWNER_EMAILS,
    ...parseEnvList(import.meta.env?.VITE_MASTER_EMAIL),
  ]),
]);

/** Clinical staff (non-owner) — patient inbox, team chat, chart review. */
export const STAFF_EMAILS: readonly string[] = Object.freeze([
  ...new Set<string>([
    ...DEFAULT_STAFF_EMAILS,
    ...parseEnvList(import.meta.env?.VITE_STAFF_EMAIL),
  ]),
]);

/** @deprecated Prefer OWNER_EMAILS — kept for existing imports. */
export const MASTER_EMAILS = OWNER_EMAILS;

export function isOwnerEmail(email: string | null | undefined): boolean {
  return OWNER_EMAILS.includes(emailKey(email));
}

/** Owner / master account (command center). */
export function isMasterEmail(email: string | null | undefined): boolean {
  return isOwnerEmail(email);
}

export function isStaffAllowlistEmail(email: string | null | undefined): boolean {
  return STAFF_EMAILS.includes(emailKey(email));
}

/** Owner or staff — clinical tools (inbox, review, team chat, provider row). */
export function isClinicianEmail(email: string | null | undefined): boolean {
  const key = emailKey(email);
  return OWNER_EMAILS.includes(key) || STAFF_EMAILS.includes(key);
}

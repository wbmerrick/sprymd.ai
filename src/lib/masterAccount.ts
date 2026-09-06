/** Master account emails — unlock full clinical terminal privileges (never store passwords here). */
export const MASTER_EMAILS = ["wbmerrick@gmail.com"] as const;

export function isMasterEmail(email: string | null | undefined): boolean {
  const key = String(email || "").trim().toLowerCase();
  return (MASTER_EMAILS as readonly string[]).includes(key);
}

export interface AuditEntry {
  id: string;
  encounter_id: string;
  action: string;
  actor: string;
  timestamp: string;
}

const AUDIT_KEY = "sprymd_audit_log";

function readAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAuditLog(entries: AuditEntry[]): void {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}

export function logAuditEvent(
  encounterId: string,
  action: string,
  actor = "Dr. Merrick",
): AuditEntry {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    encounter_id: encounterId,
    action,
    actor,
    timestamp: new Date().toISOString(),
  };

  const entries = readAuditLog();
  entries.unshift(entry);
  writeAuditLog(entries.slice(0, 500));

  return entry;
}

export function getAuditLogForEncounter(encounterId: string): AuditEntry[] {
  return readAuditLog().filter((e) => e.encounter_id === encounterId);
}

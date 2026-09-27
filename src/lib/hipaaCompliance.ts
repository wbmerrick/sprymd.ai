/**
 * Lightweight PHI access audit helper.
 * Persists to local audit trail when available; never blocks clinical flows.
 */

export interface PhiAccessEvent {
  actorId?: string;
  actorRole?: string;
  actorEmail?: string;
  action: string;
  patientId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

const AUDIT_KEY = "sprymd_phi_audit_v1";

export function logPhiAccess(event: PhiAccessEvent): void {
  try {
    if (typeof localStorage === "undefined") return;
    const prev = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
    const next = Array.isArray(prev) ? prev : [];
    next.push({ ...event, at: new Date().toISOString() });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(next.slice(-200)));
  } catch {
    /* ignore audit persistence failures */
  }
}

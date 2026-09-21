import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { isSupabaseConfigured } from "@/lib/intake/persist";

export interface AuditEntry {
  id: string;
  encounter_id: string;
  action: string;
  actor: string;
  actor_role?: string | null;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
}

export interface LogAuditEventOptions {
  actor?: string;
  actorRole?: string;
  metadata?: Record<string, unknown>;
}

const AUDIT_KEY = "sprymd_audit_log";
const MAX_LOCAL_ENTRIES = 500;

function readAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAuditLog(entries: AuditEntry[]): void {
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
  } catch {
    // ignore storage failures in private browsing
  }
}

/**
 * Records an audit event. Always appends to the local trail (newest first,
 * capped at 500 entries); when Supabase is configured, also fires an insert
 * into audit_events without awaiting it, so callers stay synchronous.
 */
export function logAuditEvent(
  encounterId: string,
  action: string,
  options: LogAuditEventOptions = {},
): AuditEntry {
  const actor = options.actor ?? "system";

  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    encounter_id: encounterId,
    action,
    actor,
    actor_role: options.actorRole ?? null,
    metadata: options.metadata ?? null,
    timestamp: new Date().toISOString(),
  };

  const entries = readAuditLog();
  entries.unshift(entry);
  writeAuditLog(entries.slice(0, MAX_LOCAL_ENTRIES));

  if (isSupabaseConfigured()) {
    // Fire-and-forget: audit persistence must never block or fail the caller.
    void supabase
      .from("audit_events")
      .insert({
        actor,
        actor_role: options.actorRole ?? null,
        action,
        // Local ids like "enc-demo-001" aren't uuids; empty strings would be
        // rejected outright, so coerce falsy ids to null.
        encounter_id: encounterId || null,
        metadata: (options.metadata as Json | undefined) ?? null,
      })
      .then(({ error }) => {
        if (error) {
          console.warn("[audit] Supabase insert failed:", error.message);
        }
      });
  }

  return entry;
}

/** Synchronous read of the local audit trail (used by CaseDetail). */
export function getAuditLogForEncounter(encounterId: string): AuditEntry[] {
  return readAuditLog().filter((e) => e.encounter_id === encounterId);
}

/**
 * Async read that prefers the Supabase audit_events table (provider-only via
 * RLS) and falls back to the local trail when unconfigured or on error.
 */
export async function fetchAuditLogForEncounter(encounterId: string): Promise<AuditEntry[]> {
  if (!isSupabaseConfigured()) {
    return getAuditLogForEncounter(encounterId);
  }

  const { data, error } = await supabase
    .from("audit_events")
    .select("*")
    .eq("encounter_id", encounterId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[audit] Supabase fetch failed, using local trail:", error.message);
    return getAuditLogForEncounter(encounterId);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    encounter_id: row.encounter_id ?? "",
    action: row.action,
    actor: row.actor,
    actor_role: row.actor_role,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    timestamp: row.created_at,
  }));
}

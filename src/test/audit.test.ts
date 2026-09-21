import { beforeEach, describe, expect, it, vi } from "vitest";

const { fromMock, insertMock } = vi.hoisted(() => {
  const insertMock = vi.fn().mockReturnValue({ then: vi.fn() });
  const fromMock = vi.fn(() => ({ insert: insertMock }));
  return { fromMock, insertMock };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: fromMock },
}));

import { getAuditLogForEncounter, logAuditEvent, type AuditEntry } from "@/lib/audit";

const AUDIT_KEY = "sprymd_audit_log";

const stubDemoMode = () => {
  vi.stubEnv("VITE_SUPABASE_URL", "");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
};

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllEnvs();
  fromMock.mockClear();
  insertMock.mockClear();
  stubDemoMode();
});

describe("logAuditEvent", () => {
  it("returns an entry with system defaults", () => {
    const entry = logAuditEvent("enc-1", "case_opened");
    expect(entry.encounter_id).toBe("enc-1");
    expect(entry.action).toBe("case_opened");
    expect(entry.actor).toBe("system");
    expect(entry.actor_role).toBeNull();
    expect(entry.metadata).toBeNull();
    expect(entry.id).toBeTruthy();
    expect(new Date(entry.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("honors a custom actor, role, and metadata", () => {
    const entry = logAuditEvent("enc-1", "prescribed", {
      actor: "dr.merrick@sprymd.ai",
      actorRole: "provider",
      metadata: { medication: "tadalafil" },
    });
    expect(entry.actor).toBe("dr.merrick@sprymd.ai");
    expect(entry.actor_role).toBe("provider");
    expect(entry.metadata).toEqual({ medication: "tadalafil" });
  });

  it("stores entries newest-first", () => {
    logAuditEvent("enc-1", "first");
    logAuditEvent("enc-1", "second");
    logAuditEvent("enc-1", "third");
    const actions = getAuditLogForEncounter("enc-1").map((e) => e.action);
    expect(actions).toEqual(["third", "second", "first"]);
  });

  it("caps the local trail at 500 entries, dropping the oldest", () => {
    const seed: AuditEntry[] = Array.from({ length: 500 }, (_, i) => ({
      id: `seed-${i}`,
      encounter_id: "enc-cap",
      action: `action-${i}`,
      actor: "system",
      actor_role: null,
      metadata: null,
      timestamp: new Date().toISOString(),
    }));
    localStorage.setItem(AUDIT_KEY, JSON.stringify(seed));

    logAuditEvent("enc-cap", "newest");

    const entries = getAuditLogForEncounter("enc-cap");
    expect(entries).toHaveLength(500);
    expect(entries[0].action).toBe("newest");
    // The oldest seeded entry (last in the newest-first array) was dropped.
    expect(entries.some((e) => e.action === "action-499")).toBe(false);
    expect(entries.some((e) => e.action === "action-498")).toBe(true);
  });

  it("tolerates corrupt storage and keeps logging", () => {
    localStorage.setItem(AUDIT_KEY, "!!corrupt!!");
    const entry = logAuditEvent("enc-2", "recovered");
    expect(entry.action).toBe("recovered");
    expect(getAuditLogForEncounter("enc-2")).toHaveLength(1);
  });

  it("treats a stored non-array as an empty trail", () => {
    localStorage.setItem(AUDIT_KEY, JSON.stringify({ nope: true }));
    logAuditEvent("enc-3", "fresh");
    expect(getAuditLogForEncounter("enc-3")).toHaveLength(1);
  });

  it("makes no Supabase calls in demo mode", () => {
    logAuditEvent("enc-1", "local_only");
    expect(fromMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });
});

describe("getAuditLogForEncounter", () => {
  it("filters the trail to the requested encounter", () => {
    logAuditEvent("enc-a", "for_a");
    logAuditEvent("enc-b", "for_b");
    logAuditEvent("enc-a", "for_a_again");

    const forA = getAuditLogForEncounter("enc-a");
    expect(forA.map((e) => e.action)).toEqual(["for_a_again", "for_a"]);
    expect(getAuditLogForEncounter("enc-b")).toHaveLength(1);
    expect(getAuditLogForEncounter("enc-none")).toHaveLength(0);
  });
});

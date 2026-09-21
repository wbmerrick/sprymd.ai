import { beforeEach, describe, expect, it, vi } from "vitest";

// Keep the real hosted client out of unit tests; the mock layer under test is
// pure localStorage and never touches it.
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import {
  createDemoEncounter,
  formatEncounterRef,
  formatIntakeValue,
  getMockEncounterById,
  getMockEncounterBySession,
  updateMockEncounterCareState,
  upsertMockEncounter,
  type Encounter,
} from "@/lib/encounters";

const MOCK_KEY = "spry_mock_encounters";
const LEGACY_INTAKE_KEY = "spry_mock_intake_answers";

const readStore = (): Encounter[] => JSON.parse(localStorage.getItem(MOCK_KEY) ?? "[]");

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllEnvs();
});

describe("demo seeding", () => {
  it("seeds demo encounters into localStorage on first read", () => {
    expect(localStorage.getItem(MOCK_KEY)).toBeNull();
    const encounter = getMockEncounterBySession("sess-demo-001");
    expect(encounter).not.toBeNull();
    expect(encounter?.id).toBe("enc-demo-001");
    expect(readStore().length).toBeGreaterThan(0);
  });

  it("seeds encounters that carry intake answers and submitted_at", () => {
    getMockEncounterBySession("sess-demo-001");
    for (const e of readStore()) {
      expect(Object.keys(e.intake_answers).length).toBeGreaterThan(0);
      expect(e.submitted_at).toBeTruthy();
    }
  });

  it("re-seeds when storage holds an empty array", () => {
    localStorage.setItem(MOCK_KEY, "[]");
    expect(getMockEncounterById("enc-demo-001")).not.toBeNull();
    expect(readStore().length).toBeGreaterThan(0);
  });

  it("re-seeds when storage is corrupt JSON", () => {
    localStorage.setItem(MOCK_KEY, "{not json!!");
    expect(getMockEncounterById("enc-demo-002")).not.toBeNull();
  });

  it("re-seeds when storage holds a non-array value", () => {
    localStorage.setItem(MOCK_KEY, JSON.stringify({ nope: true }));
    expect(getMockEncounterById("enc-demo-003")).not.toBeNull();
  });
});

describe("upsertMockEncounter", () => {
  it("creates a new encounter with defaults for an unknown session", () => {
    const created = upsertMockEncounter({ session_id: "sess-new-1" });
    expect(created.id).toBeTruthy();
    expect(created.care_state).toBe("draft_intake");
    expect(created.service_line).toBe("ed");
    expect(created.intake_answers).toEqual({});
    expect(created.submitted_at).toBeTruthy();
    expect(getMockEncounterBySession("sess-new-1")?.id).toBe(created.id);
  });

  it("honors provided fields on create", () => {
    const created = upsertMockEncounter({
      session_id: "sess-new-2",
      care_state: "paid",
      email: "pt@example.com",
      intake_answers: { age: "30–39" },
    });
    expect(created.care_state).toBe("paid");
    expect(created.email).toBe("pt@example.com");
    expect(created.intake_answers).toEqual({ age: "30–39" });
  });

  it("updates an existing encounter by session_id, preserving intake answers when omitted", () => {
    const created = upsertMockEncounter({
      session_id: "sess-new-3",
      intake_answers: { age: "40–49", allergies: "None" },
    });
    const updated = upsertMockEncounter({ session_id: "sess-new-3", care_state: "paid" });
    expect(updated.id).toBe(created.id);
    expect(updated.care_state).toBe("paid");
    expect(updated.intake_answers).toEqual({ age: "40–49", allergies: "None" });
  });

  it("replaces intake answers on update when provided", () => {
    upsertMockEncounter({ session_id: "sess-new-4", intake_answers: { age: "40–49" } });
    const updated = upsertMockEncounter({
      session_id: "sess-new-4",
      intake_answers: { age: "50–59", goal: "Confidence" },
    });
    expect(updated.intake_answers).toEqual({ age: "50–59", goal: "Confidence" });
  });
});

describe("updateMockEncounterCareState", () => {
  it("returns null for a session with no encounter", () => {
    // Read once so the store is seeded and the miss is a genuine lookup miss.
    getMockEncounterBySession("sess-demo-001");
    expect(updateMockEncounterCareState("sess-missing", "paid")).toBeNull();
  });

  it("updates the care state of an existing encounter", () => {
    upsertMockEncounter({ session_id: "sess-new-5", care_state: "draft_intake" });
    const updated = updateMockEncounterCareState("sess-new-5", "under_review");
    expect(updated?.care_state).toBe("under_review");
    expect(getMockEncounterBySession("sess-new-5")?.care_state).toBe("under_review");
  });
});

describe("createDemoEncounter", () => {
  it("defaults to a paid ED encounter with empty intake answers", () => {
    const created = createDemoEncounter("sess-demo-new");
    expect(created.care_state).toBe("paid");
    expect(created.service_line).toBe("ed");
    expect(created.intake_answers).toEqual({});
  });

  it("honors an explicit care state", () => {
    const created = createDemoEncounter("sess-demo-new-2", "under_review");
    expect(created.care_state).toBe("under_review");
  });
});

describe("legacy data migration on read", () => {
  it("merges intake answers from the legacy intake-answers key", () => {
    const row = {
      id: "enc-legacy-1",
      session_id: "sess-legacy-1",
      care_state: "paid",
      service_line: "ed",
      intake_answers: {},
      submitted_at: "2026-01-01T00:00:00.000Z",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    };
    localStorage.setItem(MOCK_KEY, JSON.stringify([row]));
    localStorage.setItem(
      LEGACY_INTAKE_KEY,
      JSON.stringify({ "enc-legacy-1": { age: "30–39", allergies: "None" } }),
    );
    const encounter = getMockEncounterById("enc-legacy-1");
    expect(encounter?.intake_answers).toEqual({ age: "30–39", allergies: "None" });
  });

  it("backfills submitted_at from created_at for old rows", () => {
    const row = {
      id: "enc-legacy-2",
      session_id: "sess-legacy-2",
      care_state: "paid",
      service_line: "ed",
      intake_answers: { age: "30–39" },
      created_at: "2026-02-02T12:00:00.000Z",
      updated_at: "2026-02-02T12:00:00.000Z",
    };
    localStorage.setItem(MOCK_KEY, JSON.stringify([row]));
    const encounter = getMockEncounterById("enc-legacy-2");
    expect(encounter?.submitted_at).toBe("2026-02-02T12:00:00.000Z");
  });

  it("tolerates a corrupt legacy intake map", () => {
    const row = {
      id: "enc-legacy-3",
      session_id: "sess-legacy-3",
      care_state: "paid",
      service_line: "ed",
      intake_answers: {},
      created_at: "2026-03-03T00:00:00.000Z",
      updated_at: "2026-03-03T00:00:00.000Z",
    };
    localStorage.setItem(MOCK_KEY, JSON.stringify([row]));
    localStorage.setItem(LEGACY_INTAKE_KEY, "%%broken%%");
    const encounter = getMockEncounterById("enc-legacy-3");
    expect(encounter?.intake_answers).toEqual({});
  });
});

describe("formatEncounterRef", () => {
  it("uses the last six alphanumeric characters, uppercased", () => {
    expect(formatEncounterRef("enc-demo-001")).toBe("Case #EMO001");
  });

  it("handles ids shorter than six characters", () => {
    expect(formatEncounterRef("ab1")).toBe("Case #AB1");
  });
});

describe("formatIntakeValue", () => {
  it("renders an em dash for missing or empty values", () => {
    expect(formatIntakeValue(undefined)).toBe("—");
    expect(formatIntakeValue("")).toBe("—");
    expect(formatIntakeValue([])).toBe("—");
  });

  it("joins array values and passes strings through", () => {
    expect(formatIntakeValue(["A", "B"])).toBe("A, B");
    expect(formatIntakeValue("Just one")).toBe("Just one");
  });
});

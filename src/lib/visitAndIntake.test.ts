import { describe, expect, it } from "vitest";
import { intakeSubmitBlock } from "@/data/intakeQuestions";
import {
  formatDuration,
  sessionDurationSeconds,
  shouldStartSessionClock,
} from "@/lib/visitTimer";
import { readFileSync } from "node:fs";

describe("visit session clock", () => {
  it("does not start until both parties have joined", () => {
    expect(shouldStartSessionClock(true, false, null)).toBe(false);
    expect(shouldStartSessionClock(true, true, null)).toBe(true);
    expect(shouldStartSessionClock(true, true, 1_000)).toBe(false);
  });

  it("logs zero duration before the second party joins", () => {
    expect(sessionDurationSeconds(null, null, 5_000)).toBe(0);
  });

  it("counts seconds only after both have joined", () => {
    expect(sessionDurationSeconds(1_000, 6_000, 9_000)).toBe(5);
    expect(formatDuration(5)).toBe("00:05");
    expect(formatDuration(3661)).toBe("1:01:01");
  });
});

describe("intake submission", () => {
  it("requires a chief complaint, history, and allergy disclosure", () => {
    expect(intakeSubmitBlock({})).toMatch(/chief complaint/i);
    expect(
      intakeSubmitBlock({
        chief_complaints: ["ed"],
        chief_complaint_detail: "Started this year",
        past_medical_history: ["none"],
        allergy_status: "has_allergies",
        allergy_disclosure: "",
      }),
    ).toMatch(/allergies and reactions/i);
    expect(
      intakeSubmitBlock({
        chief_complaints: ["ed"],
        chief_complaint_detail: "Started this year",
        past_medical_history: ["hypertension"],
        allergy_status: "none",
      }),
    ).toBeNull();
  });
});

describe("clinical schema", () => {
  it("keeps patient and provider row access separate", () => {
    const sql = readFileSync(
      "supabase/migrations/20260921_telehealth_clinical.sql",
      "utf8",
    );
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("Patients select own row");
    expect(sql).toContain("Providers select assigned patients");
    expect(sql).toContain("Patients select shared consultation notes");
  });

  it("stores intake drafts and visit duration under the same access rules", () => {
    const sql = readFileSync(
      "supabase/migrations/20260921_intake_and_visits.sql",
      "utf8",
    );
    expect(sql).toContain("patient_intakes");
    expect(sql).toContain("visit_sessions");
    expect(sql).toContain("Patients select own intakes");
    expect(sql).toContain("can_access_appointment");
  });
});

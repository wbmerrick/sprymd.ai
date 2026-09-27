import { describe, expect, it } from "vitest";
import { NONE_OF_THE_ABOVE, conditions, getCondition, getTreatment, intakes } from "@/data/careCatalog";

describe("care catalog integrity", () => {
  it("has an intake for every condition and unique plan ids", () => {
    for (const condition of Object.values(conditions)) {
      expect(intakes[condition.id]?.length).toBeGreaterThan(0);
      const ids = condition.treatments.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const t of condition.treatments) expect(t.price).toBeGreaterThan(0);
    }
  });

  it("only references options that exist in disqualify / crisis / urgent / exclusive lists", () => {
    for (const [conditionId, questions] of Object.entries(intakes)) {
      for (const q of questions) {
        const options = q.options ?? [];
        for (const list of [q.disqualify, q.crisis, q.urgent, q.exclusive]) {
          for (const option of list ?? []) {
            expect(options, `${conditionId}.${q.key}: ${option}`).toContain(option);
          }
        }
        if (q.crisis) expect(q.disqualify ?? []).toEqual(expect.arrayContaining(q.crisis));
        if (q.type === "multi") expect(options.length).toBeGreaterThan(1);
        if (q.type === "compound") expect(q.fields?.length).toBeGreaterThan(0);
        if (q.type === "single") expect(options.length).toBeGreaterThan(1);
      }
    }
  });

  it("gives every safety-screening question a 'None of the above' escape hatch", () => {
    for (const questions of Object.values(intakes)) {
      for (const q of questions) {
        if (q.disqualify?.length) expect(q.options).toContain(NONE_OF_THE_ABOVE);
      }
    }
  });

  it("flags self-harm answers in the mood intake as a crisis", () => {
    const crisis = intakes.mentalhealth.find((q) => q.key === "crisis");
    expect(crisis?.crisis).toEqual(["Thoughts of harming yourself", "Plan or intent to act on those thoughts"]);
  });

  it("looks up conditions and treatments safely", () => {
    expect(getCondition("ed")?.name).toBe("Erectile dysfunction");
    expect(getCondition("nope")).toBeUndefined();
    expect(getCondition(null)).toBeUndefined();
    expect(getTreatment("ed", "tada-daily")?.price).toBe(79);
    expect(getTreatment("ed", "missing")).toBeUndefined();
    expect(getTreatment(undefined, "tada-daily")).toBeUndefined();
  });

  it("keeps the low-T screening copy readable", () => {
    const prostate = intakes.lowt.find((q) => q.key === "prostate");
    for (const option of prostate?.options ?? []) {
      expect(option.length).toBeLessThan(60);
      expect(option).not.toMatch(/\bran\b/);
    }
  });
});

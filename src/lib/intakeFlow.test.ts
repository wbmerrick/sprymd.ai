import { beforeEach, describe, expect, it } from "vitest";
import {
  ADULT_NO,
  ADULT_YES,
  ELIGIBILITY_ADULT_KEY,
  ELIGIBILITY_STATE_KEY,
  ELIGIBILITY_STEP,
  buildIntakeSteps,
  canAdvanceStep,
  checkoutPath,
  chiefComplaintFor,
  clearIntakeProgress,
  compoundFieldError,
  defaultServiceTierFor,
  dobError,
  eligibilityBlockReason,
  findDisqualifier,
  isAdultDob,
  isExclusiveOption,
  loadCheckoutSelection,
  loadIntakeProgress,
  recommendTreatment,
  safetyFlags,
  saveCheckoutSelection,
  saveIntakeProgress,
  summarizeIntake,
  timeLeftLabel,
  toggleMultiOption,
} from "@/lib/intakeFlow";
import { NONE_OF_THE_ABOVE, intakes } from "@/data/careCatalog";

const eligible = { [ELIGIBILITY_STATE_KEY]: "TN", [ELIGIBILITY_ADULT_KEY]: ADULT_YES };
const question = (conditionId: keyof typeof intakes, key: string) => {
  const found = intakes[conditionId].find((q) => q.key === key);
  if (!found) throw new Error(`missing ${conditionId}.${key}`);
  return found;
};

describe("intake steps", () => {
  it("puts the state/age eligibility gate before every condition's questions", () => {
    for (const id of Object.keys(intakes)) {
      const steps = buildIntakeSteps(id);
      expect(steps[0]).toBe(ELIGIBILITY_STEP);
      expect(steps.length).toBe(intakes[id as keyof typeof intakes].length + 1);
    }
    expect(buildIntakeSteps("not-a-condition")).toEqual([]);
  });

  it("blocks visitors outside licensed states and under 18, with a plain reason", () => {
    expect(eligibilityBlockReason({})).toBeNull();
    expect(eligibilityBlockReason({ [ELIGIBILITY_STATE_KEY]: "TN" })).toBeNull();
    expect(eligibilityBlockReason({ [ELIGIBILITY_STATE_KEY]: "CA" })).toMatch(/California/);
    expect(eligibilityBlockReason({ [ELIGIBILITY_STATE_KEY]: "CA" })).toMatch(/Tennessee/);
    expect(eligibilityBlockReason({ [ELIGIBILITY_ADULT_KEY]: ADULT_NO })).toMatch(/18 or older/);
  });

  it("only lets the eligibility step advance when both answers pass", () => {
    expect(canAdvanceStep(ELIGIBILITY_STEP, {})).toBe(false);
    expect(canAdvanceStep(ELIGIBILITY_STEP, { [ELIGIBILITY_STATE_KEY]: "TN" })).toBe(false);
    expect(canAdvanceStep(ELIGIBILITY_STEP, { [ELIGIBILITY_STATE_KEY]: "GA", [ELIGIBILITY_ADULT_KEY]: ADULT_YES })).toBe(false);
    expect(canAdvanceStep(ELIGIBILITY_STEP, { [ELIGIBILITY_STATE_KEY]: "TN", [ELIGIBILITY_ADULT_KEY]: ADULT_NO })).toBe(false);
    expect(canAdvanceStep(ELIGIBILITY_STEP, eligible)).toBe(true);
  });

  it("requires an answer on single and multi steps", () => {
    const age = question("ed", "age");
    expect(canAdvanceStep(age, {})).toBe(false);
    expect(canAdvanceStep(age, { age: "40–49" })).toBe(true);
    const cardiac = question("ed", "cardiac");
    expect(canAdvanceStep(cardiac, { cardiac: [] })).toBe(false);
    expect(canAdvanceStep(cardiac, { cardiac: [NONE_OF_THE_ABOVE] })).toBe(true);
  });
});

describe("height and weight validation", () => {
  const step = question("weightloss", "height_weight");
  const [feet, inches, weight] = step.fields!;

  it("rejects non-numeric and out-of-range values with a message", () => {
    expect(compoundFieldError(feet, "")).toBeNull();
    expect(compoundFieldError(feet, "e")).toMatch(/Enter a number/);
    expect(compoundFieldError(feet, "0")).toMatch(/between 3 and 8 ft/);
    expect(compoundFieldError(inches, "12")).toMatch(/between 0 and 11 in/);
    expect(compoundFieldError(weight, "-5")).toMatch(/between 70 and 800 lbs/);
    expect(compoundFieldError(weight, "999")).toMatch(/between/);
    expect(compoundFieldError(weight, "210")).toBeNull();
  });

  it("will not advance with zero or blank fields", () => {
    expect(canAdvanceStep(step, { feet: "0", inches: "0", weight: "0" })).toBe(false);
    expect(canAdvanceStep(step, { feet: "5", inches: "10" })).toBe(false);
    expect(canAdvanceStep(step, { feet: "5", inches: "10", weight: "210" })).toBe(true);
    expect(canAdvanceStep(step, { feet: "5", inches: "0", weight: "210" })).toBe(true);
  });
});

describe("multi-select exclusivity", () => {
  it("treats 'None of the above' and 'Nothing yet' as exclusive answers", () => {
    const cardiac = question("ed", "cardiac");
    expect(toggleMultiOption(cardiac, [NONE_OF_THE_ABOVE], "Severe heart failure")).toEqual(["Severe heart failure"]);
    expect(toggleMultiOption(cardiac, ["Severe heart failure"], NONE_OF_THE_ABOVE)).toEqual([NONE_OF_THE_ABOVE]);
    expect(toggleMultiOption(cardiac, [NONE_OF_THE_ABOVE], NONE_OF_THE_ABOVE)).toEqual([]);

    const tried = question("hairloss", "tried");
    expect(isExclusiveOption(tried, "Nothing yet")).toBe(true);
    expect(toggleMultiOption(tried, ["Topical minoxidil (Rogaine)"], "Nothing yet")).toEqual(["Nothing yet"]);
    expect(toggleMultiOption(tried, ["Nothing yet"], "Oral finasteride")).toEqual(["Oral finasteride"]);
  });

  it("toggles ordinary options on and off", () => {
    const needs = question("pcp", "needs");
    const once = toggleMultiOption(needs, [], "Lab ordering and review");
    expect(once).toEqual(["Lab ordering and review"]);
    expect(toggleMultiOption(needs, once, "Lab ordering and review")).toEqual([]);
  });
});

describe("safety gating", () => {
  it("finds the first disqualifying answer across the intake", () => {
    const steps = buildIntakeSteps("ed");
    expect(findDisqualifier(steps, { ...eligible, cardiac: [NONE_OF_THE_ABOVE] })).toBeNull();
    expect(findDisqualifier(steps, { ...eligible, cardiac: ["Currently taking nitrates (nitroglycerin, isosorbide)"] })).toEqual({
      stepKey: "cardiac",
      option: "Currently taking nitrates (nitroglycerin, isosorbide)",
    });
  });

  it("raises the crisis flag for self-harm answers and the urgent flag for recent cardiac events", () => {
    const mood = buildIntakeSteps("mentalhealth");
    expect(safetyFlags(mood, { crisis: ["Thoughts of harming yourself"] })).toEqual({ crisis: true, urgent: false });
    expect(safetyFlags(mood, { crisis: ["Recent psychiatric hospitalization"] })).toEqual({ crisis: false, urgent: false });
    expect(findDisqualifier(mood, { crisis: ["Recent psychiatric hospitalization"] })?.option).toBe("Recent psychiatric hospitalization");

    const ed = buildIntakeSteps("ed");
    expect(safetyFlags(ed, { cardiac: ["Heart attack within the last 6 months"] })).toEqual({ crisis: false, urgent: true });
    expect(safetyFlags(ed, { cardiac: ["Severe heart failure"] }).urgent).toBe(true);
  });
});

describe("plan recommendation", () => {
  it("follows the stated preference", () => {
    expect(recommendTreatment("ed", { preference: "Daily — I want to be ready anytime" }).id).toBe("tada-daily");
    expect(recommendTreatment("ed", { preference: "Fast-melt ODT — no swallowing" }).id).toBe("sild-odt");
    expect(recommendTreatment("ed", { preference: "Not sure — recommend for me" }).id).toBe("sild-prn");
    expect(recommendTreatment("weightloss", { preference: "Oral / dissolvable — no needles" }).id).toBe("tirz-odt");
    expect(recommendTreatment("lowt", { preference: "Not sure — recommend for me", fertility: "Yes — planning children" }).id).toBe("enclo");
    expect(recommendTreatment("mentalhealth", { preference: "Less sexual side effects / more energy" }).id).toBe("bupropion");
    expect(recommendTreatment("hairloss", {}).id).toBe("fin");
  });

  it("keeps the PCP tier the visitor clicked when they answer 'Not sure'", () => {
    expect(recommendTreatment("pcp", { treatmentId: "pcp-monthly", preference: "Not sure — recommend for me" }).id).toBe("pcp-monthly");
    expect(recommendTreatment("pcp", { treatmentId: "pcp-monthly", preference: "Yearly Checkup — visit + labs + messaging" }).id).toBe("pcp-yearly");
    expect(recommendTreatment("pcp", { preference: "Not sure — recommend for me" }).id).toBe("pcp-acute");
  });
});

describe("time-left label", () => {
  it("counts down instead of sticking on one number", () => {
    const labels = Array.from({ length: 7 }, (_, i) => timeLeftLabel(i, 7));
    expect(labels).toEqual([
      "About 2 minutes left",
      "About 2 minutes left",
      "About 2 minutes left",
      "About a minute left",
      "Under a minute left",
      "Under a minute left",
      "Last question",
    ]);
  });
});

describe("date of birth", () => {
  const today = new Date(2026, 8, 23);

  it("requires adults and a real, past date", () => {
    expect(dobError("", today)).toBeNull();
    expect(dobError("2015-06-15", today)).toMatch(/18 or older/);
    expect(dobError("2008-09-24", today)).toMatch(/18 or older/);
    expect(dobError("2008-09-23", today)).toBeNull();
    expect(dobError("2030-01-01", today)).toMatch(/future/);
    expect(dobError("2001-02-30", today)).toMatch(/valid/);
    expect(dobError("not-a-date", today)).toMatch(/YYYY-MM-DD/);
    expect(isAdultDob("1985-06-15", today)).toBe(true);
    expect(isAdultDob("", today)).toBe(false);
  });
});

describe("save and resume", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("round-trips intake progress per condition and clamps the step", () => {
    expect(loadIntakeProgress("ed")).toBeNull();
    saveIntakeProgress({ conditionId: "ed", step: 3, answers: { age: "40–49" } });
    saveIntakeProgress({ conditionId: "hairloss", step: 99, answers: {} });
    expect(loadIntakeProgress("ed")).toMatchObject({ conditionId: "ed", step: 3, answers: { age: "40–49" } });
    expect(loadIntakeProgress("hairloss")?.step).toBe(buildIntakeSteps("hairloss").length - 1);
    clearIntakeProgress("ed");
    expect(loadIntakeProgress("ed")).toBeNull();
    expect(loadIntakeProgress("hairloss")).not.toBeNull();
  });

  it("ignores corrupt storage", () => {
    window.sessionStorage.setItem("sprymd_intake_progress_v1", "{not json");
    expect(loadIntakeProgress("ed")).toBeNull();
    expect(loadCheckoutSelection()).toBeNull();
  });

  it("stores the plan handed to /checkout", () => {
    saveCheckoutSelection({ conditionId: "ed", treatmentId: "tada-daily", answers: { age: "40–49" }, email: "a@b.co" });
    expect(loadCheckoutSelection()).toMatchObject({ conditionId: "ed", treatmentId: "tada-daily", email: "a@b.co" });
  });
});

describe("checkout handoff", () => {
  it("builds the /checkout URL with the plan and condition", () => {
    expect(checkoutPath("ed", "tada-daily")).toBe("/checkout?plan=tada-daily&condition=ed");
    expect(checkoutPath("ed", "tada-daily", "qa@example.com")).toBe("/checkout?plan=tada-daily&condition=ed&email=qa%40example.com");
    expect(defaultServiceTierFor("pcp")).toBe("evaluation");
    expect(defaultServiceTierFor("ed")).toBe("evaluation");
  });

  it("maps conditions onto the chart's chief-complaint values and summarizes answers", () => {
    expect(chiefComplaintFor("ed")).toBe("ed");
    expect(chiefComplaintFor("weightloss")).toBe("weight");
    expect(chiefComplaintFor("skincare")).toBe("other");
    const summary = summarizeIntake("weightloss", {
      ...eligible,
      feet: "5",
      inches: "10",
      weight: "210",
      thyroid_history: ["History of pancreatitis", "Active gallbladder disease"],
    });
    expect(summary).toContain("Weight loss intake");
    expect(summary).toContain("Location during visit: Tennessee");
    expect(summary).toContain("Feet 5, Inches 10, Weight 210 lbs");
    expect(summary).toContain("History of pancreatitis; Active gallbladder disease");
  });
});

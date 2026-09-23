import { beforeEach, describe, expect, it, vi } from "vitest";

type Session = { user: { id: string; email: string } } | null;

const state: {
  session: Session;
  patientsSelect: { data: { id: string } | null; error: { code: string; message: string } | null };
  upserts: Record<string, unknown>[];
  inserts: Record<string, unknown>[];
} = {
  session: null,
  patientsSelect: { data: null, error: null },
  upserts: [],
  inserts: [],
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: state.session } }) },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => state.patientsSelect }),
      }),
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () => {
            state.inserts.push({ table, ...row });
            return { data: { id: "pat-new" }, error: null };
          },
        }),
      }),
      upsert: async (row: Record<string, unknown>) => {
        state.upserts.push({ table, ...row });
        return { error: null };
      },
    }),
  },
}));

import {
  buildFunnelDraft,
  isValidEmail,
  isValidPhone,
  persistFunnelCase,
  resolvePatientId,
  submitConsultRequest,
} from "@/lib/caseSubmission";
import { getPatientCare } from "@/lib/patientCareStore";
import { getStoredAccount } from "@/lib/customerAccounts";

const answers = { eligibility_state: "TN", eligibility_adult: "Yes, I'm 18 or older", age: "40–49", cardiac: ["Currently taking nitrates (nitroglycerin, isosorbide)"] };

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  state.session = null;
  state.patientsSelect = { data: null, error: null };
  state.upserts = [];
  state.inserts = [];
});

describe("funnel draft mapping", () => {
  it("maps the condition onto the chart's chief complaint and keeps the raw answers", () => {
    const draft = buildFunnelDraft({ kind: "plan_selected", conditionId: "ed", answers, treatmentId: "tada-daily" }, "draft-1", "pat-1");
    expect(draft.status).toBe("submitted");
    expect(draft.patientId).toBe("pat-1");
    expect(draft.answers.chief_complaints).toEqual(["ed"]);
    expect(String(draft.answers.chief_complaint_detail)).toContain("Plan selected: Tadalafil 5mg Daily");
    const funnel = draft.answers.funnel as unknown as { answers: typeof answers; treatmentId: string };
    expect(funnel.treatmentId).toBe("tada-daily");
    expect(funnel.answers.cardiac).toEqual(answers.cardiac);
  });

  it("marks consult requests and crisis flags so a clinician sees them first", () => {
    const draft = buildFunnelDraft(
      {
        kind: "consult_requested",
        conditionId: "mentalhealth",
        answers: { crisis: ["Thoughts of harming yourself"] },
        disqualifier: "Thoughts of harming yourself",
        crisis: true,
        contact: { name: "QA Tester", email: "qa@example.com", phone: "6155550100", bestTime: "Any time" },
      },
      "draft-2",
    );
    const detail = String(draft.answers.chief_complaint_detail);
    expect(detail).toContain("CLINICIAN CALL REQUESTED");
    expect(detail).toContain("CRISIS FLAG");
    expect(detail).toContain("6155550100");
    expect(draft.answers.chief_complaints).toEqual(["other"]);
  });
});

describe("persistFunnelCase", () => {
  it("keeps the intake on the device when nobody is signed in", async () => {
    const result = await persistFunnelCase({ kind: "plan_selected", conditionId: "ed", answers, treatmentId: "tada-daily" });
    expect(result.location).toBe("device");
    expect(state.upserts).toEqual([]);
    const stored = JSON.parse(window.localStorage.getItem(`sprymd.intake.${result.draftId}`) || "{}");
    expect(stored.answers.chief_complaints).toEqual(["ed"]);
  });

  it("writes to patient_intakes for a signed-in patient with a chart row", async () => {
    state.session = { user: { id: "user-1", email: "qa@example.com" } };
    state.patientsSelect = { data: { id: "pat-1" }, error: null };
    const result = await persistFunnelCase({ kind: "plan_selected", conditionId: "ed", answers, treatmentId: "tada-daily" });
    expect(result.location).toBe("database");
    expect(state.upserts).toHaveLength(1);
    expect(state.upserts[0]).toMatchObject({ table: "patient_intakes", patient_id: "pat-1", chief_complaints: ["ed"], status: "submitted" });
  });

  it("creates the patients row on first use", async () => {
    state.session = { user: { id: "user-2", email: "new@example.com" } };
    state.patientsSelect = { data: null, error: { code: "PGRST116", message: "no rows" } };
    expect(await resolvePatientId({ name: "New Patient", phone: "6155550100" })).toBe("pat-new");
    expect(state.inserts[0]).toMatchObject({ table: "patients", user_id: "user-2", email: "new@example.com", full_name: "New Patient" });
  });

  it("falls back to the device when the chart tables are missing (PGRST205)", async () => {
    state.session = { user: { id: "user-3", email: "qa@example.com" } };
    state.patientsSelect = { data: null, error: { code: "PGRST205", message: "Could not find the table" } };
    const result = await persistFunnelCase({ kind: "plan_selected", conditionId: "ed", answers, treatmentId: "tada-daily" });
    expect(result.location).toBe("device");
    expect(state.inserts).toEqual([]);
    expect(state.upserts).toEqual([]);
  });
});

describe("submitConsultRequest", () => {
  it("records the call request with contact details on the patient's account", async () => {
    const outcome = await submitConsultRequest({
      conditionId: "ed",
      answers,
      disqualifier: "Currently taking nitrates (nitroglycerin, isosorbide)",
      crisis: false,
      contact: { name: "QA Tester", email: "QA@Example.com", phone: "(615) 555-0100", bestTime: "Morning (8am–12pm CT)" },
    });
    expect(outcome.storedWhere).toBe("account");
    const care = getPatientCare("qa@example.com");
    expect(care.clinicalCases[0]).toMatchObject({ status: "needs_info", conditionId: "ed" });
    expect(care.clinicalCases[0].intake).toMatchObject({ consult_requested: true, phone: "(615) 555-0100" });
    expect(care.messages[0].subject).toMatch(/Clinician call requested/);
    expect(care.notifications[0].title).toBe("Clinician call requested");
    expect(getStoredAccount("qa@example.com")?.phone).toBe("(615) 555-0100");
  });

  it("reports chart storage when the patient is signed in", async () => {
    state.session = { user: { id: "user-1", email: "qa@example.com" } };
    state.patientsSelect = { data: { id: "pat-1" }, error: null };
    const outcome = await submitConsultRequest({
      conditionId: "mentalhealth",
      answers: { crisis: ["Thoughts of harming yourself"] },
      disqualifier: "Thoughts of harming yourself",
      crisis: true,
      contact: { name: "QA Tester", email: "qa@example.com", phone: "6155550100", bestTime: "Any time" },
    });
    expect(outcome.storedWhere).toBe("chart");
    expect(state.upserts[0]).toMatchObject({ table: "patient_intakes", patient_id: "pat-1" });
  });
});

describe("contact validation", () => {
  it("accepts US mobile numbers and real-looking emails", () => {
    expect(isValidPhone("(615) 555-0100")).toBe(true);
    expect(isValidPhone("+1 615 555 0100")).toBe(true);
    expect(isValidPhone("555-0100")).toBe(false);
    expect(isValidEmail("qa@example.com")).toBe(true);
    expect(isValidEmail("qa@example")).toBe(false);
    expect(isValidEmail("not an email")).toBe(false);
  });
});

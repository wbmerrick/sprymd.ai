import { describe, expect, it } from "vitest";
import {
  DEFAULT_INTAKE_FORM_ID,
  PHARMACY_TASK_TITLE,
  normalizePhone,
  normalizeState,
  normalizeZip,
  parseIntakeResponse,
  patientIdFromWebhook,
  pickIntakeResponse,
  pickPharmacy,
  syncPatientIntake,
  type AkuteApi,
  type PharmacyCandidate,
  type QuestionnaireResponse,
} from "./intakeSync";

const ADDRESS_PATH = "Your home address";
const PHARMACY_PATH = "Your preferred pharmacy (where we'll send your prescription)";

function intakeResponse(overrides: Partial<QuestionnaireResponse> = {}): QuestionnaireResponse {
  return {
    id: "qr_1",
    questionnaire_id: DEFAULT_INTAKE_FORM_ID,
    patient_id: "pt_1",
    authored_at: "2026-10-19T15:00:00Z",
    status: "completed",
    responses: [
      { path: ADDRESS_PATH, question: "Address 1", answer: "123 Main St", answer_type: "string" },
      { path: ADDRESS_PATH, question: "Address 2", answer: "", answer_type: "string" },
      { path: ADDRESS_PATH, question: "City", answer: "McKenzie", answer_type: "string" },
      { path: ADDRESS_PATH, question: "State", answer: "Tennessee", answer_type: "string" },
      { path: ADDRESS_PATH, question: "Zip Code", answer: "38201-1234", answer_type: "string" },
      { path: PHARMACY_PATH, question: "Name", answer: "Walgreens", answer_type: "string" },
      { path: PHARMACY_PATH, question: "Phone", answer: "(731) 555-0101", answer_type: "string" },
      { path: PHARMACY_PATH, question: "Address", answer: "1 Pharmacy Rd", answer_type: "string" },
      { path: PHARMACY_PATH, question: "City", answer: "McKenzie", answer_type: "string" },
      { path: PHARMACY_PATH, question: "State", answer: "TN", answer_type: "string" },
      { path: PHARMACY_PATH, question: "Zip", answer: "38201", answer_type: "string" },
    ],
    ...overrides,
  };
}

describe("normalizers", () => {
  it("maps state names and codes to 2-letter codes", () => {
    expect(normalizeState("Tennessee")).toBe("TN");
    expect(normalizeState("tn")).toBe("TN");
    expect(normalizeState("")).toBe("");
  });
  it("keeps 5-digit zips and 10-digit phones", () => {
    expect(normalizeZip("38201-1234")).toBe("38201");
    expect(normalizePhone("+1 (731) 555-0101")).toBe("7315550101");
  });
});

describe("parseIntakeResponse", () => {
  it("maps the built-in Address and Pharmacy groups", () => {
    const parsed = parseIntakeResponse(intakeResponse());
    expect(parsed.address).toEqual({
      line1: "123 Main St",
      line2: undefined,
      city: "McKenzie",
      state: "TN",
      zipcode: "38201",
    });
    expect(parsed.pharmacy).toMatchObject({
      name: "Walgreens",
      phone: "7315550101",
      city: "McKenzie",
      state: "TN",
      zip: "38201",
    });
  });

  it("returns no address when a required part is missing", () => {
    const r = intakeResponse();
    r.responses = r.responses!.filter((a) => a.question !== "City" || a.path !== ADDRESS_PATH);
    expect(parseIntakeResponse(r).address).toBeNull();
  });

  it("picks up a pharmacy id when the Pharmacy answer carries one", () => {
    const r = intakeResponse({
      responses: [
        {
          path: PHARMACY_PATH,
          question: "Search",
          answer: { id: "ph_42", name: "CVS Pharmacy #1234" },
          answer_type: "coding",
        },
      ],
    });
    expect(parseIntakeResponse(r).pharmacy).toMatchObject({ pharmacyId: "ph_42", name: "CVS Pharmacy #1234" });
  });

  it("falls back to question text when no group path is present", () => {
    const r = intakeResponse({
      responses: [
        { question: "Address 1", answer: "9 Oak Ave" },
        { question: "City", answer: "Paris" },
        { question: "State", answer: "TN" },
        { question: "Zip Code", answer: "38242" },
      ],
    });
    expect(parseIntakeResponse(r).address?.line1).toBe("9 Oak Ave");
  });
});

describe("pickIntakeResponse", () => {
  it("prefers the intake form id, newest first", () => {
    const older = intakeResponse({ id: "old", authored_at: "2026-10-01T00:00:00Z" });
    const newer = intakeResponse({ id: "new", authored_at: "2026-10-19T00:00:00Z" });
    const other = intakeResponse({ id: "other", questionnaire_id: "something-else", authored_at: "2026-10-20T00:00:00Z" });
    expect(pickIntakeResponse([older, other, newer])?.id).toBe("new");
  });
  it("falls back to any response that carries address or pharmacy answers", () => {
    const other = intakeResponse({ id: "other", questionnaire_id: "something-else" });
    expect(pickIntakeResponse([other])?.id).toBe("other");
    expect(pickIntakeResponse([{ id: "empty", questionnaire_id: "x", responses: [] }])).toBeNull();
  });
});

describe("pickPharmacy", () => {
  const candidates: PharmacyCandidate[] = [
    { id: "a", name: "Walgreens #100", phone: "7315550101", zip: "38201" },
    { id: "b", name: "Walgreens #200", phone: "7315550202", zip: "38242" },
    { id: "c", name: "CVS Pharmacy", phone: "7315550303", zip: "38201" },
  ];
  it("matches on phone with high confidence", () => {
    expect(pickPharmacy(candidates, { name: "Walgreens", phone: "7315550202" })).toEqual({ id: "b", confidence: "high" });
  });
  it("matches on name + zip when phone is absent", () => {
    expect(pickPharmacy(candidates, { name: "Walgreens", zip: "38201" })).toEqual({ id: "a", confidence: "medium" });
  });
  it("refuses an ambiguous pick", () => {
    expect(pickPharmacy(candidates, { name: "Walgreens" })).toBeNull();
    expect(pickPharmacy([], { name: "Walgreens", zip: "38201" })).toBeNull();
  });
});

function fakeApi(opts: {
  patient?: Record<string, unknown>;
  pharmacies?: PharmacyCandidate[];
  responses?: QuestionnaireResponse[];
  search?: PharmacyCandidate[];
  openTasks?: Array<Record<string, unknown>>;
}) {
  const calls: string[] = [];
  const api: AkuteApi = {
    getPatient: async () => opts.patient || { id: "pt_1" },
    listResponses: async () => opts.responses || [intakeResponse()],
    listPatientPharmacies: async () => opts.pharmacies || [],
    searchPharmacies: async () => opts.search || [],
    addPharmacy: async (pid, phid) => {
      calls.push(`addPharmacy:${pid}:${phid}`);
    },
    updateAddress: async (pid, a) => {
      calls.push(`updateAddress:${pid}:${a.zipcode}`);
    },
    listOpenTasks: async () => opts.openTasks || [],
    createTask: async (pid, title) => {
      calls.push(`createTask:${pid}:${title}`);
    },
  };
  return { api, calls };
}

describe("syncPatientIntake", () => {
  it("skips a patient whose chart already has address and pharmacy", async () => {
    const { api, calls } = fakeApi({
      patient: { id: "pt_1", address_line_1: "123 Main St", address_zipcode: "38201" },
      pharmacies: [{ id: "a", name: "Walgreens" }],
    });
    const r = await syncPatientIntake("pt_1", api);
    expect(r.skipped).toBe("chart_complete");
    expect(calls).toEqual([]);
  });

  it("writes the address and adds the matched pharmacy", async () => {
    const { api, calls } = fakeApi({
      search: [{ id: "ph_a", name: "Walgreens #100", phone: "7315550101", zip: "38201" }],
    });
    const r = await syncPatientIntake("pt_1", api);
    expect(r.addressApplied).toBe(true);
    expect(r.pharmacyApplied).toBe(true);
    expect(calls).toEqual(["updateAddress:pt_1:38201", "addPharmacy:pt_1:ph_a"]);
  });

  it("creates exactly one physician task when the pharmacy cannot be matched", async () => {
    const first = fakeApi({ search: [] });
    const r1 = await syncPatientIntake("pt_1", first.api);
    expect(r1.taskCreated).toBe(true);
    expect(first.calls).toContain(`createTask:pt_1:${PHARMACY_TASK_TITLE}`);

    const second = fakeApi({ search: [], openTasks: [{ task: PHARMACY_TASK_TITLE }] });
    const r2 = await syncPatientIntake("pt_1", second.api);
    expect(r2.taskCreated).toBe(false);
    expect(r2.notes).toContain("pharmacy_task_exists");
  });

  it("skips when the patient has no intake response yet", async () => {
    const { api, calls } = fakeApi({ responses: [] });
    const r = await syncPatientIntake("pt_1", api);
    expect(r.skipped).toBe("no_intake_response");
    expect(calls).toEqual([]);
  });

  it("uses a pharmacy id carried by the answer without searching", async () => {
    const { api, calls } = fakeApi({
      responses: [
        intakeResponse({
          responses: [
            { path: PHARMACY_PATH, question: "Search", answer: { pharmacy_id: "ph_direct", name: "CVS" } },
          ],
        }),
      ],
      patient: { id: "pt_1", address_line_1: "x", address_zipcode: "38201" },
    });
    const r = await syncPatientIntake("pt_1", api);
    expect(r.pharmacyApplied).toBe(true);
    expect(calls).toEqual(["addPharmacy:pt_1:ph_direct"]);
  });
});

describe("patientIdFromWebhook", () => {
  it("reads patient_id from task/note/appointment payloads and id from patient payloads", () => {
    expect(patientIdFromWebhook("task", { patient_id: "pt_9" })).toBe("pt_9");
    expect(patientIdFromWebhook("patient", { id: "pt_8" })).toBe("pt_8");
    expect(patientIdFromWebhook("note", {})).toBeNull();
  });
});

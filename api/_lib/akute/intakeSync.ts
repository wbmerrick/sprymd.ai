import { akute, idOf, list } from "./client";
import { createTask } from "./tasks";

/**
 * Akute intake part 2 → chart auto-sync.
 *
 * The "Home Address & Preferred Pharmacy" form (Akute built-in Address + Pharmacy
 * question types) is answered on Akute's own forms site, so the answers only live
 * in a questionnaire response. Akute has no form-response webhook, so this module
 * is driven two ways:
 *   - fast path: any Patient / Task / Note / Appointment webhook → syncPatientIntake(patient)
 *   - backup: /api/cron/akute-intake-sweep walks active patients missing address or pharmacy
 *
 * Idempotent by construction: the address is written only when the chart has none,
 * a pharmacy is added only when the patient has none, and an unmatched pharmacy
 * answer becomes exactly one open task for the physician.
 */

export const DEFAULT_INTAKE_FORM_ID = "710f6b25-a912-4633-84f8-ba8af0b19835";

export function intakeFormId(): string {
  return (process.env.AKUTE_INTAKE_FORM_ID || DEFAULT_INTAKE_FORM_ID).trim();
}

export type QuestionnaireAnswer = {
  question_id?: string;
  question?: string;
  path?: string;
  answer?: unknown;
  answer_type?: string;
  answer_group_index?: number;
  answer_code?: string;
  answer_system?: string;
};

export type QuestionnaireResponse = {
  id?: string;
  questionnaire_id?: string;
  patient_id?: string;
  external_patient_id?: string;
  authored_at?: string;
  status?: string;
  responses?: QuestionnaireAnswer[];
};

export type ParsedAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipcode: string;
};

export type ParsedPharmacy = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  /** Pharmacy identifier if the built-in Pharmacy question carried one. */
  pharmacyId?: string;
  ncpdpId?: string;
};

export type ParsedIntake = {
  responseId: string | null;
  authoredAt: string | null;
  address: ParsedAddress | null;
  pharmacy: ParsedPharmacy | null;
};

const STATE_CODES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", "district of columbia": "DC",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL",
  indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN",
  mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY",
};

export function normalizeState(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^[A-Za-z]{2}$/.test(s)) return s.toUpperCase();
  return STATE_CODES[s.toLowerCase()] || s.toUpperCase().slice(0, 2);
}

export function normalizeZip(raw: unknown): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.slice(0, 5);
}

export function normalizePhone(raw: unknown): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function answerText(a: QuestionnaireAnswer): string {
  const v = a.answer;
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return String(v).trim();
  }
  if (typeof v === "object") {
    const rec = v as Record<string, unknown>;
    const pick = rec.display || rec.value || rec.text || rec.name || rec.code;
    return pick != null ? String(pick).trim() : "";
  }
  return "";
}

function answerIds(a: QuestionnaireAnswer): { pharmacyId?: string; ncpdpId?: string } {
  const out: { pharmacyId?: string; ncpdpId?: string } = {};
  const v = a.answer;
  if (v && typeof v === "object") {
    const rec = v as Record<string, unknown>;
    const pid = rec.pharmacy_id ?? rec.pharmacyId ?? rec.id;
    const ncpdp = rec.ncpdp_id ?? rec.ncpdpId ?? rec.ncpdp;
    if (pid != null && String(pid).trim()) out.pharmacyId = String(pid).trim();
    if (ncpdp != null && String(ncpdp).trim()) out.ncpdpId = String(ncpdp).trim();
  }
  if (!out.pharmacyId && a.answer_code && /pharm/i.test(String(a.answer_system || ""))) {
    out.pharmacyId = String(a.answer_code).trim();
  }
  return out;
}

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function groupOf(a: QuestionnaireAnswer): "address" | "pharmacy" | null {
  const p = norm(a.path);
  const q = norm(a.question);
  if (/pharmac/.test(p) || /^(pharmacy name|pharmacy|pharmacy search|search)$/.test(q)) return "pharmacy";
  if (/home address|your address|mailing address/.test(p) || /address/.test(p)) return "address";
  if (/^(address 1|address line 1|street|street address|address 2|address line 2|zip code|zipcode|zip|city|state)$/.test(q)) {
    return "address";
  }
  return null;
}

/**
 * Map one questionnaire response (one entry per answer) to address + pharmacy.
 * Matches by group path first, then by question text, so renaming the form's
 * labels within reason does not break the sync.
 */
export function parseIntakeResponse(resp: QuestionnaireResponse): ParsedIntake {
  const entries = Array.isArray(resp.responses) ? resp.responses : [];
  const addr: Partial<ParsedAddress> = {};
  const ph: ParsedPharmacy = {};

  for (const a of entries) {
    const group = groupOf(a);
    const q = norm(a.question);
    const text = answerText(a);

    if (group === "pharmacy") {
      const ids = answerIds(a);
      if (ids.pharmacyId) ph.pharmacyId = ids.pharmacyId;
      if (ids.ncpdpId) ph.ncpdpId = ids.ncpdpId;
      if (!text) continue;
      if (/^(pharmacy name|name|pharmacy)$/.test(q)) ph.name = text;
      else if (/phone|fax/.test(q)) ph.phone = normalizePhone(text);
      else if (/^(address|street|address 1|address line 1)$/.test(q)) ph.address = text;
      else if (/^city$/.test(q)) ph.city = text;
      else if (/^state$/.test(q)) ph.state = normalizeState(text);
      else if (/zip/.test(q)) ph.zip = normalizeZip(text);
      else if (/search/.test(q)) {
        // The built-in Pharmacy "Search" answer is usually the chosen pharmacy's display string.
        if (!ph.name) ph.name = text;
      }
      continue;
    }

    if (group === "address") {
      if (!text) continue;
      if (/^(address 1|address line 1|street|street address|address)$/.test(q)) addr.line1 = text;
      else if (/^(address 2|address line 2|apt|unit|suite)$/.test(q)) addr.line2 = text;
      else if (/^city$/.test(q)) addr.city = text;
      else if (/^state$/.test(q)) addr.state = normalizeState(text);
      else if (/zip/.test(q)) addr.zipcode = normalizeZip(text);
    }
  }

  const address =
    addr.line1 && addr.city && addr.state && addr.zipcode
      ? {
          line1: addr.line1.slice(0, 35),
          line2: addr.line2 ? addr.line2.slice(0, 35) : undefined,
          city: addr.city.slice(0, 35),
          state: addr.state,
          zipcode: addr.zipcode,
        }
      : null;

  const hasPharmacy = Boolean(ph.pharmacyId || ph.ncpdpId || ph.name || ph.phone);

  return {
    responseId: resp.id ? String(resp.id) : null,
    authoredAt: resp.authored_at ? String(resp.authored_at) : null,
    address,
    pharmacy: hasPharmacy ? ph : null,
  };
}

/**
 * Prefer the newest intake-form response that actually carries an address or
 * pharmacy (an empty or in-progress retake must not shadow a completed one);
 * fall back to the newest response of any form that does.
 */
export function pickIntakeResponse(responses: QuestionnaireResponse[]): QuestionnaireResponse | null {
  const formId = intakeFormId();
  const byTime = [...responses].sort((a, b) =>
    String(b.authored_at || "").localeCompare(String(a.authored_at || "")),
  );
  const answered = (r: QuestionnaireResponse) => {
    const p = parseIntakeResponse(r);
    return Boolean(p.address || p.pharmacy);
  };
  return (
    byTime.find((r) => String(r.questionnaire_id || "") === formId && answered(r)) ||
    byTime.find(answered) ||
    null
  );
}

export type PharmacyCandidate = Record<string, unknown> & {
  id?: string | number;
  pharmacy_id?: string | number;
  name?: string;
  store_name?: string;
  phone?: string;
  phone_number?: string;
  fax?: string;
  zip?: string;
  zipcode?: string;
  zip_code?: string;
  ncpdp_id?: string | number;
};

const candId = (c: PharmacyCandidate): string | null => {
  const v = c.pharmacy_id ?? c.id;
  return v != null && String(v).trim() ? String(v).trim() : null;
};
const candName = (c: PharmacyCandidate) => norm(c.name ?? c.store_name ?? "");
const candZip = (c: PharmacyCandidate) => normalizeZip(c.zip ?? c.zipcode ?? c.zip_code ?? "");
const candPhone = (c: PharmacyCandidate) => normalizePhone(c.phone ?? c.phone_number ?? "");

/**
 * Choose the pharmacy the patient meant. Phone is the strongest signal (unique
 * per store); otherwise name words + zip. Anything weaker is left to the physician.
 */
export function pickPharmacy(
  candidates: PharmacyCandidate[],
  wanted: ParsedPharmacy,
): { id: string; confidence: "high" | "medium" } | null {
  const withIds = candidates.filter((c) => candId(c));
  if (!withIds.length) return null;

  if (wanted.phone && wanted.phone.length === 10) {
    const byPhone = withIds.filter((c) => candPhone(c) === wanted.phone);
    if (byPhone.length === 1) return { id: candId(byPhone[0])!, confidence: "high" };
  }

  const wantedWords = norm(wanted.name).split(" ").filter((w) => w.length > 2);
  const scored = withIds
    .map((c) => {
      const n = candName(c);
      const words = wantedWords.filter((w) => n.includes(w)).length;
      const zipOk = wanted.zip ? candZip(c) === wanted.zip : false;
      return { c, words, zipOk };
    })
    .filter((s) => s.words > 0);

  if (!scored.length) return null;
  const strong = scored.filter((s) => s.zipOk && s.words >= Math.min(1, wantedWords.length));
  if (strong.length === 1) return { id: candId(strong[0].c)!, confidence: "medium" };
  if (!wanted.zip && scored.length === 1) return { id: candId(scored[0].c)!, confidence: "medium" };
  return null;
}

/* ---------------- Akute API calls (thin, swappable for tests) ---------------- */

/** Fields Akute expects on a patient PUT besides what is being changed. */
export const IDENTITY_FIELDS = [
  "first_name",
  "middle_name",
  "last_name",
  "date_of_birth",
  "sex",
  "status",
  "email",
  "primary_phone_number",
  "primary_phone_type",
  "external_id",
] as const;

export type AkuteApi = {
  getPatient: (patientId: string) => Promise<Record<string, unknown>>;
  listResponses: (patientId: string) => Promise<QuestionnaireResponse[]>;
  listPatientPharmacies: (patientId: string) => Promise<PharmacyCandidate[]>;
  searchPharmacies: (q: ParsedPharmacy) => Promise<PharmacyCandidate[]>;
  addPharmacy: (patientId: string, pharmacyId: string) => Promise<void>;
  /** `patient` is the record from getPatient; identity fields are merged into the PUT. */
  updateAddress: (patientId: string, a: ParsedAddress, patient: Record<string, unknown>) => Promise<void>;
  listOpenTasks: (patientId: string) => Promise<Array<Record<string, unknown>>>;
  createTask: (patientId: string, title: string, description: string) => Promise<void>;
};

export function realAkuteApi(): AkuteApi {
  return {
    getPatient: async (patientId) =>
      ((await akute(`/patients/${encodeURIComponent(patientId)}`)) as Record<string, unknown>) || {},
    listResponses: async (patientId) =>
      list(
        await akute(`/questionnaireresponses?${new URLSearchParams({ patient_id: patientId })}`),
      ) as QuestionnaireResponse[],
    listPatientPharmacies: async (patientId) =>
      list(await akute(`/pharmacy?${new URLSearchParams({ patient_id: patientId })}`)) as PharmacyCandidate[],
    searchPharmacies: async (q) => {
      const params = new URLSearchParams();
      if (q.name) params.set("name", q.name.slice(0, 60));
      if (q.zip) params.set("zip", q.zip);
      if (q.phone && q.phone.length === 10) params.set("phoneOrFax", q.phone);
      if (q.state && !q.zip) params.set("state", q.state);
      if (q.city && !q.zip) params.set("city", q.city);
      params.append("pharmacy_specialties[]", "Retail");
      return list(await akute(`/pharmacy?${params}`)) as PharmacyCandidate[];
    },
    addPharmacy: async (patientId, pharmacyId) => {
      await akute("/pharmacy", {
        method: "POST",
        body: JSON.stringify({ patient_id: patientId, pharmacy_id: pharmacyId, set_as_primary: true }),
      });
    },
    updateAddress: async (patientId, a, patient) => {
      // Akute's patient PUT is validated as a whole record, so carry the identity
      // fields across rather than sending address fields alone.
      const body: Record<string, unknown> = {};
      for (const key of IDENTITY_FIELDS) {
        const v = patient?.[key];
        if (v != null && String(v).trim() !== "") body[key] = v;
      }
      body.address_line_1 = a.line1;
      body.address_line_2 = a.line2 || "";
      body.address_city = a.city;
      body.address_state = a.state;
      body.address_zipcode = a.zipcode;
      await akute(`/patients/${encodeURIComponent(patientId)}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    },
    listOpenTasks: async (patientId) =>
      list(
        await akute(`/tasks?${new URLSearchParams({ patient_id: patientId, archived: "false", limit: "100" })}`),
      ) as Array<Record<string, unknown>>,
    createTask: async (patientId, title, description) => {
      await createTask({ title, description, patientId, ownerId: process.env.AKUTE_PROVIDER_ID, priority: "p2" });
    },
  };
}

/* ---------------- Orchestration ---------------- */

export const PHARMACY_TASK_TITLE = "Intake pharmacy needs a pick";

export type SyncResult = {
  patientId: string;
  addressApplied: boolean;
  pharmacyApplied: boolean;
  taskCreated: boolean;
  skipped?: string;
  notes: string[];
};

function patientHasAddress(p: Record<string, unknown>): boolean {
  return Boolean(String(p.address_line_1 || "").trim() && String(p.address_zipcode || "").trim());
}

export async function syncPatientIntake(
  patientId: string,
  api: AkuteApi = realAkuteApi(),
): Promise<SyncResult> {
  const result: SyncResult = {
    patientId,
    addressApplied: false,
    pharmacyApplied: false,
    taskCreated: false,
    notes: [],
  };

  const patient = await api.getPatient(patientId);
  const needAddress = !patientHasAddress(patient);

  // If the pharmacy list cannot be read, leave pharmacies alone this round: a
  // transient error must never turn into a second pharmacy on the chart.
  let needPharmacy = false;
  try {
    const existing = await api.listPatientPharmacies(patientId);
    needPharmacy = existing.length === 0;
  } catch (e) {
    result.notes.push(`pharmacy_list_failed: ${(e as Error).message}`);
  }

  if (!needAddress && !needPharmacy) {
    result.skipped = "chart_complete";
    return result;
  }

  const responses = await api.listResponses(patientId);
  const chosen = pickIntakeResponse(responses);
  if (!chosen) {
    result.skipped = "no_intake_response";
    return result;
  }
  const parsed = parseIntakeResponse(chosen);

  if (needAddress) {
    if (parsed.address) {
      await api.updateAddress(patientId, parsed.address, patient);
      result.addressApplied = true;
    } else {
      result.notes.push("address_incomplete_in_response");
    }
  }

  if (needPharmacy) {
    const wanted = parsed.pharmacy;
    if (!wanted) {
      result.notes.push("no_pharmacy_in_response");
      return result;
    }

    let pharmacyId: string | null = wanted.pharmacyId || null;
    if (!pharmacyId && (wanted.name || wanted.phone)) {
      let candidates: PharmacyCandidate[] = [];
      try {
        candidates = await api.searchPharmacies(wanted);
      } catch (e) {
        result.notes.push(`pharmacy_search_failed: ${(e as Error).message}`);
      }
      const pick = pickPharmacy(candidates, wanted);
      if (pick) {
        pharmacyId = pick.id;
        result.notes.push(`pharmacy_match_${pick.confidence}`);
      }
    }

    if (pharmacyId) {
      // Webhooks for one patient often land together; re-read right before writing
      // so a parallel invocation that already attached a pharmacy is not doubled.
      try {
        const again = await api.listPatientPharmacies(patientId);
        if (again.length > 0) {
          result.notes.push("pharmacy_added_concurrently");
          return result;
        }
      } catch (e) {
        result.notes.push(`pharmacy_recheck_failed: ${(e as Error).message}`);
        return result;
      }
      try {
        await api.addPharmacy(patientId, pharmacyId);
        result.pharmacyApplied = true;
        return result;
      } catch (e) {
        // Akute refuses the add when the chart is still missing e-prescribing
        // fields (phone, sex, DOB...). Surface it as a task instead of a silent log line.
        const message = (e as Error).message;
        result.notes.push(`pharmacy_add_failed: ${message}`);
        await ensurePharmacyTask(
          api,
          patientId,
          wanted,
          `Akute rejected the pharmacy add (${message.slice(0, 200)}). Check the chart's demographics, then add the pharmacy from the form response.`,
          result,
        );
        return result;
      }
    }

    await ensurePharmacyTask(
      api,
      patientId,
      wanted,
      "The patient's intake pharmacy could not be matched automatically. Add it from the form response in the chart.",
      result,
    );
  }

  return result;
}

/** One open physician task per patient, never more. */
async function ensurePharmacyTask(
  api: AkuteApi,
  patientId: string,
  wanted: ParsedPharmacy,
  reason: string,
  result: SyncResult,
): Promise<void> {
  const open = await api.listOpenTasks(patientId);
  const already = open.some((t) => String(t.task || t.title || "").startsWith(PHARMACY_TASK_TITLE));
  if (already) {
    result.notes.push("pharmacy_task_exists");
    return;
  }
  const lines = [
    reason,
    `Name: ${wanted.name || "-"}`,
    `Phone: ${wanted.phone || "-"}`,
    `Address: ${[wanted.address, wanted.city, wanted.state, wanted.zip].filter(Boolean).join(", ") || "-"}`,
  ];
  await api.createTask(patientId, PHARMACY_TASK_TITLE, lines.join("\n"));
  result.taskCreated = true;
}

/** Patient id carried by a webhook payload, if any. */
export function patientIdFromWebhook(
  resource: string,
  data: Record<string, unknown>,
): string | null {
  const direct = data.patient_id ?? (data.patient as Record<string, unknown> | undefined)?.id;
  if (direct != null && String(direct).trim()) return String(direct).trim();
  if (resource.includes("patient")) {
    const id = idOf(data);
    if (id) return id;
  }
  return null;
}

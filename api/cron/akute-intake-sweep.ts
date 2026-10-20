import type { VercelRequest, VercelResponse } from "@vercel/node";
import { akute, akuteConfigured, idOf, list } from "../_lib/akute/client";
import { cronAuthorized } from "../_lib/cronAuth";
import {
  parseIntakeResponse,
  syncPatientIntake,
  type QuestionnaireResponse,
  type SyncResult,
} from "../_lib/akute/intakeSync";

/**
 * Backup sweep for intake part 2 (home address + preferred pharmacy → chart).
 *
 * Walks active Akute patients, and for every one whose chart is still missing an
 * address or a pharmacy, applies the answers from their intake questionnaire
 * response (see api/_lib/akute/intakeSync.ts). Safe to run as often as you like.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this automatically
 * when CRON_SECRET is set) or `x-cron-secret: <CRON_SECRET>` (GitHub Actions).
 * Query: ?patient_id=<akute id> syncs one patient; ?limit=<n> caps patients scanned;
 * ?patient_id=<id>&debug=shape also returns the structure of that patient's
 * questionnaire responses (question ids, labels, group paths, answer types) and
 * which address / pharmacy fields the parser extracted — no answer values, so the
 * output can go into a CI log. ?debug=1 adds truncated answer previews; keep that
 * one to a terminal.
 */

export const config = { maxDuration: 60 };

const TIME_BUDGET_MS = 50_000;
const PAGE = 100;
const RECENT_DAYS = 30;

type PatientRow = Record<string, unknown>;

function preview(v: unknown): unknown {
  if (v == null) return v;
  if (typeof v === "string") return v.length > 16 ? `${v.slice(0, 16)}…` : v;
  if (typeof v === "object") return Array.isArray(v) ? `[array ${v.length}]` : `{${Object.keys(v).slice(0, 12).join(",")}}`;
  return v;
}

const presentKeys = (o: Record<string, unknown> | null) =>
  o ? Object.entries(o).filter(([, v]) => v != null && v !== "").map(([k]) => k) : [];

/**
 * `withAnswers=false` is structure only (safe for a CI log); `true` adds
 * 16-character answer previews for a terminal session.
 */
async function responseShape(patientId: string, withAnswers: boolean) {
  const responses = list(
    await akute(`/questionnaireresponses?${new URLSearchParams({ patient_id: patientId })}`),
  ) as QuestionnaireResponse[];
  return responses.map((r) => {
    const parsed = parseIntakeResponse(r);
    return {
      id: r.id ?? null,
      questionnaire_id: r.questionnaire_id ?? null,
      authored_at: r.authored_at ?? null,
      status: r.status ?? null,
      parsed: withAnswers
        ? {
            address: parsed.address
              ? { line1: preview(parsed.address.line1), city: parsed.address.city, state: parsed.address.state, zipcode: parsed.address.zipcode }
              : null,
            pharmacy: parsed.pharmacy
              ? { ...parsed.pharmacy, name: preview(parsed.pharmacy.name), address: preview(parsed.pharmacy.address) }
              : null,
          }
        : {
            addressFields: presentKeys(parsed.address as Record<string, unknown> | null),
            pharmacyFields: presentKeys(parsed.pharmacy as Record<string, unknown> | null),
          },
      entries: (Array.isArray(r.responses) ? r.responses : []).map((a) => ({
        question_id: a.question_id ?? null,
        question: a.question ?? null,
        path: a.path ?? null,
        answer_type: a.answer_type ?? null,
        answer_group_index: a.answer_group_index ?? null,
        ...(withAnswers ? { answer: preview(a.answer) } : { answered: a.answer != null && a.answer !== "" }),
      })),
    };
  });
}

function hasAddress(p: PatientRow): boolean {
  return Boolean(String(p.address_line_1 || "").trim() && String(p.address_zipcode || "").trim());
}

function createdRecently(p: PatientRow, days: number): boolean {
  const raw = p.created_at ?? p.createdAt ?? p.created;
  if (!raw) return true; // unknown age → keep it in scope
  const t = Date.parse(String(raw));
  if (!Number.isFinite(t)) return true;
  return Date.now() - t < days * 86_400_000;
}

/** Visit patients in a fresh random order each run, so a time-budget cutoff never starves the same tail. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

async function listActivePatients(max: number): Promise<PatientRow[]> {
  const out: PatientRow[] = [];
  for (let offset = 0; out.length < max; offset += PAGE) {
    const page = list(
      await akute(
        `/patients?${new URLSearchParams({ status: "active", limit: String(PAGE), offset: String(offset) })}`,
      ),
    ) as PatientRow[];
    out.push(...page);
    if (page.length < PAGE) break;
  }
  return out.slice(0, max);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  if (!cronAuthorized(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (!akuteConfigured()) {
    res.status(503).json({ error: "akute_not_configured" });
    return;
  }

  const started = Date.now();
  const single = String(req.query.patient_id || "").trim();
  const debugMode = String(req.query.debug || "");
  const debug = debugMode === "1" || debugMode === "shape";
  const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 2000);

  const results: SyncResult[] = [];
  const errors: Array<{ patientId: string; message: string }> = [];
  let scanned = 0;
  let candidates = 0;
  let truncated = false;
  let shape: Awaited<ReturnType<typeof responseShape>> | undefined;

  if (single) {
    try {
      results.push(await syncPatientIntake(single));
    } catch (e) {
      errors.push({ patientId: single, message: (e as Error).message });
    }
    if (debug) {
      try {
        shape = await responseShape(single, debugMode === "1");
      } catch (e) {
        errors.push({ patientId: single, message: `debug_shape_failed: ${(e as Error).message}` });
      }
    }
  } else {
    const patients = shuffle(await listActivePatients(limit));
    scanned = patients.length;
    for (const p of patients) {
      if (Date.now() - started > TIME_BUDGET_MS) {
        truncated = true;
        break;
      }
      const id = idOf(p);
      if (!id) continue;
      // Cheap pre-filter: a patient with an address on file is only re-checked while
      // recent (the pharmacy list needs its own call), everyone else is a candidate.
      if (hasAddress(p) && !createdRecently(p, RECENT_DAYS)) continue;
      candidates += 1;
      try {
        const r = await syncPatientIntake(id);
        if (r.addressApplied || r.pharmacyApplied || r.taskCreated) results.push(r);
      } catch (e) {
        errors.push({ patientId: id, message: (e as Error).message });
      }
    }
  }

  const summary = {
    ok: errors.length === 0,
    scanned,
    candidates,
    applied: results.length,
    addresses: results.filter((r) => r.addressApplied).length,
    pharmacies: results.filter((r) => r.pharmacyApplied).length,
    tasks: results.filter((r) => r.taskCreated).length,
    errors,
    truncated,
    ms: Date.now() - started,
  };
  console.log(JSON.stringify({ event: "akute_intake_sweep", ...summary }));
  res.status(200).json(shape ? { ...summary, results, responseShape: shape } : { ...summary, results });
}

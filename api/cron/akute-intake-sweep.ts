import type { VercelRequest, VercelResponse } from "@vercel/node";
import { timingSafeEqual } from "node:crypto";
import { akute, akuteConfigured, idOf, list } from "../_lib/akute/client";
import { syncPatientIntake, type SyncResult } from "../_lib/akute/intakeSync";

/**
 * Backup sweep for intake part 2 (home address + preferred pharmacy → chart).
 *
 * Walks active Akute patients, and for every one whose chart is still missing an
 * address or a pharmacy, applies the answers from their intake questionnaire
 * response (see api/_lib/akute/intakeSync.ts). Safe to run as often as you like.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this automatically
 * when CRON_SECRET is set) or `x-cron-secret: <CRON_SECRET>` (GitHub Actions).
 * Query: ?patient_id=<akute id> syncs one patient; ?limit=<n> caps patients scanned.
 */

export const config = { maxDuration: 60 };

const TIME_BUDGET_MS = 50_000;
const PAGE = 100;
const RECENT_DAYS = 30;

function authorized(req: VercelRequest): boolean {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const auth = String(req.headers.authorization || "");
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = String(req.headers["x-cron-secret"] || "").trim();
  const presented = bearer || header;
  if (!presented) return false;
  const a = Buffer.from(presented);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

type PatientRow = Record<string, unknown>;

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
  if (!authorized(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (!akuteConfigured()) {
    res.status(503).json({ error: "akute_not_configured" });
    return;
  }

  const started = Date.now();
  const single = String(req.query.patient_id || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 2000);

  const results: SyncResult[] = [];
  const errors: Array<{ patientId: string; message: string }> = [];
  let scanned = 0;
  let candidates = 0;
  let truncated = false;

  if (single) {
    try {
      results.push(await syncPatientIntake(single));
    } catch (e) {
      errors.push({ patientId: single, message: (e as Error).message });
    }
  } else {
    const patients = await listActivePatients(limit);
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
  res.status(200).json({ ...summary, results });
}

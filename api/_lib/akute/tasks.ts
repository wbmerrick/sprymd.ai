import { akute } from "./client";

/**
 * Create a physician task. Akute rejects some owner_id / field combos with
 * 500 "malformed data", so try richest body first and strip optional fields
 * (mirrors ispry-ai).
 */
export async function createTask(opts: {
  title: string;
  description: string;
  patientId: string;
  ownerId?: string;
  priority?: "p1" | "p2" | "p3";
  tags?: string[];
}): Promise<{ ok: true; withOwner: boolean }> {
  const today = new Date().toISOString().slice(0, 10);
  const base = { task: opts.title, status: "not-started" as const };
  const bodies = [
    {
      ...base,
      description: opts.description,
      due_date: today,
      owner_id: opts.ownerId,
      patient_id: opts.patientId,
      priority: opts.priority || "p2",
      tags: opts.tags,
    },
    {
      ...base,
      description: opts.description,
      due_date: today,
      owner_id: opts.ownerId,
      patient_id: opts.patientId,
      priority: opts.priority || "p2",
    },
    {
      ...base,
      description: opts.description,
      owner_id: opts.ownerId,
      patient_id: opts.patientId,
    },
    {
      ...base,
      description: opts.description,
      patient_id: opts.patientId,
    },
    {
      ...base,
      description: String(opts.description || "").slice(0, 2000),
      patient_id: opts.patientId,
    },
    { task: opts.title, patient_id: opts.patientId },
    { task: opts.title },
  ].map((b) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(b)) {
      if (v !== undefined && v !== null && v !== "") out[k] = v;
    }
    return out;
  });

  let lastErr: unknown = null;
  for (const body of bodies) {
    try {
      await akute("/tasks", { method: "POST", body: JSON.stringify(body) });
      return { ok: true, withOwner: Boolean(body.owner_id) };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("task_failed");
}

import { akute, idOf } from "./client";

export type NoteSection = { title: string; text: string };

/**
 * Create a clinical note (encounter) on the patient chart.
 * OpenAPI: POST /notes — type, authors, sections required.
 */
export async function createClinicalNote(opts: {
  patientId: string;
  authorUserId: string;
  type?: string;
  serviceDate?: string;
  sections: NoteSection[];
  status?: "preliminary" | "final";
}): Promise<string | null> {
  const body = {
    type: opts.type || "Progress note",
    patient_id: opts.patientId,
    service_date: opts.serviceDate || new Date().toISOString().slice(0, 10),
    status: opts.status || "preliminary",
    authors: [{ user_id: opts.authorUserId }],
    sections: opts.sections.filter((s) => s.title && s.text),
  };
  const created = await akute("/notes", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return idOf(created);
}

export function formatIntakeNoteSections(input: {
  answers?: Record<string, unknown>;
  chiefComplaint?: string;
  flags?: string[];
  consents?: string[];
  preferredPharmacy?: Record<string, unknown> | null;
}): NoteSection[] {
  const sections: NoteSection[] = [];
  if (input.chiefComplaint) {
    sections.push({ title: "Chief complaint", text: input.chiefComplaint });
  }
  if (input.flags?.length) {
    sections.push({ title: "Flags", text: input.flags.join("\n") });
  }
  if (input.consents?.length) {
    sections.push({ title: "Consents", text: input.consents.join("\n") });
  }
  if (input.preferredPharmacy) {
    sections.push({
      title: "Preferred pharmacy",
      text: JSON.stringify(input.preferredPharmacy, null, 2),
    });
  }
  if (input.answers && Object.keys(input.answers).length) {
    const lines = Object.entries(input.answers).map(
      ([k, v]) =>
        `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`,
    );
    sections.push({
      title: "Intake answers",
      text: lines.join("\n").slice(0, 12000),
    });
  }
  if (!sections.length) {
    sections.push({
      title: "Intake",
      text: "SpryMD intake submitted (see task).",
    });
  }
  return sections;
}

import { useEffect, useState } from "react";
import {
  saveSoapDraft,
  type SaveResult,
  type SoapDraft,
} from "@/lib/clinicalDrafts";

type SoapNoteEditorProps = {
  appointmentId: string;
  patientId?: string;
  providerId?: string;
  saveDelayMs?: number;
  saveDraft?: (draft: SoapDraft) => Promise<SaveResult>;
};

const FIELDS = [
  {
    key: "subjective",
    label: "Subjective",
    placeholder: "What the patient reports: onset, symptoms, history they describe.",
  },
  {
    key: "objective",
    label: "Objective",
    placeholder: "What you can observe on this telehealth visit. Do not invent vitals.",
  },
  {
    key: "assessment",
    label: "Assessment",
    placeholder: "Clinical impression and relevant risks.",
  },
  {
    key: "plan",
    label: "Plan",
    placeholder: "Next steps, prescriptions if appropriate, and follow-up.",
  },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export default function SoapNoteEditor({
  appointmentId,
  patientId,
  providerId,
  saveDelayMs = 500,
  saveDraft = saveSoapDraft,
}: SoapNoteEditorProps) {
  const [fields, setFields] = useState<Record<FieldKey, string>>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Drafts save as you type.");

  useEffect(() => {
    if (!dirty) return;
    const handle = window.setTimeout(() => {
      const draft: SoapDraft = {
        appointmentId,
        patientId,
        providerId,
        ...fields,
        status: "draft",
        updatedAt: new Date().toISOString(),
      };
      setSaving(true);
      void saveDraft(draft)
        .then((result) => setSaveMessage(result.message))
        .catch(() => setSaveMessage("Could not save this draft."))
        .finally(() => setSaving(false));
    }, saveDelayMs);
    return () => window.clearTimeout(handle);
  }, [appointmentId, dirty, fields, patientId, providerId, saveDelayMs, saveDraft]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="font-display text-navy text-3xl font-bold">SOAP note</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Appointment {appointmentId}
          </p>
        </div>
        <p
          role="status"
          aria-live="polite"
          data-testid="soap-save-status"
          className="font-body text-sm text-navy"
        >
          {saving ? "Saving draft…" : saveMessage}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <label key={field.key} className="card-base block space-y-2">
            <span className="font-display text-navy text-xl font-semibold">
              {field.label}
            </span>
            <textarea
              value={fields[field.key]}
              placeholder={field.placeholder}
              onChange={(event) => {
                setDirty(true);
                setFields((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }));
              }}
              className="w-full min-h-40 rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

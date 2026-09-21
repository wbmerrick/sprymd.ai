import { useEffect, useMemo, useState } from "react";
import {
  INTAKE_QUESTIONS,
  intakeSubmitBlock,
  listAnswer,
  textAnswer,
  type IntakeAnswers,
  type IntakeSection,
} from "@/data/intakeQuestions";
import {
  saveIntakeDraft,
  type IntakeDraft,
  type SaveResult,
} from "@/lib/clinicalDrafts";

const SECTIONS: IntakeSection[] = [
  "Chief complaint",
  "Past medical history",
  "Allergies",
];

type IntakeQuestionnaireProps = {
  draftId?: string;
  patientId?: string;
  appointmentId?: string;
  saveDelayMs?: number;
  saveDraft?: (draft: IntakeDraft) => Promise<SaveResult>;
  onSubmitted?: (draft: IntakeDraft) => void;
};

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `intake-${Date.now()}`;
}

export default function IntakeQuestionnaire({
  draftId,
  patientId,
  appointmentId,
  saveDelayMs = 500,
  saveDraft = saveIntakeDraft,
  onSubmitted,
}: IntakeQuestionnaireProps) {
  const [id] = useState(draftId || newId);
  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const [status, setStatus] = useState<"draft" | "submitted">("draft");
  const [dirty, setDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Drafts save as you type.");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const visible = useMemo(
    () => INTAKE_QUESTIONS.filter((question) => question.visible(answers)),
    [answers],
  );

  useEffect(() => {
    if (!dirty || status === "submitted") return;
    const handle = window.setTimeout(() => {
      const draft: IntakeDraft = {
        id,
        patientId,
        appointmentId,
        answers,
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
  }, [answers, appointmentId, dirty, id, patientId, saveDelayMs, saveDraft, status]);

  function update(questionId: string, value: string | string[]) {
    setDirty(true);
    setSubmitError(null);
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function toggleMulti(questionId: string, option: string) {
    const current = listAnswer(answers, questionId);
    let next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    if (option === "none") next = current.includes("none") ? [] : ["none"];
    if (option !== "none") next = next.filter((item) => item !== "none");
    update(questionId, next);
  }

  async function submit() {
    const block = intakeSubmitBlock(answers);
    if (block) {
      setSubmitError(block);
      return;
    }
    const draft: IntakeDraft = {
      id,
      patientId,
      appointmentId,
      answers,
      status: "submitted",
      updatedAt: new Date().toISOString(),
    };
    setSaving(true);
    try {
      const result = await saveDraft(draft);
      setStatus("submitted");
      setDirty(false);
      setSaveMessage(result.message);
      onSubmitted?.(draft);
    } catch {
      setSubmitError("Could not submit the intake.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="font-display text-navy text-3xl md:text-4xl font-bold mb-3">
          Visit intake
        </h1>
        <p className="font-body text-muted-foreground">
          Chief complaint, medical history, and allergies. Follow-up questions
          appear from your answers.
        </p>
      </div>

      <p
        role="status"
        aria-live="polite"
        data-testid="intake-save-status"
        className="font-body text-sm text-center text-navy"
      >
        {saving ? "Saving draft…" : saveMessage}
      </p>

      {SECTIONS.map((section) => {
        const questions = visible.filter((question) => question.section === section);
        if (questions.length === 0) return null;
        return (
          <section key={section} className="card-base space-y-5">
            <h2 className="font-display text-navy text-2xl font-semibold">{section}</h2>
            {questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <p className="font-body text-navy font-medium">{question.prompt}</p>
                {question.kind === "text" ? (
                  <textarea
                    value={textAnswer(answers, question.id)}
                    placeholder={question.placeholder}
                    onChange={(event) => update(question.id, event.target.value)}
                    className="w-full min-h-28 rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary"
                  />
                ) : (
                  <div className="grid gap-2">
                    {question.options?.map((option) => {
                      const selected =
                        question.kind === "multi"
                          ? listAnswer(answers, question.id).includes(option.value)
                          : answers[question.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            question.kind === "multi"
                              ? toggleMulti(question.id, option.value)
                              : update(question.id, option.value)
                          }
                          className={`text-left rounded-xl border-2 p-3 font-body text-navy ${
                            selected
                              ? "border-primary bg-primary/10 font-semibold"
                              : "border-gray-light"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {question.id === "ed_nitrates" && answers.ed_nitrates === "yes" && (
                  <p role="alert" className="font-body text-sm text-red-600">
                    Nitrate medications can make some ED treatments unsafe. A
                    clinician still needs this on the chart before any
                    prescription decision.
                  </p>
                )}
              </div>
            ))}
          </section>
        );
      })}

      {submitError && (
        <p role="alert" className="font-body text-sm text-center text-red-600">
          {submitError}
        </p>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          className="btn-primary px-8 disabled:opacity-60"
          onClick={() => void submit()}
          disabled={status === "submitted" || saving}
        >
          {status === "submitted" ? "Intake submitted" : "Submit intake"}
        </button>
      </div>
    </div>
  );
}

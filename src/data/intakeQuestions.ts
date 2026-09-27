export type AnswerValue = string | string[];
export type IntakeAnswers = Record<string, AnswerValue>;

export type IntakeSection = "Chief complaint" | "Past medical history" | "Allergies";

export type IntakeQuestion = {
  id: string;
  section: IntakeSection;
  prompt: string;
  kind: "multi" | "single" | "text";
  options?: { value: string; label: string }[];
  placeholder?: string;
  visible: (answers: IntakeAnswers) => boolean;
};

function includes(answers: IntakeAnswers, id: string, value: string): boolean {
  const current = answers[id];
  return Array.isArray(current) && current.includes(value);
}

function is(answers: IntakeAnswers, id: string, value: string): boolean {
  return answers[id] === value;
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    id: "chief_complaints",
    section: "Chief complaint",
    prompt: "What do you want help with today?",
    kind: "multi",
    options: [
      { value: "ed", label: "Erectile dysfunction" },
      { value: "energy", label: "Low energy or testosterone concerns" },
      { value: "weight", label: "Weight management" },
      { value: "hair", label: "Hair loss" },
      { value: "other", label: "Something else" },
    ],
    visible: () => true,
  },
  {
    id: "chief_complaint_detail",
    section: "Chief complaint",
    prompt: "Describe the concern in your own words.",
    kind: "text",
    placeholder: "When it started, what you have tried, and what you want from this visit.",
    visible: () => true,
  },
  {
    id: "ed_duration",
    section: "Chief complaint",
    prompt: "How long has this been going on?",
    kind: "single",
    options: [
      { value: "under_3_months", label: "Less than 3 months" },
      { value: "3_to_12_months", label: "3–12 months" },
      { value: "over_a_year", label: "More than a year" },
    ],
    visible: (answers) => includes(answers, "chief_complaints", "ed"),
  },
  {
    id: "ed_nitrates",
    section: "Chief complaint",
    prompt: "Do you take nitrates for chest pain (for example nitroglycerin)?",
    kind: "single",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
      { value: "unsure", label: "I'm not sure" },
    ],
    visible: (answers) => includes(answers, "chief_complaints", "ed"),
  },
  {
    id: "weight_goal",
    section: "Chief complaint",
    prompt: "What weight outcome are you hoping for?",
    kind: "text",
    placeholder: "Starting point, goal, and any prior weight-loss treatment.",
    visible: (answers) => includes(answers, "chief_complaints", "weight"),
  },
  {
    id: "past_medical_history",
    section: "Past medical history",
    prompt: "Which of these are part of your history?",
    kind: "multi",
    options: [
      { value: "none", label: "None of these" },
      { value: "hypertension", label: "High blood pressure" },
      { value: "diabetes", label: "Diabetes" },
      { value: "heart_disease", label: "Heart disease" },
      { value: "sleep_apnea", label: "Sleep apnea" },
      { value: "prostate", label: "Prostate disease" },
      { value: "depression", label: "Depression or anxiety" },
    ],
    visible: () => true,
  },
  {
    id: "past_medical_history_notes",
    section: "Past medical history",
    prompt: "Other medical history, surgeries, or medications.",
    kind: "text",
    placeholder: "Optional if you selected a condition above. Required if none of the boxes fit.",
    visible: () => true,
  },
  {
    id: "allergy_status",
    section: "Allergies",
    prompt: "Do you have medication or other allergies?",
    kind: "single",
    options: [
      { value: "none", label: "No known allergies" },
      { value: "has_allergies", label: "Yes — I need to list them" },
      { value: "unknown", label: "I'm not sure" },
    ],
    visible: () => true,
  },
  {
    id: "allergy_disclosure",
    section: "Allergies",
    prompt: "List each allergy and the reaction.",
    kind: "text",
    placeholder: "Example: penicillin — rash. Do not leave this blank if you have allergies.",
    visible: (answers) => is(answers, "allergy_status", "has_allergies"),
  },
];

export function listAnswer(answers: IntakeAnswers, id: string): string[] {
  const value = answers[id];
  return Array.isArray(value) ? value : [];
}

export function textAnswer(answers: IntakeAnswers, id: string): string {
  const value = answers[id];
  return typeof value === "string" ? value : "";
}

export function intakeSubmitBlock(answers: IntakeAnswers): string | null {
  if (listAnswer(answers, "chief_complaints").length === 0) {
    return "Select at least one chief complaint.";
  }
  if (!textAnswer(answers, "chief_complaint_detail").trim()) {
    return "Describe your chief complaint.";
  }
  const history = listAnswer(answers, "past_medical_history");
  const historyNotes = textAnswer(answers, "past_medical_history_notes").trim();
  if (history.length === 0 && !historyNotes) {
    return "Add past medical history, or select none of these.";
  }
  const allergyStatus = textAnswer(answers, "allergy_status");
  if (!allergyStatus) {
    return "Tell us whether you have allergies.";
  }
  if (
    allergyStatus === "has_allergies" &&
    !textAnswer(answers, "allergy_disclosure").trim()
  ) {
    return "List your allergies and reactions before submitting.";
  }
  return null;
}

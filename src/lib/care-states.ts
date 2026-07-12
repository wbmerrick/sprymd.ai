export type CareState =
  | "draft_intake"
  | "paid"
  | "under_review"
  | "prescribed"
  | "fulfilled"
  | "active_care"
  | "refill_due"
  | "declined"
  | "cancelled";

export const CARE_STATE_ORDER: CareState[] = [
  "draft_intake",
  "paid",
  "under_review",
  "prescribed",
  "fulfilled",
  "active_care",
  "refill_due",
];

export const CARE_STATE_LABELS: Record<CareState, string> = {
  draft_intake: "Complete intake",
  paid: "Payment received",
  under_review: "Physician review",
  prescribed: "Prescription issued",
  fulfilled: "Medication shipped",
  active_care: "Active care",
  refill_due: "Refill due",
  declined: "Not approved",
  cancelled: "Cancelled",
};

export const CARE_STATE_DESCRIPTIONS: Record<CareState, string> = {
  draft_intake: "Finish your health questionnaire so your physician can review your case.",
  paid: "Your consultation fee is confirmed. Complete your medical intake next.",
  under_review: "A board-certified physician is reviewing your intake within 24 hours.",
  prescribed: "Your prescription has been sent to our licensed pharmacy partner.",
  fulfilled: "Your medication is on its way in discreet packaging.",
  active_care: "You're on treatment. Message your care team anytime with questions.",
  refill_due: "Your refill window is open. Request a renewal when you're ready.",
  declined: "Your physician determined this treatment isn't appropriate. Contact support for options.",
  cancelled: "This visit was cancelled. Start a new consultation anytime.",
};

export type TimelineStepStatus = "complete" | "active" | "pending";

export interface TimelineStep {
  key: CareState;
  label: string;
  description: string;
  status: TimelineStepStatus;
}

const terminalStates: CareState[] = ["declined", "cancelled"];

export const isTerminalCareState = (state: CareState): boolean =>
  terminalStates.includes(state);

export const getCareStateIndex = (state: CareState): number => {
  const idx = CARE_STATE_ORDER.indexOf(state);
  return idx === -1 ? 0 : idx;
};

export const canTransition = (from: CareState, to: CareState): boolean => {
  if (isTerminalCareState(from)) return false;
  if (isTerminalCareState(to)) return true;
  return getCareStateIndex(to) >= getCareStateIndex(from);
};

export const getTimelineSteps = (currentState: CareState): TimelineStep[] => {
  if (isTerminalCareState(currentState)) {
    return [
      {
        key: currentState,
        label: CARE_STATE_LABELS[currentState],
        description: CARE_STATE_DESCRIPTIONS[currentState],
        status: "active",
      },
    ];
  }

  const currentIndex = getCareStateIndex(currentState);

  return CARE_STATE_ORDER.map((state, index) => {
    let status: TimelineStepStatus = "pending";
    if (index < currentIndex) status = "complete";
    else if (index === currentIndex) status = "active";

    return {
      key: state,
      label: CARE_STATE_LABELS[state],
      description: CARE_STATE_DESCRIPTIONS[state],
      status,
    };
  });
};

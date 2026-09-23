/** Mirrored from /shared for Vercel API bundling — keep in sync with shared/. */
import { isLicensedState, licensedStateNames } from "./licensedStates";
import { stateName } from "./usStates";

export type ComplianceAnswers = {
  cashPayTermsAccepted: boolean;
  telehealthLimitationsAcknowledged: boolean;
  /** Two-letter code for the state where the patient is physically located. */
  physicalState: string;
};

export const EMPTY_COMPLIANCE: ComplianceAnswers = {
  cashPayTermsAccepted: false,
  telehealthLimitationsAcknowledged: false,
  physicalState: "",
};

/**
 * Returns a patient-facing block reason, or null when payment may proceed.
 * Shared by the checkout UI and the Checkout Session API.
 */
export function complianceBlockReason(answers: ComplianceAnswers): string | null {
  if (!answers.cashPayTermsAccepted) {
    return "Accept the cash-pay terms of service to continue.";
  }
  if (!answers.telehealthLimitationsAcknowledged) {
    return "Acknowledge that telehealth has clinical limitations to continue.";
  }
  const state = answers.physicalState.trim().toUpperCase();
  if (!state) {
    return "Select the state where you are physically located right now.";
  }
  if (!isLicensedState(state)) {
    const name = stateName(state) ?? state;
    return `Providers are not licensed in ${name}. You must be physically located in ${licensedStateNames().join(", ")} to continue.`;
  }
  return null;
}

export function canProceedToPayment(answers: ComplianceAnswers): boolean {
  return complianceBlockReason(answers) === null;
}

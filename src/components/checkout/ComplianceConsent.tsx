import { Link } from "react-router-dom";
import {
  complianceBlockReason,
  type ComplianceAnswers,
} from "../../../shared/complianceGate";
import { isLicensedState } from "../../../shared/licensedStates";
import { US_STATES } from "../../../shared/usStates";

type ComplianceConsentProps = {
  value: ComplianceAnswers;
  onChange: (next: ComplianceAnswers) => void;
  /** Practice name shown in consent copy. */
  brandName?: string;
};

export default function ComplianceConsent({
  value,
  onChange,
  brandName = "SpryMD",
}: ComplianceConsentProps) {
  const stateSelected = value.physicalState.trim().length > 0;
  const licensed = stateSelected && isLicensedState(value.physicalState);
  const unlicensedReason =
    stateSelected && !licensed ? complianceBlockReason({ ...value, cashPayTermsAccepted: true, telehealthLimitationsAcknowledged: true }) : null;

  return (
    <fieldset className="card-base max-w-xl mx-auto space-y-5 text-left">
      <legend className="font-display text-navy text-xl font-semibold px-1">
        Before payment
      </legend>
      <p className="font-body text-sm text-muted-foreground">
        Cash-pay care is not billed to insurance. You must be physically
        located in a state where the provider is licensed.
      </p>

      <label className="flex items-start gap-3 font-body text-sm text-navy">
        <input
          type="checkbox"
          className="mt-1"
          checked={value.cashPayTermsAccepted}
          onChange={(event) =>
            onChange({ ...value, cashPayTermsAccepted: event.target.checked })
          }
        />
        <span>
          I agree to the cash-pay{" "}
          <Link to="/terms" className="underline underline-offset-2">
            Terms of Service
          </Link>
          . {brandName} does not bill my insurance for this care.
        </span>
      </label>

      <label className="flex items-start gap-3 font-body text-sm text-navy">
        <input
          type="checkbox"
          className="mt-1"
          checked={value.telehealthLimitationsAcknowledged}
          onChange={(event) =>
            onChange({
              ...value,
              telehealthLimitationsAcknowledged: event.target.checked,
            })
          }
        />
        <span>
          I understand telehealth has clinical limitations. It is not emergency
          care, it does not replace primary care, and a prescription is not
          guaranteed.
        </span>
      </label>

      <div>
        <label
          htmlFor="physical-state"
          className="font-body text-navy text-sm font-medium mb-1 block"
        >
          State where you are physically located right now
        </label>
        <select
          id="physical-state"
          value={value.physicalState}
          onChange={(event) =>
            onChange({ ...value, physicalState: event.target.value })
          }
          className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy bg-card focus:outline-none focus:border-primary"
        >
          <option value="">Select a state</option>
          {US_STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      {unlicensedReason && (
        <p role="alert" className="font-body text-sm text-red-600">
          {unlicensedReason}
        </p>
      )}
      {licensed && (
        <p className="font-body text-sm text-navy">
          Licensed state confirmed for this visit.
        </p>
      )}
    </fieldset>
  );
}

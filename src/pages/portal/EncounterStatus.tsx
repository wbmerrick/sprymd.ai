import type { CareState } from "@/lib/care-states";
import { CARE_STATE_DESCRIPTIONS, CARE_STATE_LABELS } from "@/lib/care-states";
import OnboardingTimeline from "@/components/OnboardingTimeline";

interface EncounterStatusProps {
  careState: CareState;
  serviceLine?: string;
  updatedAt?: string;
}

const EncounterStatus = ({ careState, serviceLine, updatedAt }: EncounterStatusProps) => (
  <div className="card-base">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div>
        <p className="section-label mb-1">Care status</p>
        <h2 className="font-display text-foreground text-xl font-bold">
          {CARE_STATE_LABELS[careState]}
        </h2>
        <p className="font-body text-muted-foreground text-sm mt-1">
          {CARE_STATE_DESCRIPTIONS[careState]}
        </p>
      </div>
      {serviceLine && (
        <span className="inline-flex self-start rounded-full bg-primary/10 text-primary text-xs font-semibold font-body px-3 py-1.5 uppercase tracking-wide">
          {serviceLine === "weight" ? "Weight loss" : "ED treatment"}
        </span>
      )}
    </div>

    <div className="bg-off-white rounded-xl border border-gray-light p-6">
      <OnboardingTimeline careState={careState} />
    </div>

    {updatedAt && (
      <p className="font-body text-muted-foreground text-xs mt-4">
        Last updated {new Date(updatedAt).toLocaleString()}
      </p>
    )}
  </div>
);

export default EncounterStatus;

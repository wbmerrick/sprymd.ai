import { Check } from "lucide-react";
import type { CareState } from "@/lib/care-states";
import { getTimelineSteps } from "@/lib/care-states";

interface OnboardingTimelineProps {
  careState: CareState;
  compact?: boolean;
  className?: string;
}

const OnboardingTimeline = ({ careState, compact = false, className = "" }: OnboardingTimelineProps) => {
  const steps = getTimelineSteps(careState);

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step) => (
        <div key={step.key} className="flex items-start gap-3">
          {step.status === "complete" ? (
            <div className="w-6 h-6 rounded-full bg-green flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          ) : step.status === "active" ? (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse-dot" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-light flex-shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <span
              className={`font-body text-sm block ${
                step.status === "pending" ? "text-muted-foreground" : "text-foreground font-medium"
              }`}
            >
              {step.label}
            </span>
            {!compact && (
              <span className="font-body text-xs text-muted-foreground mt-0.5 block">
                {step.description}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OnboardingTimeline;

import { cn } from "@/lib/utils";
import type { MessageUrgency } from "@/types/dashboard";
import { urgencyLabel } from "@/lib/messaging";

const STYLES: Record<MessageUrgency, string> = {
  routine: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  soon: "bg-amber-500/15 text-amber-200 border-amber-500/35",
  urgent: "bg-rose-500/20 text-rose-200 border-rose-500/40",
};

interface UrgencyBadgeProps {
  urgency?: MessageUrgency | null;
  className?: string;
}

export function UrgencyBadge({ urgency = "routine", className }: UrgencyBadgeProps) {
  const key = urgency || "routine";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        STYLES[key],
        className,
      )}
    >
      {urgencyLabel(key)}
    </span>
  );
}

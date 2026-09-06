import { cn } from "@/lib/utils";

export type ChipStatus =
  | "active"
  | "pending"
  | "expiring_soon"
  | "inactive"
  | "scheduled"
  | "processing"
  | "shipped"
  | "delivered"
  | "no_action"
  | "action_required"
  | "paid"
  | "refunded"
  | string;

const LABELS: Record<string, string> = {
  active: "Active",
  pending: "Pending review",
  expiring_soon: "Expiring soon",
  inactive: "Inactive",
  scheduled: "Scheduled",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  no_action: "No action needed",
  action_required: "Action required",
  paid: "Paid",
  refunded: "Refunded",
};

const STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  expiring_soon: "bg-orange-500/15 text-orange-200 border-orange-500/35",
  inactive: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
  scheduled: "bg-sky-500/15 text-sky-200 border-sky-500/30",
  processing: "bg-violet-500/15 text-violet-200 border-violet-500/30",
  shipped: "bg-orange-500/15 text-orange-200 border-orange-500/30",
  delivered: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  no_action: "bg-zinc-500/15 text-zinc-300 border-zinc-500/25",
  action_required: "bg-rose-500/15 text-rose-200 border-rose-500/35",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  refunded: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
};

interface StatusChipProps {
  status: ChipStatus;
  label?: string;
  className?: string;
}

/** Shared status badge used across Current Management, Support, Goals, Orders. */
export function StatusChip({ status, label, className }: StatusChipProps) {
  const key = String(status).toLowerCase().replace(/\s+/g, "_");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        STYLES[key] || STYLES.inactive,
        className,
      )}
    >
      {label || LABELS[key] || status}
    </span>
  );
}

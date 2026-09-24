import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Treatment } from "@/types/dashboard";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { formatDateRange } from "@/lib/dashboardFormat";
import { sortTreatmentsByStatus } from "@/hooks/useDashboardData";

interface CurrentManagementProps {
  treatments: Treatment[];
}

/** Single source of truth for active therapy cards on Home. */
export function CurrentManagement({ treatments }: CurrentManagementProps) {
  const sorted = sortTreatmentsByStatus(treatments);

  return (
    <section aria-labelledby="current-management-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="current-management-heading" className="text-lg font-semibold text-white font-display">
            Your treatments
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Active care plans linked to your goals.</p>
        </div>
        <Link to="/dashboard/goals" className="inline-flex items-center gap-1 text-sm text-[#C89E67] hover:underline">
          All goals <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-zinc-500">
          No active treatments yet. Start a care plan from the SpryMD home page.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {sorted.map((tx) => (
            <li key={tx.id}>
              <Link
                to={`/dashboard/goals/${tx.id}`}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-[#C89E67]/40 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium text-white group-hover:text-[#C89E67] transition-colors">
                    {tx.medicationName}
                  </h3>
                  <StatusChip status={tx.status} />
                </div>
                <p className="mt-1 text-sm text-zinc-400">{tx.dosage}</p>
                <p className="mt-3 font-mono text-[11px] tracking-wide text-zinc-500">
                  {formatDateRange(tx.startDate, tx.refillThroughDate)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  <span className="text-zinc-500">Goal · </span>
                  {tx.goal}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

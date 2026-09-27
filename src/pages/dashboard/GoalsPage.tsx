import { Link } from "react-router-dom";
import { ChevronRight, Target, Trash2 } from "lucide-react";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { formatShortDate } from "@/lib/dashboardFormat";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";
import type { Treatment } from "@/types/dashboard";
import { computeBmi } from "@/data/wearables";

function groupByCategory(treatments: Treatment[]) {
  const map = new Map<string, Treatment[]>();
  for (const t of treatments) {
    const list = map.get(t.category) || [];
    list.push(t);
    map.set(t.category, list);
  }
  return Array.from(map.entries());
}

export default function GoalsPage() {
  const { treatments, bodyGoals, bodyProfile, removeBodyGoal } = useDashboard();
  const groups = groupByCategory(treatments);
  const bmi = computeBmi(bodyProfile?.heightCm, bodyProfile?.weightLb);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C89E67]">Care</p>
        <h1 className="text-3xl font-semibold text-white font-display">
          Goals
        </h1>
        <p className="text-sm text-zinc-400">
          Body targets and care plans linked to your SpryMD account.
        </p>
      </header>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-[#C89E67]" />
          <h2 className="text-sm font-semibold text-white font-display">
            Body goals
          </h2>
        </div>
        <p className="mb-3 font-mono text-[11px] text-zinc-500">
          Height {bodyProfile?.heightCm != null ? `${bodyProfile.heightCm} cm` : "—"} · Weight{" "}
          {bodyProfile?.weightLb != null ? `${bodyProfile.weightLb} lb` : "—"} · BMI {bmi ?? "—"}
        </p>
        {(bodyGoals || []).length === 0 ? (
          <p className="text-sm text-zinc-500">No body goals yet. Update height and weight from Profile.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {bodyGoals.map((g) => (
              <li key={g.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{g.title}</p>
                  <p className="font-mono text-[11px] text-zinc-500">
                    {g.metric} · {g.currentValue ?? "—"} → {g.targetValue} {g.unit} · {g.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBodyGoal(g.id)}
                  className="rounded-md p-2 text-zinc-500 hover:bg-white/5 hover:text-rose-300"
                  aria-label={`Delete ${g.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {groups.map(([category, items]) => (
        <section key={category} aria-labelledby={`cat-${category}`}>
          <h2 id={`cat-${category}`} className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-zinc-500">
            {category}
          </h2>
          <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
            {items.map((tx) => (
              <li key={tx.id}>
                <Link
                  to={`/dashboard/goals/${tx.id}`}
                  className="flex items-center gap-4 px-4 py-4 transition hover:bg-white/[0.04]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{tx.medicationName}</p>
                    <p className="mt-1 text-sm text-zinc-400">{tx.goal}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                      <StatusChip status={tx.status} />
                      <span>Next refill through {formatShortDate(tx.refillThroughDate)}</span>
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

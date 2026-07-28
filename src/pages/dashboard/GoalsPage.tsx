import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { formatShortDate } from "@/lib/dashboardFormat";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";
import type { Treatment } from "@/types/dashboard";

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
  const { treatments } = useDashboard();
  const groups = groupByCategory(treatments);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1EC8A5]">Care</p>
        <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          Goals
        </h1>
        <p className="text-sm text-zinc-400">Every treatment on your account, grouped by category.</p>
      </header>

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

import type { ReactNode } from "react";

/** Shared chrome for master finance / member charts. */
export function MasterChartPanel({
  title,
  hint,
  children,
  empty,
  isEmpty,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  empty?: string;
  isEmpty?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/35 p-4 md:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {hint ? <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">{hint}</p> : null}
      </div>
      {isEmpty ? (
        <div className="flex h-[220px] items-center justify-center">
          <p className="max-w-xs text-center text-sm text-zinc-500">{empty || "No data yet."}</p>
        </div>
      ) : (
        <div className="h-[220px] w-full">{children}</div>
      )}
    </section>
  );
}

export const MASTER_CHART = {
  grid: "rgba(255,255,255,0.06)",
  tick: "#71717a",
  tooltip: {
    background: "#0a1210",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: 8,
    fontSize: 12,
  },
  emerald: "#34d399",
  emeraldMuted: "#10b981",
  amber: "#fbbf24",
  zinc: "#a1a1aa",
} as const;

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { formatUsd, loadMasterOpsSnapshot, type MasterOpsSnapshot } from "@/lib/masterOps";
import { formatRelative } from "@/lib/dashboardFormat";

export default function MasterFinancePage() {
  const { email } = useOutletContext<{ email: string }>();
  const [snap, setSnap] = useState<MasterOpsSnapshot | null>(null);

  useEffect(() => {
    void loadMasterOpsSnapshot(email).then(setSnap);
  }, [email]);

  if (!snap) {
    return <p className="text-sm text-zinc-500">Loading finance telemetry…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400/90">Finance</p>
        <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          Cash & payment integrity
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Totals from Stripe-linked <code className="text-emerald-300/90">payment_events</code>. Use this to catch
          webhook gaps before they become silent revenue loss.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Lifetime recorded" value={formatUsd(snap.finance.grossCents)} />
        <Card label="Last 7 days" value={formatUsd(snap.finance.last7dCents)} />
        <Card label="Last 30 days" value={formatUsd(snap.finance.last30dCents)} />
        <Card label="Avg ticket" value={formatUsd(snap.finance.avgTicketCents)} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <div className="border-b border-white/10 bg-black/40 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Recent payment events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {snap.finance.recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    No payment events yet.
                  </td>
                </tr>
              ) : (
                snap.finance.recent.map((p) => (
                  <tr key={p.id} className="border-t border-white/5 text-zinc-300">
                    <td className="px-4 py-2.5 whitespace-nowrap">{formatRelative(p.createdAt)}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px]">{p.eventType}</td>
                    <td className="px-4 py-2.5">{p.status || "—"}</td>
                    <td className="px-4 py-2.5 font-medium text-white">{formatUsd(p.amountCents)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-black/35 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

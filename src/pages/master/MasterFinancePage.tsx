import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd, loadMasterOpsSnapshot, type MasterOpsSnapshot } from "@/lib/masterOps";
import { formatRelative } from "@/lib/dashboardFormat";
import { MASTER_CHART, MasterChartPanel } from "@/components/master/MasterChartPanel";

const EVENT_COLORS = ["#34d399", "#10b981", "#6ee7b7", "#a7f3d0", "#059669", "#047857"];

export default function MasterFinancePage() {
  const { email } = useOutletContext<{ email: string }>();
  const [snap, setSnap] = useState<MasterOpsSnapshot | null>(null);

  useEffect(() => {
    void loadMasterOpsSnapshot(email).then(setSnap);
  }, [email]);

  const revenueSeries = useMemo(() => {
    if (!snap) return [];
    return snap.finance.dailyRevenue.map((d) => ({
      ...d,
      dollars: Math.round(d.cents / 100),
    }));
  }, [snap]);

  const eventSeries = useMemo(() => {
    if (!snap) return [];
    return snap.finance.byEventType.map((e) => ({
      name: e.name.replace(/_/g, " "),
      dollars: Math.round((e.cents || 0) / 100),
      count: e.count,
    }));
  }, [snap]);

  if (!snap) {
    return <p className="text-sm text-zinc-500">Loading finance telemetry…</p>;
  }

  const hasRevenue = snap.finance.dailyRevenue.some((d) => d.cents > 0);
  const hasEvents = eventSeries.length > 0;

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

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MasterChartPanel
            title="Revenue · last 30 days"
            hint={`${formatUsd(snap.finance.last30dCents)} in window`}
            isEmpty={!hasRevenue}
            empty="No payment events in the last 30 days. Confirm Stripe webhooks are delivering."
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="masterRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={MASTER_CHART.emerald} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={MASTER_CHART.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={MASTER_CHART.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: MASTER_CHART.tick, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                />
                <YAxis
                  tick={{ fill: MASTER_CHART.tick, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  contentStyle={MASTER_CHART.tooltip}
                  labelStyle={{ color: "#a1a1aa" }}
                  formatter={(value: number, _name, item) => [
                    formatUsd((item?.payload?.cents as number) || value * 100),
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="dollars"
                  stroke={MASTER_CHART.emerald}
                  fill="url(#masterRevFill)"
                  strokeWidth={1.75}
                  isAnimationActive
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </MasterChartPanel>
        </div>

        <div className="lg:col-span-2">
          <MasterChartPanel
            title="By event type"
            hint={`${snap.finance.paymentEvents} events`}
            isEmpty={!hasEvents}
            empty="No payment event types to chart yet."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventSeries} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid stroke={MASTER_CHART.grid} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: MASTER_CHART.tick, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={96}
                  tick={{ fill: MASTER_CHART.tick, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={MASTER_CHART.tooltip}
                  labelStyle={{ color: "#a1a1aa" }}
                  formatter={(value: number, _name, item) => [
                    `${formatUsd(value * 100)} · ${item?.payload?.count ?? 0} events`,
                    "Amount",
                  ]}
                />
                <Bar dataKey="dollars" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {eventSeries.map((_, i) => (
                    <Cell key={eventSeries[i].name} fill={EVENT_COLORS[i % EVENT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </MasterChartPanel>
        </div>
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

import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { loadMasterOpsSnapshot, type MasterOpsSnapshot } from "@/lib/masterOps";
import { formatRelative } from "@/lib/dashboardFormat";
import { MASTER_CHART, MasterChartPanel } from "@/components/master/MasterChartPanel";

export default function MasterMembersPage() {
  const { email } = useOutletContext<{ email: string }>();
  const [snap, setSnap] = useState<MasterOpsSnapshot | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void loadMasterOpsSnapshot(email).then(setSnap);
  }, [email]);

  const filtered = useMemo(() => {
    if (!snap) return [];
    const q = query.trim().toLowerCase();
    if (!q) return snap.members.rows;
    return snap.members.rows.filter(
      (m) =>
        m.email.toLowerCase().includes(q) ||
        m.fullName.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q),
    );
  }, [snap, query]);

  const stripePie = useMemo(() => {
    if (!snap) return [];
    const { linked, missing } = snap.members.stripeMix;
    return [
      { name: "Stripe linked", value: linked },
      { name: "Missing id", value: missing },
    ].filter((d) => d.value > 0);
  }, [snap]);

  if (!snap) {
    return <p className="text-sm text-zinc-500">Loading member log…</p>;
  }

  const hasSignups = snap.members.dailySignups.some((d) => d.count > 0) || snap.members.total > 0;
  const hasStates = snap.members.byState.length > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400/90">Members</p>
        <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          Membership ledger
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Every patient row on the platform — growth, Stripe linkage, and state coverage for compliance planning.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total members" value={String(snap.members.total)} />
        <Stat label="New · 7d" value={String(snap.members.last7d)} />
        <Stat label="New · 30d" value={String(snap.members.last30d)} />
        <Stat label="Stripe linked" value={String(snap.members.withStripe)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MasterChartPanel
            title="Membership growth · last 30 days"
            hint={`${snap.members.last30d} new · ${snap.members.total} total`}
            isEmpty={!hasSignups}
            empty="No members yet. Growth will appear here as patients join."
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snap.members.dailySignups} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="masterMemFill" x1="0" y1="0" x2="0" y2="1">
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
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={MASTER_CHART.tooltip}
                  labelStyle={{ color: "#a1a1aa" }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "cumulative" ? "Total members" : "New that day",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="cumulative"
                  stroke={MASTER_CHART.emerald}
                  fill="url(#masterMemFill)"
                  strokeWidth={1.75}
                  isAnimationActive
                  animationDuration={500}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="count"
                  stroke={MASTER_CHART.amber}
                  fill="transparent"
                  strokeWidth={1.25}
                  strokeDasharray="4 3"
                  isAnimationActive
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </MasterChartPanel>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <MasterChartPanel
            title="Stripe linkage"
            hint={`${snap.members.withStripe}/${snap.members.total} linked`}
            isEmpty={stripePie.length === 0}
            empty="No members to chart Stripe linkage."
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stripePie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {stripePie.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.name === "Stripe linked" ? MASTER_CHART.emerald : MASTER_CHART.amber}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={MASTER_CHART.tooltip}
                  labelStyle={{ color: "#a1a1aa" }}
                  formatter={(value: number, name: string) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </MasterChartPanel>
        </div>
      </div>

      <MasterChartPanel
        title="Members by state"
        hint="Top states"
        isEmpty={!hasStates}
        empty="No state data on member rows yet."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={snap.members.byState} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={MASTER_CHART.grid} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: MASTER_CHART.tick, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: MASTER_CHART.tick, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={MASTER_CHART.tooltip}
              labelStyle={{ color: "#a1a1aa" }}
              formatter={(value: number) => [value, "Members"]}
            />
            <Bar dataKey="count" fill={MASTER_CHART.emeraldMuted} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </MasterChartPanel>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, email, or state…"
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none"
      />

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Member</th>
                <th className="px-4 py-2 font-medium">State</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2 font-medium">Billing</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    No members match.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-t border-white/5 text-zinc-300">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-white">{m.fullName}</p>
                      <p className="text-[11px] text-zinc-500">{m.email}</p>
                    </td>
                    <td className="px-4 py-2.5">{m.state || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{formatRelative(m.createdAt)}</td>
                    <td className="px-4 py-2.5">
                      {m.stripeCustomerId ? (
                        <span className="text-emerald-300">Linked</span>
                      ) : (
                        <span className="text-amber-200/90">Missing Stripe id</span>
                      )}
                    </td>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Landmark,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { formatUsd, loadMasterOpsSnapshot, type MasterOpsSnapshot } from "@/lib/masterOps";
import { buildOpsBriefing } from "@/lib/masterAiAdvisor";
import { cn } from "@/lib/utils";

export default function MasterHomePage() {
  const { email, name } = useOutletContext<{ email: string; name: string }>();
  const [snap, setSnap] = useState<MasterOpsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setSnap(await loadMasterOpsSnapshot(email));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ops snapshot");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [email]);

  const first = name.trim().split(/\s+/)[0] || "Owner";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400/90">
            Command center
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Keep the venture healthy, {first}
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400">
            Owner-only view of cash, membership growth, clinical queues, and AI priorities — plus full staff tools
            in the nav.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh telemetry
        </button>
      </header>

      {error && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
          {error}
        </p>
      )}

      {snap && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Venture health"
              value={`${snap.health.score}`}
              suffix="/100"
              hint="Composite of queues + growth + cash signals"
              tone={snap.health.score >= 80 ? "good" : snap.health.score >= 60 ? "warn" : "bad"}
            />
            <Metric
              label="Members"
              value={String(snap.members.total)}
              hint={`+${snap.members.last7d} / 7d · +${snap.members.last30d} / 30d`}
              tone="neutral"
            />
            <Metric
              label="Revenue recorded"
              value={formatUsd(snap.finance.grossCents)}
              hint={`${formatUsd(snap.finance.last30dCents)} last 30d`}
              tone="neutral"
            />
            <Metric
              label="Urgent patient threads"
              value={String(snap.clinical.patientInboxUrgent)}
              hint={`${snap.clinical.pendingCharts} charts pending`}
              tone={snap.clinical.patientInboxUrgent > 0 ? "bad" : "good"}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <section className="space-y-3 rounded-2xl border border-emerald-500/25 bg-black/40 p-5 lg:col-span-3">
              <div className="flex items-center gap-2 text-emerald-300">
                <Activity className="h-4 w-4" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">Live briefing</h2>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300">
                {buildOpsBriefing(snap)}
              </pre>
              <Link
                to="/master/ai"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Open AI advisor
                <ArrowRight className="h-3 w-3" />
              </Link>
            </section>

            <section className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 lg:col-span-2">
              <div className="flex items-center gap-2 text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">Safeguards</h2>
              </div>
              {snap.health.alerts.length === 0 ? (
                <p className="text-sm text-zinc-500">No active alerts. Keep daily inbox + chart review habits.</p>
              ) : (
                <ul className="space-y-2">
                  {snap.health.alerts.map((a) => (
                    <li
                      key={a}
                      className="rounded-lg border border-amber-500/20 bg-amber-950/30 px-3 py-2 text-xs text-amber-100"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/master/finance"
                  className="inline-flex items-center gap-2 text-xs text-zinc-300 hover:text-emerald-300"
                >
                  <Landmark className="h-3.5 w-3.5" /> Finance ledger
                </Link>
                <Link
                  to="/master/members"
                  className="inline-flex items-center gap-2 text-xs text-zinc-300 hover:text-emerald-300"
                >
                  <Users className="h-3.5 w-3.5" /> Member log
                </Link>
                <Link
                  to="/staff"
                  className="inline-flex items-center gap-2 text-xs text-zinc-300 hover:text-emerald-300"
                >
                  Jump to clinical staff tools
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  suffix,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  suffix?: string;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  const border =
    tone === "good"
      ? "border-emerald-500/30"
      : tone === "warn"
        ? "border-amber-500/30"
        : tone === "bad"
          ? "border-rose-500/30"
          : "border-white/10";
  return (
    <div className={cn("rounded-2xl border bg-black/35 p-4", border)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">
        {value}
        {suffix && <span className="text-sm font-normal text-zinc-500">{suffix}</span>}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

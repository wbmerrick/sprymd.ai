import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import type { OpsOutletContext } from "./OpsLayout";

type QueueItem = {
  id: string;
  status: string;
  serviceTier: string;
  amountCents: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  providerId: string | null;
  patient: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    state?: string;
  } | null;
};

const STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "needs_attention", label: "Needs attention" },
  { id: "paid", label: "Paid" },
  { id: "awaiting_payment", label: "Awaiting pay" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "scheduled", label: "Scheduled" },
  { id: "no_show", label: "No-show" },
] as const;

const STATUS_PRIORITY: Record<string, number> = {
  paid: 0,
  awaiting_payment: 1,
  scheduled: 2,
  completed: 3,
  no_show: 4,
  cancelled: 5,
};

function money(cents: number, currency = "usd") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format((cents || 0) / 100);
  } catch {
    return `$${((cents || 0) / 100).toFixed(2)}`;
  }
}

function relativeTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const delta = Date.now() - t;
  const abs = Math.abs(delta);
  const mins = Math.round(abs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function statusTone(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
    case "awaiting_payment":
      return "bg-amber-500/15 text-amber-100 border-amber-500/30";
    case "completed":
      return "bg-sky-500/15 text-sky-100 border-sky-500/30";
    case "cancelled":
    case "no_show":
      return "bg-rose-500/15 text-rose-100 border-rose-500/30";
    default:
      return "bg-white/10 text-white/80 border-white/15";
  }
}

function nextAction(item: QueueItem): string {
  switch (item.status) {
    case "paid":
      return item.providerId ? "Open visit / write note" : "Assign & start visit";
    case "awaiting_payment":
      return "Waiting on checkout";
    case "scheduled":
      return "Confirm visit time";
    case "completed":
      return "Review chart";
    case "cancelled":
    case "no_show":
      return "Closed";
    default:
      return "Review";
  }
}

function matchesSearch(item: QueueItem, q: string) {
  if (!q) return true;
  const hay = [
    item.patient?.fullName,
    item.patient?.email,
    item.patient?.phone,
    item.patient?.state,
    item.id,
    item.serviceTier,
    item.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export default function OpsQueuePage() {
  const { accessToken } = useOutletContext<OpsOutletContext>();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const qParam = params.get("q") || "";
  const [query, setQuery] = useState(qParam);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiStatus =
    status && status !== "needs_attention" ? status : "";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (apiStatus) qs.set("status", apiStatus);
      qs.set("limit", "100");
      const res = await fetch(`/api/ops/queue?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        items?: QueueItem[];
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(data.message || data.error || "Unable to load ops queue.");
        setItems([]);
        return;
      }
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, apiStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void load();
    }, 45_000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  const attentionCount = useMemo(
    () => items.filter((i) => i.status === "paid").length,
    [items],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = items.filter((item) => matchesSearch(item, q));
    if (status === "needs_attention") {
      rows = rows.filter((i) => i.status === "paid");
    }
    return [...rows].sort((a, b) => {
      const pa = STATUS_PRIORITY[a.status] ?? 9;
      const pb = STATUS_PRIORITY[b.status] ?? 9;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, query, status]);

  const filterCounts = useMemo(() => {
    const map: Record<string, number> = { needs_attention: 0 };
    for (const item of items) {
      map[item.status] = (map[item.status] || 0) + 1;
      if (item.status === "paid") map.needs_attention += 1;
    }
    return map;
  }, [items]);

  function setFilter(id: string) {
    const next = new URLSearchParams(params);
    if (id) next.set("status", id);
    else next.delete("status");
    setParams(next, { replace: true });
  }

  function commitSearch(value: string) {
    const next = new URLSearchParams(params);
    const trimmed = value.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    setParams(next, { replace: true });
  }

  return (
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#9dba8c]/90">
            Queue
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-2">
            Cases & orders
          </h1>
          <p className="text-sm text-white/55 mt-2 max-w-xl">
            Work paid visits first. Open a row to assign yourself, start the
            visit, or update fulfillment status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="self-start rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      {!loading && !error && attentionCount > 0 && status !== "needs_attention" && (
        <button
          type="button"
          onClick={() => setFilter("needs_attention")}
          className="mb-6 w-full text-left rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 hover:bg-emerald-500/15 transition-colors"
        >
          <span className="text-sm text-emerald-100">
            <span className="font-medium">{attentionCount} paid</span>
            {" "}
            {attentionCount === 1 ? "case needs" : "cases need"} clinician attention →
          </span>
        </button>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <label className="flex-1 relative">
          <span className="sr-only">Search patients</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitSearch(query);
            }}
            onBlur={() => commitSearch(query)}
            placeholder="Search name, email, state, or id…"
            className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm placeholder:text-white/35 focus:outline-none focus:border-[#9dba8c]/60"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.id;
          const count = f.id ? filterCounts[f.id] : items.length;
          return (
            <button
              key={f.id || "all"}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                active
                  ? "bg-[#9dba8c] text-[#0b100e] border-[#9dba8c]"
                  : "border-white/15 text-white/70 hover:border-white/35"
              }`}
            >
              {f.label}
              {typeof count === "number" && count > 0 ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
        >
          {error}
          {(error === "staff_required" || error.includes("staff")) && (
            <p className="mt-2 text-rose-100/80">
              Sign in with an allowlisted staff email, or add yourself to the{" "}
              <code className="text-xs">providers</code> table. Server env:{" "}
              <code className="text-xs">OPS_STAFF_EMAILS</code>.
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 text-[11px] tracking-wider uppercase text-white/40 border-b border-white/10">
          <div className="col-span-2">Status</div>
          <div className="col-span-4">Patient</div>
          <div className="col-span-2">Next step</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">When</div>
        </div>

        {loading ? (
          <ul className="divide-y divide-white/10" aria-busy="true" aria-label="Loading queue">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="px-4 py-5 animate-pulse">
                <div className="grid md:grid-cols-12 gap-3">
                  <div className="md:col-span-2 h-5 rounded-full bg-white/10 w-20" />
                  <div className="md:col-span-4 space-y-2">
                    <div className="h-4 rounded bg-white/10 w-40" />
                    <div className="h-3 rounded bg-white/5 w-56" />
                  </div>
                  <div className="md:col-span-2 h-4 rounded bg-white/10 w-24" />
                  <div className="md:col-span-2 h-4 rounded bg-white/10 w-16" />
                  <div className="md:col-span-2 h-3 rounded bg-white/5 w-14" />
                </div>
              </li>
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <div className="px-4 py-10 text-sm text-white/45 space-y-2">
            <p>No cases in this view.</p>
            {query && (
              <p>
                Clear search or try another filter — paid checkouts appear here
                after Stripe confirms.
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {visible.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/ops/${item.id}`}
                  className="grid md:grid-cols-12 gap-2 md:gap-3 px-4 py-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="md:col-span-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] capitalize ${statusTone(item.status)}`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                    {item.status === "paid" && !item.providerId && (
                      <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-100">
                        Unassigned
                      </span>
                    )}
                  </div>
                  <div className="md:col-span-4 min-w-0">
                    <div className="font-medium truncate">
                      {item.patient?.fullName || "Unnamed patient"}
                    </div>
                    <div className="text-xs text-white/45 truncate">
                      {item.patient?.email || "—"}
                      {item.patient?.state ? ` · ${item.patient.state}` : ""}
                      {item.serviceTier ? ` · ${item.serviceTier}` : ""}
                    </div>
                  </div>
                  <div className="md:col-span-2 text-sm text-white/70">
                    {nextAction(item)}
                  </div>
                  <div className="md:col-span-2 text-sm">
                    {money(item.amountCents, item.currency)}
                  </div>
                  <div className="md:col-span-2 text-xs text-white/45">
                    <span title={item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}>
                      {relativeTime(item.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

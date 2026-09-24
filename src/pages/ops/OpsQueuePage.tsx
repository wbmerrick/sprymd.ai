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
  { id: "paid", label: "Paid" },
  { id: "awaiting_payment", label: "Awaiting pay" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "scheduled", label: "Scheduled" },
  { id: "no_show", label: "No-show" },
] as const;

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

export default function OpsQueuePage() {
  const { accessToken } = useOutletContext<OpsOutletContext>();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (status) qs.set("status", status);
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
  }, [accessToken, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      map[item.status] = (map[item.status] || 0) + 1;
    }
    return map;
  }, [items]);

  return (
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#9dba8c]/90">Queue</p>
          <h1 className="font-display text-3xl md:text-4xl mt-2">Cases & orders</h1>
          <p className="text-sm text-white/55 mt-2 max-w-xl">
            Paid visits, intakes, and fulfillment status. Open a row to review the patient, update status, or jump to the visit / SOAP note.
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

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.id;
          return (
            <button
              key={f.id || "all"}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(params);
                if (f.id) next.set("status", f.id);
                else next.delete("status");
                setParams(next, { replace: true });
              }}
              className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                active
                  ? "bg-[#9dba8c] text-[#0b100e] border-[#9dba8c]"
                  : "border-white/15 text-white/70 hover:border-white/35"
              }`}
            >
              {f.label}
              {f.id && counts[f.id] ? ` · ${counts[f.id]}` : ""}
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
          <div className="col-span-2">Tier</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Created</div>
        </div>

        {loading ? (
          <p className="px-4 py-10 text-sm text-white/45">Loading queue…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-10 text-sm text-white/45">No cases in this filter.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/ops/${item.id}`}
                  className="grid md:grid-cols-12 gap-2 md:gap-3 px-4 py-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="md:col-span-2">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] capitalize ${statusTone(item.status)}`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="md:col-span-4 min-w-0">
                    <div className="font-medium truncate">
                      {item.patient?.fullName || "Unnamed patient"}
                    </div>
                    <div className="text-xs text-white/45 truncate">
                      {item.patient?.email || "—"}
                      {item.patient?.state ? ` · ${item.patient.state}` : ""}
                    </div>
                  </div>
                  <div className="md:col-span-2 text-sm text-white/75">
                    {item.serviceTier}
                  </div>
                  <div className="md:col-span-2 text-sm">
                    {money(item.amountCents, item.currency)}
                  </div>
                  <div className="md:col-span-2 text-xs text-white/45">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "—"}
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

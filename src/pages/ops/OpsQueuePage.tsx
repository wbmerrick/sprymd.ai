import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import type { OpsOutletContext } from "./OpsLayout";
import { DEMO_QUEUE, DEMO_STAFF } from "./opsDemoData";
import {
  money,
  nextActionLabel,
  relativeTime,
  statusLabel,
  statusTone,
  STATUS_PRIORITY,
  withDemo,
  type OpsQueueItem,
} from "./opsHelpers";

const VIEW_FILTERS = [
  { id: "todo", label: "To do" },
  { id: "mine", label: "Mine" },
  { id: "waiting", label: "Waiting" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
] as const;

type ViewId = (typeof VIEW_FILTERS)[number]["id"];

function matchesSearch(item: OpsQueueItem, q: string) {
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
  const { accessToken, demo, providerId: layoutProviderId } =
    useOutletContext<OpsOutletContext>();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = (params.get("view") as ViewId) || "todo";
  const qParam = params.get("q") || "";
  const [query, setQuery] = useState(qParam);
  const [items, setItems] = useState<OpsQueueItem[]>([]);
  const [staffProviderId, setStaffProviderId] = useState<string | null>(
    layoutProviderId,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const [launchHint, setLaunchHint] = useState<string | null>(null);

  // Migrate legacy ?status= to view filters once
  useEffect(() => {
    const legacy = params.get("status");
    if (!legacy || params.get("view")) return;
    const next = new URLSearchParams(params);
    next.delete("status");
    if (legacy === "needs_attention" || legacy === "paid") next.set("view", "todo");
    else if (legacy === "awaiting_payment") next.set("view", "waiting");
    else if (legacy === "completed") next.set("view", "done");
    else next.set("view", "all");
    setParams(next, { replace: true });
  }, [params, setParams]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (!silent) setLoading(true);
    setError(null);
    if (demo) {
      setItems(DEMO_QUEUE);
      setStaffProviderId(DEMO_STAFF.providerId);
      if (!silent) setLoading(false);
      return;
    }
    try {
      const qs = new URLSearchParams({ limit: "100" });
      const res = await fetch(`/api/ops/queue?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        items?: OpsQueueItem[];
        staff?: { providerId?: string | null };
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(data.message || data.error || "Unable to load ops queue.");
        if (!silent) setItems([]);
        return;
      }
      setItems(data.items || []);
      if (data.staff?.providerId) setStaffProviderId(data.staff.providerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      if (!silent) setItems([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [accessToken, demo]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (demo || !accessToken) {
      setLaunchHint(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ops/status", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          launch?: {
            hasPaidVisit?: boolean;
            hasPaymentLedger?: boolean;
            awaitingPayment?: number;
            videoReady?: boolean;
          };
          paymentEvents?: number;
        };
        if (cancelled) return;
        if (!data.launch?.hasPaidVisit) {
          const awaiting = data.launch?.awaitingPayment ?? 0;
          setLaunchHint(
            awaiting > 0
              ? `No paid visits yet · ${awaiting} awaiting Stripe. Use Sync after a completed checkout.`
              : "No paid visits in the clinical DB yet. Complete one Stripe checkout to unlock the live queue.",
          );
        } else if (!data.launch?.hasPaymentLedger) {
          setLaunchHint(
            "Paid visits found, but payment_events ledger is empty — check Stripe webhooks.",
          );
        } else if (data.launch?.videoReady === false) {
          setLaunchHint(
            "Cash-pay + ledger are live. Launch model is async chart review — video keys (Daily/Twilio) are optional.",
          );
        } else {
          setLaunchHint(null);
        }
      } catch {
        /* non-blocking */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, demo, items.length]);

  useEffect(() => {
    if (demo) return;
    const id = window.setInterval(() => void load({ silent: true }), 45_000);
    return () => window.clearInterval(id);
  }, [load, demo]);

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  const myProviderId = staffProviderId || layoutProviderId;

  const counts = useMemo(() => {
    const todo = items.filter((i) => i.status === "paid").length;
    const mine = items.filter(
      (i) => myProviderId && i.providerId === myProviderId && i.status === "paid",
    ).length;
    const waiting = items.filter((i) => i.status === "awaiting_payment").length;
    const done = items.filter((i) => i.status === "completed").length;
    return { todo, mine, waiting, done, all: items.length };
  }, [items, myProviderId]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = items.filter((item) => matchesSearch(item, q));
    switch (view) {
      case "todo":
        rows = rows.filter((i) => i.status === "paid");
        break;
      case "mine":
        rows = rows.filter(
          (i) => myProviderId && i.providerId === myProviderId && i.status === "paid",
        );
        break;
      case "waiting":
        rows = rows.filter((i) => i.status === "awaiting_payment");
        break;
      case "done":
        rows = rows.filter((i) => i.status === "completed");
        break;
      default:
        break;
    }
    return [...rows].sort((a, b) => {
      const pa = STATUS_PRIORITY[a.status] ?? 9;
      const pb = STATUS_PRIORITY[b.status] ?? 9;
      if (pa !== pb) return pa - pb;
      const unassigned = Number(!!a.providerId) - Number(!!b.providerId);
      if (view === "todo" && unassigned !== 0) return unassigned;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, query, view, myProviderId]);

  function setView(id: ViewId) {
    const next = new URLSearchParams(params);
    next.set("view", id);
    next.delete("status");
    setParams(next, { replace: true });
  }

  function commitSearch(value: string) {
    const next = new URLSearchParams(params);
    const trimmed = value.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    setParams(next, { replace: true });
  }

  async function syncAwaitingPayments() {
    if (demo || reconciling) return;
    setReconciling(true);
    try {
      const res = await fetch("/api/ops/reconcile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allAwaiting: true }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        scanned?: number;
        paid?: number;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        toast.error(json.message || json.error || "Could not sync payments");
        return;
      }
      const paid = json.paid ?? 0;
      const scanned = json.scanned ?? 0;
      const cancelled = (json as { cancelled?: number }).cancelled ?? 0;
      if (paid > 0) {
        toast.success(
          `Synced ${paid} payment${paid === 1 ? "" : "s"} from Stripe (${scanned} checked)`,
        );
      } else if (cancelled > 0) {
        toast.message(
          `Cleared ${cancelled} expired checkout${cancelled === 1 ? "" : "s"} · none newly paid`,
        );
      } else {
        toast.message(
          scanned > 0
            ? `Checked ${scanned} checkout${scanned === 1 ? "" : "s"} — none paid yet`
            : "No awaiting checkouts to sync",
        );
      }
      await load({ silent: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally {
      setReconciling(false);
    }
  }

  async function claimAndOpen(item: OpsQueueItem, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (demo) {
      navigate(withDemo(`/ops/${item.id}`, true));
      return;
    }
    setStartingId(item.id);
    try {
      if (!item.providerId) {
        const res = await fetch(
          `/api/ops/appointment?id=${encodeURIComponent(item.id)}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ assignSelf: true }),
          },
        );
        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as {
            error?: string;
            message?: string;
          };
          toast.error(json.message || json.error || "Could not assign case");
          return;
        }
        toast.success("Assigned — opening chart");
      }
      navigate(`/ops/${item.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally {
      setStartingId(null);
    }
  }

  return (
    <main className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#9dba8c]/90">
            Today
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-2">Patient queue</h1>
          <p className="text-sm text-white/55 mt-2 max-w-lg">
            Paid visits first. Claim a case, review intake, document the decision,
            then pharmacy or refund.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            Refresh
          </button>
          {!demo && counts.waiting > 0 && (
            <button
              type="button"
              disabled={reconciling}
              onClick={() => void syncAwaitingPayments()}
              className="rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-50 hover:bg-amber-500/20 disabled:opacity-50"
            >
              {reconciling ? "Syncing…" : `Sync ${counts.waiting} awaiting`}
            </button>
          )}
        </div>
      </div>

      {demo && (
        <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-50/90">
          Demo mode — sample cases only. Live queue needs a deployed API + staff session.
        </div>
      )}

      {!demo && launchHint && (
        <div className="mb-5 rounded-2xl border border-sky-400/25 bg-sky-500/10 px-4 py-3 text-sm text-sky-50/90">
          {launchHint}
        </div>
      )}

      {counts.todo > 0 && view !== "todo" && (
        <button
          type="button"
          onClick={() => setView("todo")}
          className="mb-5 w-full text-left rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 hover:bg-emerald-500/15 transition-colors"
        >
          <span className="text-sm text-emerald-100">
            <span className="font-medium">{counts.todo} waiting</span> for a clinician →
          </span>
        </button>
      )}

      <label className="block mb-4">
        <span className="sr-only">Search patients</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitSearch(query);
          }}
          onBlur={() => commitSearch(query)}
          placeholder="Search name, email, or state…"
          className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm placeholder:text-white/35 focus:outline-none focus:border-[#9dba8c]/60"
        />
      </label>

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Queue views">
        {VIEW_FILTERS.map((f) => {
          const active = view === f.id;
          const count = counts[f.id];
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setView(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs border transition-colors ${
                active
                  ? "bg-[#9dba8c] text-[#0b100e] border-[#9dba8c]"
                  : "border-white/15 text-white/70 hover:border-white/35"
              }`}
            >
              {f.label}
              {count > 0 ? ` · ${count}` : ""}
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
              Sign in with an allowlisted staff email, or add an active{" "}
              <code className="text-xs">providers</code> row. Env:{" "}
              <code className="text-xs">OPS_STAFF_EMAILS</code>.
            </p>
          )}
          <p className="mt-2">
            <Link to="/ops?demo=1" className="underline underline-offset-4">
              Preview with demo data
            </Link>
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 text-[11px] tracking-wider uppercase text-white/40 border-b border-white/10">
          <div className="col-span-5">Patient</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">When</div>
          <div className="col-span-3">Action</div>
        </div>

        {loading ? (
          <ul className="divide-y divide-white/10" aria-busy="true" aria-label="Loading queue">
            {[0, 1, 2].map((i) => (
              <li key={i} className="px-4 py-5 animate-pulse">
                <div className="h-10 rounded-xl bg-white/5" />
              </li>
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <div className="px-4 py-12 text-center space-y-2">
            <p className="text-sm text-white/70">
              {view === "todo" ? "Nothing waiting — nice work." : "No cases in this view."}
            </p>
            <p className="text-xs text-white/40">
              New paid checkouts show up here after Stripe confirms.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {visible.map((item) => {
              const canStart = item.status === "paid";
              return (
                <li key={item.id}>
                  <div className="grid md:grid-cols-12 gap-3 px-4 py-4 items-center hover:bg-white/[0.03] transition-colors">
                    <Link
                      to={withDemo(`/ops/${item.id}`, demo)}
                      className="md:col-span-5 min-w-0 block"
                    >
                      <div className="font-medium truncate">
                        {item.patient?.fullName || "Unnamed patient"}
                      </div>
                      <div className="text-xs text-white/45 truncate mt-0.5">
                        {item.patient?.email || "—"}
                        {item.patient?.state ? ` · ${item.patient.state}` : ""}
                        {` · ${money(item.amountCents, item.currency)}`}
                      </div>
                    </Link>
                    <div className="md:col-span-2 flex flex-wrap gap-1.5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] capitalize ${statusTone(item.status)}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                      {item.status === "paid" && !item.providerId && (
                        <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-100">
                          Unassigned
                        </span>
                      )}
                    </div>
                    <div className="md:col-span-2 text-xs text-white/45">
                      {relativeTime(item.paidAt || item.createdAt)}
                    </div>
                    <div className="md:col-span-3 flex flex-wrap gap-2">
                      {canStart ? (
                        <button
                          type="button"
                          disabled={startingId === item.id}
                          onClick={(e) => void claimAndOpen(item, e)}
                          className="rounded-full bg-[#9dba8c] text-[#0b100e] px-3.5 py-1.5 text-xs font-medium disabled:opacity-50"
                        >
                          {startingId === item.id
                            ? "Opening…"
                            : nextActionLabel(item)}
                        </button>
                      ) : (
                        <span className="text-xs text-white/45 self-center">
                          {nextActionLabel(item)}
                        </span>
                      )}
                      <Link
                        to={withDemo(`/ops/${item.id}`, demo)}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:border-white/35"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

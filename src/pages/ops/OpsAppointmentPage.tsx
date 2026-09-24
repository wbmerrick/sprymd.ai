import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import type { OpsOutletContext } from "./OpsLayout";

type DetailResponse = {
  appointment: {
    id: string;
    status: string;
    serviceTier: string;
    amountCents: number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    providerId: string | null;
    stripeCheckoutSessionId: string | null;
    patient: {
      id: string;
      email: string;
      fullName: string;
      phone?: string;
      state?: string;
      dateOfBirth?: string;
    } | null;
  };
  payments: Array<{
    id: string;
    event_type: string;
    status: string | null;
    amount_cents: number | null;
    created_at: string;
  }>;
  intakes: Array<{
    id: string;
    status: string;
    summary: string;
    updatedAt: string;
  }>;
};

const NEXT_STATUSES = [
  "paid",
  "completed",
  "cancelled",
  "no_show",
  "awaiting_payment",
  "scheduled",
] as const;

function money(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format((cents || 0) / 100);
}

export default function OpsAppointmentPage() {
  const { appointmentId = "" } = useParams();
  const { accessToken } = useOutletContext<OpsOutletContext>();
  const [data, setData] = useState<DetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/ops/appointment?id=${encodeURIComponent(appointmentId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const json = (await res.json().catch(() => ({}))) as DetailResponse & {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(json.message || json.error || "Unable to load appointment.");
        setData(null);
        return;
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, appointmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/ops/appointment?id=${encodeURIComponent(appointmentId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(json.message || json.error || "Update failed.");
        return;
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="px-4 md:px-8 py-10 max-w-4xl mx-auto text-sm text-white/50">
        Loading case…
      </main>
    );
  }

  if (!data?.appointment) {
    return (
      <main className="px-4 md:px-8 py-10 max-w-4xl mx-auto">
        <Link to="/ops" className="text-sm text-white/55 underline underline-offset-4">
          ← Queue
        </Link>
        <p role="alert" className="mt-6 text-rose-200">
          {error || "Case not found."}
        </p>
      </main>
    );
  }

  const a = data.appointment;
  const patient = a.patient;

  return (
    <main className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
      <Link to="/ops" className="text-sm text-white/55 underline underline-offset-4">
        ← Queue
      </Link>

      <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#9dba8c]/90">
            Case
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-2">
            {patient?.fullName || "Patient"}
          </h1>
          <p className="text-sm text-white/55 mt-2">
            {patient?.email || "—"}
            {patient?.phone ? ` · ${patient.phone}` : ""}
            {patient?.state ? ` · ${patient.state}` : ""}
          </p>
          <p className="text-xs text-white/35 mt-2 font-mono break-all">{a.id}</p>
        </div>
        <div className="text-right">
          <div className="text-sm capitalize text-white/70">
            {a.status.replace(/_/g, " ")}
          </div>
          <div className="font-display text-2xl mt-1">
            {money(a.amountCents, a.currency)}
          </div>
          <div className="text-xs text-white/45 mt-1">{a.serviceTier}</div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
        >
          {error}
        </div>
      )}

      <section className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="text-sm font-medium mb-3">Actions</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Link
              to={`/visit/${a.id}`}
              className="rounded-full bg-[#9dba8c] text-[#0b100e] px-4 py-2 text-sm font-medium"
            >
              Open visit room
            </Link>
            <Link
              to={`/provider/notes?appointmentId=${encodeURIComponent(a.id)}`}
              className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
            >
              SOAP note
            </Link>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch({ assignSelf: true })}
              className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Assign to me
            </button>
          </div>
          <label className="block text-xs text-white/45 mb-2">Update status</label>
          <div className="flex flex-wrap gap-2">
            {NEXT_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                disabled={busy || a.status === status}
                onClick={() => void patch({ status })}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs capitalize disabled:opacity-40 hover:border-white/40"
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="text-sm font-medium mb-3">Timeline</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">Created</dt>
              <dd>{a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">Paid</dt>
              <dd>{a.paidAt ? new Date(a.paidAt).toLocaleString() : "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">Provider</dt>
              <dd className="font-mono text-xs">{a.providerId || "Unassigned"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">Stripe session</dt>
              <dd className="font-mono text-[10px] truncate max-w-[180px]">
                {a.stripeCheckoutSessionId || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 p-5">
        <h2 className="text-sm font-medium mb-3">Payment events</h2>
        {data.payments.length === 0 ? (
          <p className="text-sm text-white/45">No ledger rows yet.</p>
        ) : (
          <ul className="divide-y divide-white/10 text-sm">
            {data.payments.map((p) => (
              <li key={p.id} className="py-3 flex justify-between gap-3">
                <div>
                  <div>{p.event_type}</div>
                  <div className="text-xs text-white/40">
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div>{p.status || "—"}</div>
                  <div className="text-xs text-white/45">
                    {p.amount_cents != null ? money(p.amount_cents) : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 p-5">
        <h2 className="text-sm font-medium mb-3">Recent intakes</h2>
        {data.intakes.length === 0 ? (
          <p className="text-sm text-white/45">
            No chart intakes for this patient yet (device-only answers may still exist).
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {data.intakes.map((intake) => (
              <li key={intake.id} className="rounded-xl border border-white/10 p-3">
                <div className="flex justify-between gap-3 text-xs text-white/45 mb-2">
                  <span className="capitalize">{intake.status}</span>
                  <span>{new Date(intake.updatedAt).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-wrap text-white/80 line-clamp-6">
                  {intake.summary || "No summary"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

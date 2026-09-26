import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { OpsOutletContext } from "./OpsLayout";
import { getDemoDetail } from "./opsDemoData";
import {
  ageFromDob,
  guidance,
  money,
  statusLabel,
  withDemo,
  type OpsDetailResponse,
} from "./opsHelpers";
import {
  openStripeRefundDeepLink,
  stripeRefundDeepLink,
} from "@/lib/stripeDashboardLinks";

const PRIMARY_BY_STATUS: Record<string, string[]> = {
  paid: ["completed", "cancelled"],
  awaiting_payment: ["paid", "cancelled"],
  scheduled: ["paid", "cancelled", "no_show"],
  completed: [],
  cancelled: ["paid"],
  no_show: ["paid"],
};

const ALL_STATUSES = [
  "paid",
  "completed",
  "cancelled",
  "no_show",
  "awaiting_payment",
  "scheduled",
] as const;

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

export default function OpsAppointmentPage() {
  const { appointmentId = "" } = useParams();
  const { accessToken, demo } = useOutletContext<OpsOutletContext>();
  const navigate = useNavigate();
  const [data, setData] = useState<OpsDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pharmacyNotes, setPharmacyNotes] = useState("");
  const [pharmacyStatus, setPharmacyStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (demo) {
      const detail = getDemoDetail(appointmentId);
      setData(detail);
      if (!detail) setError("Demo case not found.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/ops/appointment?id=${encodeURIComponent(appointmentId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const json = (await res.json().catch(() => ({}))) as OpsDetailResponse & {
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
  }, [accessToken, appointmentId, demo]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data?.appointment) return;
    setPharmacyNotes(data.appointment.pharmacyNotes || "");
    setPharmacyStatus(data.appointment.pharmacyStatus || "");
  }, [data?.appointment]);

  async function patch(body: Record<string, unknown>, successMessage?: string) {
    if (demo) {
      toast.message("Demo mode — status changes are not saved");
      if (body.status && data) {
        setData({
          ...data,
          appointment: {
            ...data.appointment,
            status: String(body.status),
            providerId:
              body.assignSelf === true
                ? data.appointment.providerId || "demo-provider"
                : data.appointment.providerId,
          },
        });
      } else if (body.assignSelf && data) {
        setData({
          ...data,
          appointment: {
            ...data.appointment,
            providerId: data.appointment.providerId || "demo-provider",
          },
        });
        toast.success("Assigned (demo)");
      } else if (
        (body.pharmacyStatus != null || body.pharmacyNotes != null) &&
        data
      ) {
        setData({
          ...data,
          appointment: {
            ...data.appointment,
            pharmacyStatus:
              typeof body.pharmacyStatus === "string"
                ? body.pharmacyStatus
                : data.appointment.pharmacyStatus,
            pharmacyNotes:
              typeof body.pharmacyNotes === "string"
                ? body.pharmacyNotes
                : data.appointment.pharmacyNotes,
            pharmacySentAt:
              body.pharmacyStatus === "sent"
                ? new Date().toISOString()
                : data.appointment.pharmacySentAt,
          },
        });
        toast.success(successMessage || "Updated (demo)");
      }
      return true;
    }

    const nextStatus = typeof body.status === "string" ? body.status : null;
    if (
      nextStatus &&
      (nextStatus === "cancelled" || nextStatus === "no_show") &&
      !window.confirm(`Mark this case as ${statusLabel(nextStatus)}?`)
    ) {
      return false;
    }

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
        const msg = json.message || json.error || "Update failed.";
        setError(msg);
        toast.error(msg);
        return false;
      }
      toast.success(successMessage || "Updated");
      await load();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function startVisit() {
    if (!data?.appointment) return;
    if (!data.appointment.providerId) {
      const ok = await patch({ assignSelf: true }, "Assigned to you");
      if (!ok && !demo) return;
    }
    const qs = new URLSearchParams({ role: "provider" });
    if (demo) qs.set("demo", "1");
    navigate(`/visit/${data.appointment.id}?${qs.toString()}`);
  }

  async function syncPayment() {
    if (!data?.appointment || demo) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ops/reconcile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId: data.appointment.id }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        unpaid?: boolean;
        alreadyPaid?: boolean;
        error?: string;
        message?: string;
        paymentStatus?: string;
      };
      if (!res.ok) {
        const msg = json.message || json.error || "Reconcile failed";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (json.unpaid) {
        toast.message(`Stripe still ${json.paymentStatus || "unpaid"}`);
        return;
      }
      toast.success(json.alreadyPaid ? "Already paid" : "Payment synced");
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const refundIds = useMemo(() => {
    if (!data?.appointment) {
      return { paymentIntentId: null as string | null, checkoutSessionId: null as string | null };
    }
    const fromPaymentsPi = data.payments
      .map((p) => p.stripe_payment_intent_id)
      .find((id) => Boolean(id && String(id).trim()));
    const fromPaymentsCs = data.payments
      .map((p) => p.stripe_checkout_session_id)
      .find((id) => Boolean(id && String(id).trim()));
    return {
      paymentIntentId:
        data.appointment.stripePaymentIntentId ||
        (fromPaymentsPi ? String(fromPaymentsPi) : null),
      checkoutSessionId:
        data.appointment.stripeCheckoutSessionId ||
        (fromPaymentsCs ? String(fromPaymentsCs) : null),
    };
  }, [data]);

  const refundLink = useMemo(() => stripeRefundDeepLink(refundIds), [refundIds]);

  async function declineAndRefund() {
    if (!data?.appointment) return;
    if (demo) {
      if (refundLink) {
        openStripeRefundDeepLink(refundIds);
      }
      toast.message("Demo — opened Stripe link; status not saved");
      return;
    }
    const ok = window.confirm(
      "Decline this patient?\n\n1) Stripe Dashboard opens so you can issue a full refund.\n2) This case will be marked cancelled.\n\nContinue?",
    );
    if (!ok) return;
    const opened = openStripeRefundDeepLink(refundIds);
    if (!opened) {
      toast.error(
        "No Stripe payment id on this case — refund manually in Dashboard, then mark cancelled.",
      );
    } else {
      toast.message(
        refundLink?.kind === "payment_intent"
          ? "Stripe payment opened — click Refund, then return here"
          : "Stripe search opened — open the payment, Refund, then return here",
      );
    }
    await patch({ status: "cancelled" }, "Marked cancelled — finish refund in Stripe");
  }

  if (loading) {
    return (
      <main className="px-4 md:px-8 py-10 max-w-3xl mx-auto text-sm text-white/50">
        Loading case…
      </main>
    );
  }

  if (!data?.appointment) {
    return (
      <main className="px-4 md:px-8 py-10 max-w-3xl mx-auto">
        <Link
          to={withDemo("/ops", demo)}
          className="text-sm text-white/55 underline underline-offset-4"
        >
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
  const tip = guidance(a.status, !!a.providerId);
  const primaryStatuses = PRIMARY_BY_STATUS[a.status] || [];
  const secondaryStatuses = ALL_STATUSES.filter(
    (s) => s !== a.status && !primaryStatuses.includes(s),
  );
  const age = ageFromDob(patient?.dateOfBirth);
  const isPaid = a.status === "paid";
  const steps = [
    {
      n: 1,
      label: "Assigned",
      done: !!a.providerId,
      hint: a.providerId ? "You own this case" : "Claim it before documenting",
    },
    {
      n: 2,
      label: "Review intake",
      done: data.intakes.length > 0,
      hint:
        data.intakes.length > 0
          ? "Intake on file — read before deciding"
          : "Wait for patient intake or message them to finish",
    },
    {
      n: 3,
      label: "SOAP / decision",
      done: a.status === "completed",
      hint: "Approve Rx path or decline + refund",
    },
    {
      n: 4,
      label: "Pharmacy or refund",
      done: a.status === "completed",
      hint: "Send Rx to compounding pharmacy, or refund in Stripe Dashboard",
    },
  ];

  return (
    <main className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
      <Link
        to={withDemo("/ops", demo)}
        className="text-sm text-white/55 underline underline-offset-4"
      >
        ← Queue
      </Link>

      {demo && (
        <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-50/90">
          Demo case — actions preview only.
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#9dba8c]/90">
            Patient
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-2 truncate">
            {patient?.fullName || "Patient"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/55">
            {patient?.email ? (
              <button
                type="button"
                className="underline underline-offset-4 hover:text-white"
                onClick={() => void copyText("Email", patient.email)}
              >
                {patient.email}
              </button>
            ) : (
              <span>—</span>
            )}
            {patient?.phone && (
              <button
                type="button"
                className="underline underline-offset-4 hover:text-white"
                onClick={() => void copyText("Phone", patient.phone!)}
              >
                {patient.phone}
              </button>
            )}
            {patient?.state && <span>{patient.state}</span>}
            {age && <span>Age {age}</span>}
          </div>
        </div>
        <div className="sm:text-right shrink-0">
          <div className="text-sm capitalize text-white/70">{statusLabel(a.status)}</div>
          <div className="font-display text-2xl mt-1">
            {money(a.amountCents, a.currency)}
          </div>
          <div className="text-xs text-white/45 mt-1 capitalize">{a.serviceTier} visit</div>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-[#9dba8c]/35 bg-[#9dba8c]/10 px-5 py-4">
        <h2 className="text-sm font-medium text-[#d7e6cb]">{tip.title}</h2>
        <p className="text-sm text-white/70 mt-1">{tip.body}</p>
        {isPaid && (
          <div className="mt-4 flex flex-wrap gap-2">
            {!a.providerId && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void patch({ assignSelf: true }, "Assigned to you")}
                className="rounded-full bg-[#9dba8c] text-[#0b100e] px-5 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                Claim case
              </button>
            )}
            <Link
              to={withDemo(
                `/provider/notes?appointmentId=${encodeURIComponent(a.id)}`,
                demo,
              )}
              className="rounded-full bg-[#9dba8c] text-[#0b100e] px-5 py-2.5 text-sm font-medium"
            >
              Open SOAP note
            </Link>
            <button
              type="button"
              disabled={busy}
              onClick={() => void startVisit()}
              className="rounded-full border border-white/20 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Video room (optional)
            </button>
          </div>
        )}
        {a.status === "awaiting_payment" && !demo && (
          <div className="mt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => void syncPayment()}
              className="rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-50 hover:bg-amber-500/20 disabled:opacity-50"
            >
              Sync payment from Stripe
            </button>
          </div>
        )}
      </section>

      {isPaid && (
        <section className="mt-6 rounded-2xl border border-white/10 p-5">
          <h2 className="text-sm font-medium mb-4">Async review checklist</h2>
          <ol className="space-y-3">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-3 items-start">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium border ${
                    step.done
                      ? "bg-[#9dba8c] text-[#0b100e] border-[#9dba8c]"
                      : "border-white/20 text-white/50"
                  }`}
                >
                  {step.done ? "✓" : step.n}
                </span>
                <div>
                  <div className="text-sm font-medium">{step.label}</div>
                  <div className="text-xs text-white/45">{step.hint}</div>
                </div>
              </li>
            ))}
          </ol>
          {!a.providerId && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch({ assignSelf: true }, "Assigned to you")}
              className="mt-4 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Assign to me only
            </button>
          )}
        </section>
      )}

      {isPaid && (
        <section className="mt-6 rounded-2xl border border-white/10 p-5">
          <h2 className="text-sm font-medium mb-2">Pharmacy handoff</h2>
          <p className="text-sm text-white/55 mb-4">
            After you approve an Rx, record how it left the chart (portal / fax /
            phone). Manual fulfillment is fine for launch.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {(["queued", "sent", "held", "declined"] as const).map((status) => (
              <button
                key={status}
                type="button"
                disabled={busy}
                onClick={() => {
                  setPharmacyStatus(status);
                  void patch(
                    {
                      pharmacyStatus: status,
                      pharmacyNotes: pharmacyNotes,
                    },
                    `Pharmacy marked ${status}`,
                  );
                }}
                className={`rounded-full px-3 py-1.5 text-xs capitalize border disabled:opacity-40 ${
                  pharmacyStatus === status
                    ? "bg-[#9dba8c] text-[#0b100e] border-[#9dba8c]"
                    : "border-white/15 text-white/70 hover:border-white/35"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <label className="block text-xs text-white/45 mb-1" htmlFor="pharmacy-notes">
            Pharmacy notes
          </label>
          <textarea
            id="pharmacy-notes"
            value={pharmacyNotes}
            onChange={(e) => setPharmacyNotes(e.target.value)}
            rows={3}
            placeholder="Drug, strength, directions, pharmacy name, confirmation #"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#9dba8c]/60"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void patch(
                  {
                    pharmacyStatus: pharmacyStatus || "queued",
                    pharmacyNotes,
                  },
                  "Pharmacy notes saved",
                )
              }
              className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Save pharmacy notes
            </button>
            {a.pharmacySentAt && (
              <span className="text-xs text-white/40 self-center">
                Sent {new Date(a.pharmacySentAt).toLocaleString()}
              </span>
            )}
          </div>
        </section>
      )}

      {isPaid && (
        <section className="mt-6 rounded-2xl border border-white/10 p-5">
          <h2 className="text-sm font-medium mb-2">Launch playbook</h2>
          <ul className="text-sm text-white/65 space-y-2 list-disc pl-5">
            <li>
              <span className="text-white/85">Not a candidate:</span> use{" "}
              <span className="text-white/85">Decline + refund</span> below —
              opens Stripe, then marks this case cancelled. Webhook records{" "}
              <code className="text-xs text-white/50">charge.refunded</code>.
            </li>
            <li>
              <span className="text-white/85">Approve Rx:</span> use{" "}
              <span className="text-white/85">Pharmacy handoff</span> above
              (portal / fax / phone — manual is fine). Then mark completed.
            </li>
            <li>
              <span className="text-white/85">Statement text:</span> charges
              show as SPRYMD on the card — no ED wording.
            </li>
          </ul>
        </section>
      )}

      {(isPaid || a.status === "cancelled") && (
        <section className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/5 p-5">
          <h2 className="text-sm font-medium text-rose-50/95 mb-2">
            Decline / refund
          </h2>
          <p className="text-sm text-white/60 mb-4">
            Full refunds are issued in Stripe Dashboard (we do not move card
            money from this console). Deep link opens the payment when we have a
            PaymentIntent, otherwise Dashboard search on the Checkout Session.
          </p>
          <div className="flex flex-wrap gap-2">
            {refundLink ? (
              <a
                href={refundLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
              >
                {refundLink.kind === "payment_intent"
                  ? "Open Stripe payment (Refund)"
                  : "Find payment in Stripe"}
              </a>
            ) : (
              <span className="text-xs text-white/45 self-center">
                No Stripe id on file yet — search Dashboard by patient email.
              </span>
            )}
            {isPaid && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void declineAndRefund()}
                className="rounded-full border border-rose-400/50 bg-rose-500/15 px-4 py-2 text-sm text-rose-50 hover:bg-rose-500/25 disabled:opacity-50"
              >
                Decline + refund
              </button>
            )}
            {refundLink && (
              <button
                type="button"
                onClick={() => {
                  void copyText("Stripe refund link", refundLink.href);
                }}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/35"
              >
                Copy link
              </button>
            )}
          </div>
          {(refundIds.paymentIntentId || refundIds.checkoutSessionId) && (
            <dl className="mt-4 space-y-1 text-[11px] text-white/40 font-mono break-all">
              {refundIds.paymentIntentId && (
                <div>
                  <dt className="inline text-white/35">pi </dt>
                  <dd className="inline">{refundIds.paymentIntentId}</dd>
                </div>
              )}
              {refundIds.checkoutSessionId && (
                <div>
                  <dt className="inline text-white/35">cs </dt>
                  <dd className="inline">{refundIds.checkoutSessionId}</dd>
                </div>
              )}
            </dl>
          )}
        </section>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
        >
          {error}
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-white/10 p-5">
        <h2 className="text-sm font-medium mb-3">Intake</h2>
        {data.intakes.length === 0 ? (
          <p className="text-sm text-white/45">No chart intake on file yet.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {data.intakes.map((intake) => (
              <li key={intake.id} className="rounded-xl border border-white/10 p-3">
                <div className="flex justify-between gap-3 text-xs text-white/45 mb-2">
                  <span className="capitalize">{intake.status}</span>
                  <span>{new Date(intake.updatedAt).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-wrap text-white/85">
                  {intake.summary || "No summary"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="text-sm font-medium mb-3">Payment</h2>
          {data.payments.length === 0 ? (
            <p className="text-sm text-white/45">No ledger rows yet.</p>
          ) : (
            <ul className="divide-y divide-white/10 text-sm">
              {data.payments.map((p) => (
                <li key={p.id} className="py-2.5 flex justify-between gap-3">
                  <div>
                    <div className="text-white/80">{p.event_type}</div>
                    <div className="text-xs text-white/40">
                      {new Date(p.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-white/55">
                    {p.amount_cents != null ? money(p.amount_cents) : p.status || "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="text-sm font-medium mb-3">Status</h2>
          {primaryStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {primaryStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void patch({ status }, `Marked ${statusLabel(status)}`)
                  }
                  className="rounded-full border border-[#9dba8c]/50 bg-[#9dba8c]/15 px-3 py-1.5 text-xs capitalize hover:bg-[#9dba8c]/25 disabled:opacity-40"
                >
                  Mark {statusLabel(status)}
                </button>
              ))}
            </div>
          )}
          <details className="text-sm">
            <summary className="cursor-pointer text-white/45 hover:text-white/70">
              Other statuses
            </summary>
            <div className="flex flex-wrap gap-2 mt-3">
              {secondaryStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void patch({ status }, `Marked ${statusLabel(status)}`)
                  }
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs capitalize disabled:opacity-40 hover:border-white/40"
                >
                  {statusLabel(status)}
                </button>
              ))}
            </div>
          </details>
          <dl className="mt-4 space-y-2 text-xs text-white/45">
            <div className="flex justify-between gap-2">
              <dt>Created</dt>
              <dd>{a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Paid</dt>
              <dd>{a.paidAt ? new Date(a.paidAt).toLocaleString() : "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="md:hidden fixed bottom-0 inset-x-0 border-t border-white/10 bg-[#0b100e]/95 backdrop-blur-md px-4 py-3 flex gap-2 z-20">
        {isPaid ? (
          <Link
            to={withDemo(
              `/provider/notes?appointmentId=${encodeURIComponent(a.id)}`,
              demo,
            )}
            className="flex-1 text-center rounded-full bg-[#9dba8c] text-[#0b100e] px-3 py-2.5 text-sm font-medium"
          >
            SOAP note
          </Link>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void syncPayment()}
            className="flex-1 rounded-full bg-[#9dba8c] text-[#0b100e] px-3 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Sync payment
          </button>
        )}
        <button
          type="button"
          disabled={busy || !isPaid}
          onClick={() => void startVisit()}
          className="flex-1 text-center rounded-full border border-white/20 px-3 py-2.5 text-sm disabled:opacity-40"
        >
          Video (opt.)
        </button>
      </div>
      <div className="h-20 md:hidden" />
    </main>
  );
}

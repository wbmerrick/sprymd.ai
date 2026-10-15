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
import { requiresLiveVideoVisit } from "@/lib/visitModality";
import type { PreferredPharmacy } from "@/lib/pharmacyFulfillment";
import {
  akuteChartUrl,
  canPrescribeInAkute,
  formatPrescribeClipboard,
} from "@/integrations/akute/prescribe";

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
  const [rxDrug, setRxDrug] = useState("");
  const [rxDose, setRxDose] = useState("");
  const [rxQty, setRxQty] = useState("");
  const [rxSupplies, setRxSupplies] = useState("");
  const [rxSig, setRxSig] = useState("");
  const [compoundingRationale, setCompoundingRationale] = useState("");

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
      toast.message("Demo — not clinically appropriate (refund simulated)");
      return;
    }
    const ok = window.confirm(
      "Mark Not clinically appropriate?\n\nThis issues a full $100 evaluation refund via Stripe and cancels the case.",
    );
    if (!ok) return;
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
          body: JSON.stringify({
            clinicalDecision: "not_clinically_appropriate",
            pharmacyNotes,
          }),
        },
      );
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        refund?: { ok?: boolean; refunded?: boolean; already?: boolean; error?: string };
      };
      if (!res.ok) {
        const msg = json.message || json.error || "Update failed.";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (json.refund?.already) {
        toast.message("Already refunded — case cancelled");
      } else if (json.refund?.refunded) {
        toast.success("Full evaluation refund issued");
      } else if (json.refund && !json.refund.ok) {
        toast.error(json.refund.error || "Refund failed — check Stripe");
        if (refundLink) openStripeRefundDeepLink(refundIds);
      } else {
        toast.success("Marked not clinically appropriate");
      }
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function prescribeInAkute() {
    const pharmacy = data?.appointment.patient?.preferredPharmacy as
      | PreferredPharmacy
      | null
      | undefined;
    const akutePatientId = data?.appointment.patient?.akutePatientId;
    const gate = canPrescribeInAkute({
      pharmacy,
      compoundingRationale,
      akutePatientId,
    });
    if (!gate.ok) {
      toast.error(gate.reason || "Cannot prescribe yet");
      return;
    }
    const text = formatPrescribeClipboard({
      drug: rxDrug,
      dose: rxDose,
      quantity: rxQty,
      supplies: rxSupplies,
      sig: rxSig,
      compoundingRationale,
      pharmacy,
    });
    await copyText("Rx summary", text);
    window.open(akuteChartUrl(String(akutePatientId)), "_blank", "noopener,noreferrer");
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
  const liveVideo = requiresLiveVideoVisit(a.conditionId);
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
      label: liveVideo ? "Video visit / SOAP" : "SOAP / decision",
      done: a.status === "completed",
      hint: liveVideo
        ? "Join video for PCP visits, then document the decision"
        : "Async chart review — approve Rx path or decline + refund",
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
          <div className="text-xs text-white/45 mt-1 capitalize">
            {a.serviceTier} visit
            {a.conditionId ? ` · ${a.conditionId}` : ""}
            {liveVideo ? " · live video" : " · async review"}
          </div>
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
            {liveVideo ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void startVisit()}
                className="rounded-full border border-[#9dba8c]/50 bg-[#9dba8c]/15 px-4 py-2.5 text-sm text-[#d7e6cb] hover:bg-[#9dba8c]/25 disabled:opacity-50"
              >
                Join PCP video visit
              </button>
            ) : (
              <p className="w-full text-xs text-white/45 mt-1">
                Async chart review — live video is for PCP visits only.
              </p>
            )}
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
          <h2 className="text-sm font-medium mb-2">Prescribe in Akute</h2>
          <p className="text-sm text-white/55 mb-4">
            E-prescribe inside Akute to the patient&apos;s chosen pharmacy. SpryMD
            does not sell or transmit medication. Patient pays the pharmacy
            directly.
          </p>
          {a.patient?.preferredPharmacy ? (
            <dl className="mb-4 grid gap-1 text-xs text-white/65">
              <div>
                <dt className="inline text-white/40">Pharmacy: </dt>
                <dd className="inline text-white/90">
                  {a.patient.preferredPharmacy.name}
                </dd>
              </div>
              <div>
                <dt className="inline text-white/40">Type: </dt>
                <dd className="inline capitalize">
                  {a.patient.preferredPharmacy.medicationType || "—"}
                </dd>
              </div>
              <div>
                <dt className="inline text-white/40">Phone: </dt>
                <dd className="inline">{a.patient.preferredPharmacy.phone || "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mb-4 text-sm text-amber-200/90">
              No preferred pharmacy on file — patient must complete pharmacy
              selection at intake before you can prescribe.
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-2 mb-3">
            <label className="block text-xs text-white/45">
              Drug
              <input
                value={rxDrug}
                onChange={(e) => setRxDrug(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-white/45">
              Dose
              <input
                value={rxDose}
                onChange={(e) => setRxDose(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-white/45">
              Quantity
              <input
                value={rxQty}
                onChange={(e) => setRxQty(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-white/45">
              Supplies
              <input
                value={rxSupplies}
                onChange={(e) => setRxSupplies(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>
          <label className="block text-xs text-white/45 mb-3">
            Sig
            <textarea
              value={rxSig}
              onChange={(e) => setRxSig(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>
          {a.patient?.preferredPharmacy?.medicationType === "compounded" && (
            <label className="block text-xs text-white/45 mb-3">
              Compounding rationale (required)
              <textarea
                value={compoundingRationale}
                onChange={(e) => setCompoundingRationale(e.target.value)}
                rows={3}
                placeholder="Patient-specific clinical rationale for compounding"
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </label>
          )}
          <button
            type="button"
            disabled={
              busy ||
              !canPrescribeInAkute({
                pharmacy: a.patient?.preferredPharmacy as PreferredPharmacy,
                compoundingRationale,
                akutePatientId: a.patient?.akutePatientId,
              }).ok
            }
            onClick={() => void prescribeInAkute()}
            className="rounded-full bg-[#9dba8c] px-4 py-2 text-sm font-medium text-[#0b100e] hover:brightness-105 disabled:opacity-40"
          >
            Prescribe in Akute
          </button>
          <div className="mt-4 flex flex-wrap gap-2">
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
                    `Rx status marked ${status}`,
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
          <label className="mt-3 block text-xs text-white/45 mb-1" htmlFor="pharmacy-notes">
            Chart notes (optional)
          </label>
          <textarea
            id="pharmacy-notes"
            value={pharmacyNotes}
            onChange={(e) => setPharmacyNotes(e.target.value)}
            rows={2}
            placeholder="Optional internal note after e-prescribe"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#9dba8c]/60"
          />
        </section>
      )}

      {isPaid && (
        <section className="mt-6 rounded-2xl border border-white/10 p-5">
          <h2 className="text-sm font-medium mb-2">Launch playbook</h2>
          <ul className="text-sm text-white/65 space-y-2 list-disc pl-5">
            <li>
              <span className="text-white/85">Not clinically appropriate:</span>{" "}
              use the button below — auto-refunds the $100 evaluation fee.
            </li>
            <li>
              <span className="text-white/85">Approve Rx:</span> Prescribe in
              Akute (clipboard + chart). Patient pays their pharmacy.
            </li>
            <li>
              <span className="text-white/85">Statement text:</span> charges show
              as SPRYMD — evaluation fee only, never medication.
            </li>
          </ul>
        </section>
      )}

      {(isPaid || a.status === "cancelled") && (
        <section className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/5 p-5">
          <h2 className="text-sm font-medium text-rose-50/95 mb-2">
            Not clinically appropriate
          </h2>
          <p className="text-sm text-white/60 mb-4">
            Issues a full automatic refund of the $100 physician evaluation via
            Stripe and cancels this case.
          </p>
          <div className="flex flex-wrap gap-2">
            {isPaid && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void declineAndRefund()}
                className="rounded-full border border-rose-400/50 bg-rose-500/15 px-4 py-2 text-sm text-rose-50 hover:bg-rose-500/25 disabled:opacity-50"
              >
                Not clinically appropriate (auto-refund)
              </button>
            )}
            {refundLink && (
              <a
                href={refundLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
              >
                Open Stripe (manual)
              </a>
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

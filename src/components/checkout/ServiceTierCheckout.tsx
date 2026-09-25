import { useState } from "react";
import { Link } from "react-router-dom";
import {
  SERVICE_TIERS,
  formatTierPrice,
  type ServiceTier,
  type ServiceTierId,
} from "../../../shared/serviceTiers";
import {
  EMPTY_COMPLIANCE,
  canProceedToPayment,
  complianceBlockReason,
  type ComplianceAnswers,
} from "../../../shared/complianceGate";
import ComplianceConsent from "./ComplianceConsent";

export type ServiceTierCheckoutProps = {
  appointmentId?: string;
  patientEmail?: string;
  patientName?: string;
  /** Tier to preselect (e.g. the funnel picks `protocol_start` for a medication plan). */
  defaultTierId?: ServiceTierId;
  onError?: (message: string) => void;
};

export default function ServiceTierCheckout({
  appointmentId,
  patientEmail: initialEmail = "",
  patientName: initialName = "",
  defaultTierId,
  onError,
}: ServiceTierCheckoutProps) {
  const [selectedId, setSelectedId] = useState<ServiceTierId>(
    SERVICE_TIERS.some((t) => t.id === defaultTierId) && defaultTierId
      ? defaultTierId
      : SERVICE_TIERS[0].id,
  );
  const [patientEmail, setPatientEmail] = useState(initialEmail);
  const [patientName, setPatientName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState<ComplianceAnswers>(EMPTY_COMPLIANCE);
  const consentReady = canProceedToPayment(consent);

  const selectedTier: ServiceTier | undefined = SERVICE_TIERS.find(
    (t) => t.id === selectedId,
  );

  async function startCheckout() {
    setError(null);

    if (!appointmentId && !patientEmail.trim()) {
      const message = "Enter your email to continue, or provide an appointment.";
      setError(message);
      onError?.(message);
      return;
    }

    if (!selectedTier) {
      const message = "Select a service tier.";
      setError(message);
      onError?.(message);
      return;
    }

    const consentBlock = complianceBlockReason(consent);
    if (consentBlock) {
      setError(consentBlock);
      onError?.(consentBlock);
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string | boolean> = {
        serviceTierId: selectedTier.id,
        physicalState: consent.physicalState,
        cashPayTermsAccepted: true,
        telehealthLimitationsAcknowledged: true,
      };
      if (appointmentId) payload.appointmentId = appointmentId;
      if (patientEmail.trim()) payload.patientEmail = patientEmail.trim();
      if (patientName.trim()) payload.patientName = patientName.trim();

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        sessionId?: string;
        error?: string;
        message?: string;
      };

      if (!res.ok || !data.url) {
        const message =
          data.message ||
          data.error ||
          "Unable to start checkout. Please try again.";
        setError(message);
        onError?.(message);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Network error starting checkout.";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="font-display text-navy text-3xl md:text-4xl font-bold mb-3">
          Choose your visit
        </h1>
        <p className="font-body text-muted-foreground text-lg">
          One-time cash-pay telehealth fees. Pay securely with Stripe.
        </p>
        <p className="font-body text-sm mt-3">
          <Link to="/intake" className="underline underline-offset-4 text-navy">
            Complete intake first
          </Link>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SERVICE_TIERS.map((tier) => {
          const selected = tier.id === selectedId;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setSelectedId(tier.id)}
              className={`card-base text-left transition-all border-2 ${
                selected
                  ? "border-primary shadow-md ring-2 ring-primary/20"
                  : "border-transparent hover:border-gray-light"
              }`}
              aria-pressed={selected}
            >
              <p className="font-display text-navy text-xl font-bold mb-1">
                {tier.name}
              </p>
              <p className="font-body text-navy text-2xl font-semibold mb-3">
                {formatTierPrice(tier)}
              </p>
              <p className="font-body text-sm text-muted-foreground">
                {tier.description}
              </p>
            </button>
          );
        })}
      </div>

      {!appointmentId && (
        <div className="card-base max-w-xl mx-auto space-y-4">
          <div>
            <label className="font-body text-navy text-sm font-medium mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary transition-colors"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="font-body text-navy text-sm font-medium mb-1 block">
              Name <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary transition-colors"
              autoComplete="name"
            />
          </div>
        </div>
      )}

      <ComplianceConsent value={consent} onChange={setConsent} />

      {error && (
        <p
          role="alert"
          className="font-body text-sm text-center text-red-600 max-w-xl mx-auto"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="btn-primary px-8 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={startCheckout}
          disabled={loading || !consentReady}
          data-testid="pay-button"
        >
          {loading
            ? "Starting checkout…"
            : `Pay ${selectedTier ? formatTierPrice(selectedTier) : ""} →`}
        </button>
        <p className="font-body text-xs text-muted-foreground text-center max-w-md">
          You will be redirected to Stripe Checkout for the visit fee only.
          Medication plans are not charged at this step — a clinician must approve
          before any prescription is issued or billed.
        </p>
      </div>
    </div>
  );
}

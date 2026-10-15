import { useState } from "react";
import { Link } from "react-router-dom";
import {
  SERVICE_TIERS,
  SPRYMD_VISIT_TIERS,
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
  /** Care catalog condition (e.g. `pcp`, `ed`) — persisted on the appointment. */
  conditionId?: string;
  treatmentId?: string;
  /** When `ispry`, lock to membership + iSpry copy. */
  source?: string;
  onError?: (message: string) => void;
};

export default function ServiceTierCheckout({
  appointmentId,
  patientEmail: initialEmail = "",
  patientName: initialName = "",
  defaultTierId,
  conditionId,
  treatmentId,
  source,
  onError,
}: ServiceTierCheckoutProps) {
  const isIspry = source === "ispry" || defaultTierId === "ispry_membership";
  const visibleTiers: ServiceTier[] = isIspry
    ? SERVICE_TIERS.filter((t) => t.id === "ispry_membership")
    : SPRYMD_VISIT_TIERS;

  const [selectedId, setSelectedId] = useState<ServiceTierId>(
    visibleTiers.some((t) => t.id === defaultTierId) && defaultTierId
      ? defaultTierId
      : visibleTiers[0].id,
  );
  const [patientEmail, setPatientEmail] = useState(initialEmail);
  const [patientName, setPatientName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState<ComplianceAnswers>(EMPTY_COMPLIANCE);
  const consentReady = canProceedToPayment(consent);

  const selectedTier: ServiceTier | undefined = visibleTiers.find(
    (t) => t.id === selectedId,
  );
  const brandName = isIspry ? "iSpry" : "SpryMD";

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
      if (conditionId?.trim()) payload.conditionId = conditionId.trim();
      if (treatmentId?.trim()) payload.treatmentId = treatmentId.trim();
      if (isIspry) payload.source = "ispry";

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
          {isIspry ? "Join iSpry" : "Physician evaluation"}
        </h1>
        <p className="font-body text-muted-foreground text-lg">
          {isIspry
            ? "$100/month membership. Physician-led telehealth for Tennessee. Pay securely with Stripe."
            : "$100 physician evaluation. Prescription only if medically appropriate. Full refund if not."}
        </p>
        {!isIspry && (
          <p className="font-body text-sm mt-3">
            <Link to="/intake" className="underline underline-offset-4 text-navy">
              Complete intake first
            </Link>
          </p>
        )}
        {isIspry && (
          <p className="font-body text-sm mt-3 text-muted-foreground">
            After payment you return to ispry.ai. Care ops run on this secure practice system.
          </p>
        )}
      </div>

      <div
        className={`grid gap-4 ${
          visibleTiers.length === 1 ? "md:grid-cols-1 max-w-md mx-auto" : "md:grid-cols-3"
        }`}
      >
        {visibleTiers.map((tier) => {
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
            <label htmlFor="checkout-patient-email" className="font-body text-navy text-sm font-medium mb-1 block">
              Email
            </label>
            <input
              id="checkout-patient-email"
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary transition-colors"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="checkout-patient-name" className="font-body text-navy text-sm font-medium mb-1 block">
              Name <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="checkout-patient-name"
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

      <ComplianceConsent value={consent} onChange={setConsent} brandName={brandName} />

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
            : isIspry
              ? `Join for ${selectedTier ? formatTierPrice(selectedTier) : ""} →`
              : `Pay ${selectedTier ? formatTierPrice(selectedTier) : ""} →`}
        </button>
        <p className="font-body text-xs text-muted-foreground text-center max-w-md">
          {isIspry
            ? "You will be redirected to Stripe Checkout for the monthly membership. Card details are only entered on Stripe."
            : "You will be redirected to Stripe Checkout for the $100 physician evaluation only. You pay your pharmacy directly for medication if prescribed — SpryMD does not sell or set medication prices."}
        </p>
      </div>
    </div>
  );
}

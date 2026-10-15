import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceTierCheckout from "@/components/checkout/ServiceTierCheckout";
import AnimatedSection from "@/components/AnimatedSection";
import { getCondition, getTreatment } from "@/data/careCatalog";
import { defaultServiceTierFor, loadCheckoutSelection } from "@/lib/intakeFlow";
import type { ServiceTierId } from "../../shared/serviceTiers";

/**
 * Cash-pay Stripe Checkout entry. Optional query params:
 * ?appointmentId=&email=&name=
 * ?plan=<treatmentId>&condition=<conditionId> — set by the homepage funnel so
 * the visit fee is paid with the chosen plan in view.
 * ?source=ispry&plan=ispry_membership — iSpry $100/mo membership handoff.
 * Card details are only ever entered on Stripe's hosted page.
 */
const CashPayCheckout = () => {
  const [params] = useSearchParams();
  const appointmentId = params.get("appointmentId") || undefined;
  const canceled = params.get("canceled") === "1";
  const source = (params.get("source") || "").toLowerCase();
  const planParam = params.get("plan") || "";

  const isIspry =
    source === "ispry" || planParam === "ispry_membership";

  const selection = loadCheckoutSelection();
  const conditionId = isIspry
    ? undefined
    : params.get("condition") || selection?.conditionId || undefined;
  const treatmentId = isIspry
    ? undefined
    : planParam || selection?.treatmentId || undefined;
  const condition = getCondition(conditionId);
  const treatment = getTreatment(conditionId, treatmentId);
  const patientEmail = params.get("email") || selection?.email || undefined;
  const patientName = params.get("name") || undefined;
  const defaultTierId: ServiceTierId | undefined = isIspry
    ? "ispry_membership"
    : conditionId
      ? defaultServiceTierFor(conditionId)
      : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      {isIspry ? (
        <header className="border-b border-gray-light bg-off-white">
          <div className="section-container flex items-center justify-between h-16 px-4">
            <a
              href="https://ispry.ai/"
              className="font-display text-navy text-xl font-bold tracking-tight"
            >
              iSpry<span className="text-primary">.ai</span>
            </a>
            <a
              href="https://ispry.ai/#pricing"
              className="font-body text-sm text-muted-foreground underline underline-offset-4"
            >
              Back to membership
            </a>
          </div>
        </header>
      ) : (
        <Navbar />
      )}
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="section-container max-w-5xl">
          <AnimatedSection>
            {canceled && (
              <p role="status" className="font-body text-sm text-center text-muted-foreground mb-6">
                Checkout was canceled. Nothing was charged — you can try again.
              </p>
            )}
            {treatment && condition && !isIspry && (
              <section
                data-testid="selected-plan"
                aria-labelledby="selected-plan-heading"
                className="card-base max-w-xl mx-auto mb-8 border-2 border-primary/30"
              >
                <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Your selected plan · {condition.name}
                </p>
                <h2 id="selected-plan-heading" className="font-display text-navy text-2xl font-bold">
                  {treatment.name}
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-3">{treatment.sub}</p>
                <p className="font-body text-navy text-sm leading-relaxed">
                  Today you pay the <strong>$100 physician evaluation</strong> below via Stripe.
                  Prescription only if medically appropriate. Full refund if not.
                  If approved, you pay your pharmacy directly for medication — SpryMD does not sell
                  or set medication prices. Catalog figures like{" "}
                  <strong>${treatment.price}/mo</strong> are pharmacy-side estimates only, not a
                  SpryMD charge.
                </p>
                <p className="font-body text-xs text-muted-foreground mt-3">
                  Not the right plan?{" "}
                  <Link to={`/?view=plan&condition=${condition.id}`} className="underline underline-offset-4 text-navy">
                    Back to your options
                  </Link>
                </p>
              </section>
            )}
            <ServiceTierCheckout
              appointmentId={appointmentId}
              patientEmail={patientEmail}
              patientName={patientName}
              defaultTierId={defaultTierId}
              conditionId={conditionId}
              treatmentId={treatmentId || undefined}
              source={isIspry ? "ispry" : undefined}
            />
          </AnimatedSection>
        </div>
      </main>
      {isIspry ? (
        <footer className="border-t border-gray-light py-8 text-center">
          <p className="font-body text-xs text-muted-foreground">
            iSpry membership checkout · HIPAA-oriented practice ops · Tennessee
          </p>
        </footer>
      ) : (
        <Footer />
      )}
    </div>
  );
};

export default CashPayCheckout;

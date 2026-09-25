import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceTierCheckout from "@/components/checkout/ServiceTierCheckout";
import AnimatedSection from "@/components/AnimatedSection";
import { getCondition, getTreatment } from "@/data/careCatalog";
import { defaultServiceTierFor, loadCheckoutSelection } from "@/lib/intakeFlow";

/**
 * Cash-pay Stripe Checkout entry. Optional query params:
 * ?appointmentId=&email=&name=
 * ?plan=<treatmentId>&condition=<conditionId> — set by the homepage funnel so
 * the visit fee is paid with the chosen plan in view. Card details are only
 * ever entered on Stripe's hosted page.
 */
const CashPayCheckout = () => {
  const [params] = useSearchParams();
  const appointmentId = params.get("appointmentId") || undefined;
  const canceled = params.get("canceled") === "1";

  const selection = loadCheckoutSelection();
  const conditionId = params.get("condition") || selection?.conditionId || undefined;
  const treatmentId = params.get("plan") || selection?.treatmentId || undefined;
  const condition = getCondition(conditionId);
  const treatment = getTreatment(conditionId, treatmentId);
  const patientEmail = params.get("email") || selection?.email || undefined;
  const patientName = params.get("name") || undefined;

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="section-container max-w-5xl">
          <AnimatedSection>
            {canceled && (
              <p role="status" className="font-body text-sm text-center text-muted-foreground mb-6">
                Checkout was canceled. Nothing was charged — you can select a visit and try again.
              </p>
            )}
            {treatment && condition && (
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
                  Today you pay the <strong>one-time clinician visit fee</strong> below via Stripe.
                  The plan price (<strong>${treatment.price}/mo</strong>) is what treatment would cost
                  <em> if</em> a Tennessee-licensed clinician approves it after reviewing your intake —
                  we do <strong>not</strong> charge medication automatically at checkout.
                  If treatment is not appropriate, the visit fee is your only charge and a prescription
                  is never guaranteed.
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
              defaultTierId={conditionId ? defaultServiceTierFor(conditionId) : undefined}
            />
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CashPayCheckout;

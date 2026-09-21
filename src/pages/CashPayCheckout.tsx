import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceTierCheckout from "@/components/checkout/ServiceTierCheckout";
import AnimatedSection from "@/components/AnimatedSection";

/**
 * Cash-pay Stripe Checkout entry. Optional query params:
 * ?appointmentId=&email=&name=
 */
const CashPayCheckout = () => {
  const [params] = useSearchParams();
  const appointmentId = params.get("appointmentId") || undefined;
  const patientEmail = params.get("email") || undefined;
  const patientName = params.get("name") || undefined;
  const canceled = params.get("canceled") === "1";

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="section-container max-w-5xl">
          <AnimatedSection>
            {canceled && (
              <p className="font-body text-sm text-center text-muted-foreground mb-6">
                Checkout was canceled. You can select a visit and try again.
              </p>
            )}
            <ServiceTierCheckout
              appointmentId={appointmentId}
              patientEmail={patientEmail}
              patientName={patientName}
            />
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CashPayCheckout;

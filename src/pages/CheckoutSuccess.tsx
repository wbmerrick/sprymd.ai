import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <AnimatedSection>
          <div className="card-base shadow-xl max-w-[560px] w-full p-8 md:p-12 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-green mx-auto flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-navy text-3xl md:text-4xl font-bold mb-2">
              Payment successful
            </h1>
            <p className="font-body text-muted-foreground text-lg mb-6">
              Thank you. Your cash-pay visit fee has been received. You will get
              a confirmation email shortly.
            </p>
            {sessionId && (
              <p className="font-body text-xs text-muted-foreground mb-8 break-all">
                Session: {sessionId}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="btn-primary text-center">
                Back to home
              </Link>
              <Link
                to="/checkout"
                className="font-body text-sm text-navy underline underline-offset-4 self-center"
              >
                Return to checkout
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;

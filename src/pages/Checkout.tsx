import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Info, Loader2, Lock, Shield } from "lucide-react";
import { z } from "zod";
import AnimatedSection from "@/components/AnimatedSection";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import type { ServiceLine } from "@/lib/encounters";
import { isPaymentsLive, startCheckout } from "@/lib/payments";

const emailSchema = z.string().trim().email("Please enter a valid email address.");

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceLine: ServiceLine = searchParams.get("service") === "weight" ? "weight" : "ed";

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const paymentsLive = isPaymentsLive(serviceLine);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const result = await startCheckout({ serviceLine, email: parsed.data });
      if (result === "demo") {
        navigate("/confirmed");
      }
      // "redirected" → the browser is navigating to Stripe; leave the spinner on.
    } catch {
      setError("We couldn't start checkout. Please try again in a moment.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-off-white py-24 px-4">
      <div className="section-container max-w-4xl">
        <AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="card-base">
              <h2 className="font-display text-foreground text-2xl font-bold mb-6">Your Visit Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between font-body text-foreground">
                  <span>Physician consultation</span>
                  <span className="font-semibold">$75.00</span>
                </div>
                <div className="flex justify-between font-body text-muted-foreground">
                  <span>Pharmacy fulfillment</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-body text-muted-foreground">
                  <span>Secure messaging</span>
                  <span>Included</span>
                </div>
                <div className="h-px bg-gray-light" />
                <div className="flex justify-between font-body text-foreground text-lg font-bold">
                  <span>Total</span>
                  <span>$75.00/month</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {["Real physician review", "Prescription if appropriate", "Discreet delivery", "Cancel anytime"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 font-body text-sm text-foreground">
                    <Check className="w-4 h-4 text-green flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 text-xs font-body text-muted-foreground border-t border-gray-light pt-4">
                <div className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> HIPAA Secure</div>
                <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> SSL Encrypted</div>
                <span>Licensed Physician</span>
              </div>
            </div>

            {/* Payment */}
            <div className="card-base">
              <h2 className="font-display text-foreground text-2xl font-bold mb-6">Secure Checkout</h2>

              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="checkout-email" className="font-body text-foreground text-sm font-medium mb-1 block">Email</label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      autoComplete="email"
                      disabled={loading}
                      className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                    />
                  </div>

                  {error && (
                    <div role="alert" className="bg-destructive/10 border border-destructive rounded-xl p-3 font-body text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  {!paymentsLive && (
                    <div className="bg-muted rounded-xl p-4 flex items-start gap-2">
                      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="font-body text-muted-foreground text-sm text-left">
                        Demo mode — payments aren't configured, so you won't be charged.
                        Continuing will simulate a completed payment.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full text-center flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecting to secure payment…
                    </>
                  ) : (
                    <>Start My Visit — $75/month →</>
                  )}
                </button>
              </form>

              <p className="font-body text-muted-foreground text-xs mt-4 text-center">
                You will be charged $75 today. Your subscription renews monthly. Cancel anytime.
              </p>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs font-body text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                256-bit SSL encryption. Powered by Stripe.
              </div>

              <MedicalDisclaimer variant="portal" className="mt-4" />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
};

export default Checkout;

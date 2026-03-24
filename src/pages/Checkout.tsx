import { Link } from "react-router-dom";
import { Check, Lock, Shield } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const Checkout = () => {
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
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-body text-foreground text-sm font-medium mb-1 block">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="bg-muted rounded-xl p-6 text-center">
                  <p className="font-body text-muted-foreground text-sm">
                    Stripe Payment Element will mount here.<br />
                    <span className="text-xs">Add your Stripe publishable key to enable payments.</span>
                  </p>
                </div>
              </div>

              <Link to="/confirmed" className="btn-primary w-full text-center">
                Start My Visit — $75/month →
              </Link>

              <p className="font-body text-muted-foreground text-xs mt-4 text-center">
                You will be charged $75 today. Your subscription renews monthly. Cancel anytime.
              </p>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs font-body text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                256-bit SSL encryption. Powered by Stripe.
              </div>

              <p className="font-body text-muted-foreground text-[11px] mt-4 italic text-center">
                [PRACTICE NAME] provides telehealth consultations. Prescription issuance is at physician discretion. This is not a substitute for emergency care.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
};

export default Checkout;

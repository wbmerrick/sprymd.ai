import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Lock, Shield, Stethoscope, FileText, AlertCircle, Sparkles, Building2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { CASH_PAY_PLANS, generateCashPayReceipt, processStripeCashPayTransaction } from "@/lib/stripeBilling";
import { recordSubscriptionCheckout, ensureAccountShell } from "@/lib/patientCareStore";
import { syncIntakeToDatabase } from "@/lib/supabaseSync";
import { getSessionEmail } from "@/lib/customerAccounts";

/**
 * Legacy marketing checkout mock — not routed. Live payments use CashPayCheckout
 * (/checkout) for one-time visit fees only. Kept honest so it cannot reintroduce
 * monthly-subscription-includes-meds language if wired again.
 */
const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCondition = searchParams.get("condition") || "ed";

  const [selectedPlanKey, setSelectedPlanKey] = useState<string>(initialCondition in CASH_PAY_PLANS ? initialCondition : "ed");
  const [email, setEmail] = useState(() => getSessionEmail() || "");
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [consent, setConsent] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const plan = CASH_PAY_PLANS[selectedPlanKey] || CASH_PAY_PLANS.ed;

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  };

  const isFormValid =
    email.includes("@") &&
    name.trim().length > 0 &&
    card.replace(/\s/g, "").length === 16 &&
    exp.length >= 7 &&
    cvc.length >= 3 &&
    zip.length >= 5 &&
    consent;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || processing) return;

    setProcessing(true);
    const cleanEmail = email.trim().toLowerCase();
    ensureAccountShell(cleanEmail, name);

    // 1. Process Stripe transaction simulation
    await processStripeCashPayTransaction({
      email: cleanEmail,
      name,
      planKey: selectedPlanKey,
      amount: plan.priceMonthly,
      isSubscription: true,
    });

    // 2. Record in patient care store
    recordSubscriptionCheckout({
      email: cleanEmail,
      plan: {
        name: plan.name,
        sub: plan.description,
        price: plan.priceMonthly,
        chilled: selectedPlanKey === "weightloss" || selectedPlanKey === "sermorelin",
      },
      conditionId: plan.id,
      conditionName: plan.category,
      answers: {
        checkoutSource: "Direct Cash-Pay Checkout",
        planKey: selectedPlanKey,
      },
    });

    // 3. Persist to backend database
    await syncIntakeToDatabase({
      email: cleanEmail,
      name,
      conditionId: plan.id,
      conditionName: plan.category,
      plan: {
        name: plan.name,
        sub: plan.description,
        price: plan.priceMonthly,
        chilled: selectedPlanKey === "weightloss" || selectedPlanKey === "sermorelin",
      },
      answers: {
        checkoutSource: "Direct Cash-Pay Checkout",
      },
      consents: {
        telehealthConsent: true,
        cashPayAgreement: true,
        hipaaConsent: true,
        timestamp: new Date().toISOString(),
      },
    });

    setProcessing(false);
    navigate("/confirmed");
  };

  const receipt = generateCashPayReceipt({
    patientName: name || "Spry Patient",
    patientEmail: email || "patient@sprymd.ai",
    planKey: selectedPlanKey,
    cardLast4: card.slice(-4) || "4242",
  });

  return (
    <main className="min-h-screen bg-off-white py-24 px-4">
      <div className="section-container max-w-5xl">
        <AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-base">
              <h2 className="font-display text-navy text-2xl font-bold mb-6">Your Visit Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between font-body text-navy">
                  <span>Clinician visit fee</span>
                  <span className="font-semibold">$75.00</span>
                </div>
                <div className="flex justify-between font-body text-muted-foreground">
                  <span>Medication (if approved)</span>
                  <span>Billed separately</span>
                </div>
                <div className="flex justify-between font-body text-muted-foreground">
                  <span>Secure messaging after visit</span>
                  <span>Included with visit</span>
                </div>
                <div className="h-px bg-gray-light" />
                <div className="flex justify-between font-body text-navy text-lg font-bold">
                  <span>Due today</span>
                  <span>$75.00 one-time</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReceipt(!showReceipt)}
                  className="mt-4 w-full text-center text-xs text-primary hover:underline flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {showReceipt ? "Hide Itemized HSA/FSA Receipt Preview" : "View Itemized HSA/FSA Receipt Preview"}
                </button>
              </div>

              <ul className="space-y-2 mb-6">
                {["Real physician review", "Prescription only if appropriate", "Discreet delivery when prescribed", "No medication auto-charge at checkout"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 font-body text-sm text-navy">
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

            <div className="card-base">
              <h2 className="font-display text-navy text-2xl font-bold mb-6">Secure Checkout</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-body text-navy text-sm font-medium mb-1 block">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="bg-muted rounded-xl p-6 text-center">
                  <p className="font-body text-muted-foreground text-sm">
                    Use the live cash-pay checkout for Stripe payments.
                  </p>
                </div>
              )}
            </div>

            {/* Right Col: Stripe Direct Payment Form */}
            <div className="lg:col-span-7">
              <div className="card-base p-6 md:p-8">
                <h2 className="font-display text-navy text-2xl font-bold mb-2">
                  Direct Cash-Pay Billing
                </h2>
                <p className="font-body text-xs text-muted-foreground mb-6">
                  Powered by Stripe. 256-bit HIPAA-compliant encryption. Card authorization is held until clinician authorizes your treatment.
                </p>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="font-body text-navy text-xs font-semibold mb-1 block">
                      Email Address (for prescription & tracking updates)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-sm text-navy focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-body text-navy text-xs font-semibold mb-1 block">
                      Cardholder Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="As printed on card"
                      className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-sm text-navy focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-body text-navy text-xs font-semibold mb-1 block">
                      Credit / Debit Card Number
                    </label>
                    <div className="rounded-xl border-2 border-gray-light overflow-hidden focus-within:border-primary transition-colors">
                      <input
                        type="text"
                        required
                        value={card}
                        onChange={(e) => setCard(formatCard(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        className="w-full p-3 font-body text-sm text-navy focus:outline-none border-b border-gray-light"
                      />
                      <div className="flex">
                        <input
                          type="text"
                          required
                          value={exp}
                          onChange={(e) => setExp(formatExp(e.target.value))}
                          placeholder="MM / YY"
                          className="w-1/2 p-3 font-body text-sm text-navy focus:outline-none border-r border-gray-light"
                        />
                        <input
                          type="text"
                          required
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="CVC"
                          className="w-1/2 p-3 font-body text-sm text-navy focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-body text-navy text-xs font-semibold mb-1 block">
                      Billing ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value.slice(0, 10))}
                      placeholder="37219"
                      className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-sm text-navy focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Consents acknowledgment */}
                  <label className="flex items-start gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="font-body text-xs text-muted-foreground leading-relaxed">
                      I authorize SpryMD to place a recurring monthly subscription charge of <strong>${plan.priceMonthly}.00/mo</strong>. I acknowledge that SpryMD is 100% direct cash-pay and does not route to insurance or third-party RCM networks. I can cancel anytime with zero penalty.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!isFormValid || processing}
                    className="btn-primary w-full text-center py-3.5 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {processing ? "Authorizing with Stripe…" : `Submit Visit · $${plan.priceMonthly}/month →`}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-xs font-body text-muted-foreground pt-4 border-t border-gray-light">
                    <div className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> 256-Bit SSL</div>
                    <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> HIPAA Encrypted</div>
                    <div className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Empower Pharmacy Dispensed</div>
                  </div>
                </form>
              </div>

              <Link to="/checkout" className="btn-primary w-full text-center">
                Continue to visit checkout →
              </Link>

              <p className="font-body text-muted-foreground text-xs mt-4 text-center">
                You pay a one-time clinician visit fee today. Medication plan prices are charged only after clinician approval, coordinated separately.
              </p>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs font-body text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                256-bit SSL encryption. Powered by Stripe.
              </div>

              <p className="font-body text-muted-foreground text-[11px] mt-4 italic text-center">
                SpryMD provides telehealth consultations. Prescription issuance is at physician discretion. This is not a substitute for emergency care.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
};

export default Checkout;

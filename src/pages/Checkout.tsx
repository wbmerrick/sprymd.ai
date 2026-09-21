import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Lock, Shield, Stethoscope, FileText, AlertCircle, Sparkles, Building2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { CASH_PAY_PLANS, generateCashPayReceipt, processStripeCashPayTransaction } from "@/lib/stripeBilling";
import { recordSubscriptionCheckout, ensureAccountShell } from "@/lib/patientCareStore";
import { syncIntakeToDatabase } from "@/lib/supabaseSync";
import { getSessionEmail } from "@/lib/customerAccounts";

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
          <div className="mb-8 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" /> 100% Direct Cash-Pay Checkout
            </span>
            <h1 className="font-display text-navy text-3xl md:text-4xl font-bold">
              Complete Your SpryMD Consultation
            </h1>
            <p className="font-body text-muted-foreground text-sm mt-1 max-w-2xl">
              All plans include physician chart review, Tennessee-licensed e-prescribing, Empower Pharmacy fulfillment, and continuous provider messaging. Zero insurance required.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Col: Plan Selector & Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="card-base p-6">
                <h2 className="font-display text-navy text-xl font-bold mb-4 flex items-center justify-between">
                  <span>Select Care Protocol</span>
                  <span className="text-xs font-normal text-muted-foreground">Tennessee Telehealth</span>
                </h2>

                <div className="space-y-2.5 mb-6">
                  {Object.values(CASH_PAY_PLANS).map((p) => {
                    const isSelected = selectedPlanKey === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlanKey(p.id)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary/10 text-navy shadow-sm font-semibold"
                            : "border-gray-light text-muted-foreground hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-navy">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-navy">${p.priceMonthly}</p>
                          <p className="text-[10px] text-muted-foreground">/month</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-gray-light my-4" />

                <div className="space-y-2.5 text-xs text-navy">
                  <div className="flex justify-between">
                    <span>Physician Consultation & Chart Review</span>
                    <span className="font-semibold text-emerald-600">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Empower Pharmacy Fulfillment</span>
                    <span className="font-semibold text-emerald-600">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tennessee Next-Business-Day Delivery</span>
                    <span className="font-semibold text-emerald-600">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unlimited Secure Provider Messaging</span>
                    <span className="font-semibold text-emerald-600">Included</span>
                  </div>
                  <div className="h-px bg-gray-light my-3" />
                  <div className="flex justify-between text-base font-bold text-navy pt-1">
                    <span>Total Cash-Pay Rate</span>
                    <span className="text-primary">${plan.priceMonthly}.00/mo</span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-muted/60 p-3.5 border border-border text-[11px] text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-navy mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" /> 100% Direct Cash-Pay Guarantee
                  </p>
                  If our board-certified physician determines that telehealth or medication is not clinically safe for you, your authorization hold is released immediately and you receive a 100% full refund.
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

              {/* HSA/FSA Receipt Preview */}
              {showReceipt && (
                <div className="card-base p-5 border border-primary/30 bg-primary/5 text-xs text-navy space-y-3">
                  <div className="flex items-start justify-between border-b border-primary/20 pb-2">
                    <div>
                      <p className="font-bold text-sm text-navy">{receipt.providerDetails.clinicName}</p>
                      <p className="text-[11px] text-muted-foreground">{receipt.providerDetails.address}</p>
                      <p className="text-[11px] text-muted-foreground">NPI: {receipt.providerDetails.npi} · Phone: {receipt.providerDetails.phone}</p>
                    </div>
                    <span className="font-mono text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {receipt.receiptNumber}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <p><strong>Patient:</strong> {receipt.patientName} ({receipt.patientEmail})</p>
                    <p><strong>Item:</strong> {receipt.planName} (Direct Telehealth Consultation & Prescription)</p>
                    <p><strong>Amount Paid:</strong> ${receipt.amount}.00 via {receipt.paymentMethod}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic border-t border-primary/10 pt-2 leading-relaxed">
                    {receipt.disclaimer}
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
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
};

export default Checkout;

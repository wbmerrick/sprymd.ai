import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, Pill, HelpCircle, Shield, FileCheck, Stethoscope, Lock } from "lucide-react";
import { syncIntakeToDatabase } from "@/lib/supabaseSync";
import { recordSubscriptionCheckout, ensureAccountShell } from "@/lib/patientCareStore";
import { getSessionEmail } from "@/lib/customerAccounts";

interface QuizState {
  // Consents
  consentTelehealth: boolean;
  consentCashPay: boolean;
  consentHipaa: boolean;
  // Patient details
  patientEmail: string;
  patientName: string;
  // Clinical answers
  age: string;
  erections: string;
  duration: string;
  frequency: string;
  conditions: string[];
  medications: string[];
  triedBefore: string;
  allergies: string;
  preference: string;
  goal: string;
}

const initialState: QuizState = {
  consentTelehealth: false,
  consentCashPay: false,
  consentHipaa: false,
  patientEmail: "",
  patientName: "",
  age: "",
  erections: "",
  duration: "",
  frequency: "",
  conditions: [],
  medications: [],
  triedBefore: "",
  allergies: "",
  preference: "",
  goal: "",
};

const Quiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizState>(() => {
    const activeEmail = getSessionEmail() || "";
    return { ...initialState, patientEmail: activeEmail };
  });
  const [nitrateBlock, setNitrateBlock] = useState(false);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Total steps: Step 0 (Consents & Email) + 10 clinical questions + Step 11 (Treatment Plan Summary)
  const totalSteps = 11;

  const goNext = useCallback(() => {
    setDirection(1);
    if (step < totalSteps) setStep((s) => s + 1);
  }, [step]);

  const goBack = useCallback(() => {
    setDirection(-1);
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const selectSingle = (key: keyof QuizState, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => goNext(), 300);
  };

  const toggleMulti = (key: "conditions" | "medications", value: string) => {
    setAnswers((prev) => {
      const arr = prev[key] as string[];
      if (value === "None of the above") return { ...prev, [key]: arr.includes(value) ? [] : [value] };
      const filtered = arr.filter((v) => v !== "None of the above");
      return { ...prev, [key]: filtered.includes(value) ? filtered.filter((v) => v !== value) : [...filtered, value] };
    });
  };

  const progress = ((step) / totalSteps) * 100;

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const OptionButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-4 font-body transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
        selected ? "border-primary bg-primary/10 font-semibold" : "border-gray-light"
      }`}
    >
      {label}
    </button>
  );

  const CheckboxButton = ({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-4 font-body transition-all duration-200 flex items-center gap-3 hover:border-primary hover:bg-primary/5 ${
        checked ? "border-primary bg-primary/10 font-semibold" : "border-gray-light"
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-primary bg-primary" : "border-gray-light"}`}>
        {checked && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
      <span className="text-sm">{label}</span>
    </button>
  );

  const handleFinishAndCheckout = async () => {
    setSubmitting(true);
    const email = (answers.patientEmail || getSessionEmail() || "patient@sprymd.ai").trim().toLowerCase();
    const name = answers.patientName || "Spry Patient";

    ensureAccountShell(email, name);

    const plan = {
      name: "Tadalafil Daily or PRN Protocol",
      sub: answers.preference || "PDE5 Inhibitor",
      price: 75,
      chilled: false,
    };

    // 1. Record in local store
    recordSubscriptionCheckout({
      email,
      plan,
      conditionId: "ed",
      conditionName: "Erectile Dysfunction",
      answers: {
        age: answers.age,
        erections: answers.erections,
        duration: answers.duration,
        frequency: answers.frequency,
        conditions: answers.conditions,
        medications: answers.medications,
        allergies: answers.allergies,
        preference: answers.preference,
        goal: answers.goal,
      },
    });

    // 2. Persist to backend Supabase database
    await syncIntakeToDatabase({
      email,
      name,
      conditionId: "ed",
      conditionName: "Erectile Dysfunction",
      answers: {
        age: answers.age,
        erections: answers.erections,
        duration: answers.duration,
        frequency: answers.frequency,
        conditions: answers.conditions,
        medications: answers.medications,
        allergies: answers.allergies,
        preference: answers.preference,
        goal: answers.goal,
      },
      plan,
      consents: {
        telehealthConsent: answers.consentTelehealth,
        cashPayAgreement: answers.consentCashPay,
        hipaaConsent: answers.consentHipaa,
        timestamp: new Date().toISOString(),
      },
    });

    setSubmitting(false);
    navigate("/checkout?mode=subscription&condition=ed");
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                <Stethoscope className="w-3.5 h-3.5" /> Tennessee Telehealth Onboarding
              </span>
              <h2 className="font-display text-navy text-2xl md:text-3xl font-bold">
                Mandatory Patient Consents
              </h2>
              <p className="font-body text-muted-foreground text-sm mt-1">
                Under Tennessee telehealth laws and our cash-pay model, please check each required agreement before proceeding.
              </p>
            </div>

            <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border">
              {/* Checkbox 1: Telehealth Consent */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers.consentTelehealth}
                  onChange={(e) => setAnswers((p) => ({ ...p, consentTelehealth: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="font-body text-xs text-navy leading-relaxed">
                  <strong>Tennessee Telehealth Informed Consent:</strong> I consent to asynchronous clinical evaluation by a Tennessee-licensed physician. I understand that SpryMD is not an emergency room or acute crisis service. In an emergency, I will dial 911 immediately.
                </span>
              </label>

              {/* Checkbox 2: 100% Cash-Pay Agreement */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers.consentCashPay}
                  onChange={(e) => setAnswers((p) => ({ ...p, consentCashPay: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="font-body text-xs text-navy leading-relaxed">
                  <strong>100% Direct Cash-Pay Agreement:</strong> I understand that SpryMD is strictly self-pay. No insurance claims (commercial, Medicare, Medicaid) are billed or routed to third-party RCM networks. I am solely responsible for charges.
                </span>
              </label>

              {/* Checkbox 3: HIPAA & Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers.consentHipaa}
                  onChange={(e) => setAnswers((p) => ({ ...p, consentHipaa: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="font-body text-xs text-navy leading-relaxed">
                  <strong>HIPAA Notice & Terms:</strong> I have reviewed and agree to the <Link to="/terms" target="_blank" className="text-primary underline">Terms of Service</Link>, <Link to="/privacy" target="_blank" className="text-primary underline">Privacy Policy</Link>, and <Link to="/npp" target="_blank" className="text-primary underline">Notice of Privacy Practices (NPP)</Link>.
                </span>
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="font-body text-navy text-xs font-semibold mb-1 block">Your Email (for physician review updates)</label>
                <input
                  type="email"
                  value={answers.patientEmail}
                  onChange={(e) => setAnswers((p) => ({ ...p, patientEmail: e.target.value }))}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-sm text-navy focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-navy text-xs font-semibold mb-1 block">Full Legal Name</label>
                <input
                  type="text"
                  value={answers.patientName}
                  onChange={(e) => setAnswers((p) => ({ ...p, patientName: e.target.value }))}
                  placeholder="As on state ID"
                  className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-sm text-navy focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <button
              onClick={goNext}
              disabled={
                !answers.consentTelehealth ||
                !answers.consentCashPay ||
                !answers.consentHipaa ||
                !answers.patientEmail.includes("@") ||
                !answers.patientName.trim()
              }
              className="btn-primary w-full mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Medical Intake →
            </button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-6">How old are you?</h2>
            {["Under 30", "30–39", "40–49", "50–59", "60 or older"].map((o) => (
              <OptionButton key={o} label={o} selected={answers.age === o} onClick={() => selectSingle("age", o)} />
            ))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-6">How would you describe your erections recently?</h2>
            {["Can't get an erection", "Get one but can't maintain it", "Less firm than usual", "Only works in certain situations"].map((o) => (
              <OptionButton key={o} label={o} selected={answers.erections === o} onClick={() => selectSingle("erections", o)} />
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-6">How long has this been going on?</h2>
            {["Less than 3 months", "3–6 months", "6–12 months", "Over a year"].map((o) => (
              <OptionButton key={o} label={o} selected={answers.duration === o} onClick={() => selectSingle("duration", o)} />
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-6">How often does it happen?</h2>
            {["Almost always", "Most of the time", "Sometimes", "Rarely"].map((o) => (
              <OptionButton key={o} label={o} selected={answers.frequency === o} onClick={() => selectSingle("frequency", o)} />
            ))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-6">Do you have any of the following conditions?</h2>
            <p className="text-center font-body text-muted-foreground text-sm mb-4">Select all that apply</p>
            {["Heart disease or history of heart attack", "High blood pressure (uncontrolled)", "Diabetes (Type 1 or 2)", "Low blood pressure", "None of the above"].map((o) => (
              <CheckboxButton key={o} label={o} checked={answers.conditions.includes(o)} onClick={() => toggleMulti("conditions", o)} />
            ))}
            <button onClick={goNext} disabled={answers.conditions.length === 0} className="btn-primary w-full mt-4 disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
          </div>
        );
      case 6: {
        const meds = [
          "Nitrates (nitroglycerin, isosorbide — including 'poppers')",
          "Alpha-blockers (Flomax/tamsulosin, doxazosin)",
          "HIV antiretrovirals (ritonavir, saquinavir)",
          "Blood thinners (warfarin, Xarelto, Eliquis)",
          "None of the above",
        ];
        const hasNitrates = answers.medications.includes(meds[0]);

        if (nitrateBlock) {
          return (
            <div className="text-center space-y-4">
              <div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-6">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="font-display text-destructive text-xl font-bold mb-2">⛔ Important Safety Notice</h3>
                <p className="font-body text-navy text-sm leading-relaxed">
                  Based on your answer, we are unable to prescribe ED medication for you at this time. Nitrate medications and ED medications together can cause a dangerous, life-threatening drop in blood pressure. Please speak with your cardiologist about safe alternatives.
                </p>
              </div>
              <Link to="/" className="btn-secondary">Return to Homepage</Link>
            </div>
          );
        }

        return (
          <div className="space-y-3">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-2">Are you currently taking any of these medications?</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="font-body text-amber-800 text-sm font-medium">This is a critical safety question. Please answer honestly.</p>
            </div>
            <p className="text-center font-body text-muted-foreground text-sm mb-4">Select all that apply</p>
            {meds.map((o) => (
              <CheckboxButton key={o} label={o} checked={answers.medications.includes(o)} onClick={() => toggleMulti("medications", o)} />
            ))}
            <button
              onClick={() => {
                if (hasNitrates) { setNitrateBlock(true); return; }
                goNext();
              }}
              disabled={answers.medications.length === 0}
              className="btn-primary w-full mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        );
      }
      case 7:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-6">Have you tried ED medication before?</h2>
            {["No, never", "Yes — it worked", "Yes — didn't work well", "Yes — had side effects"].map((o) => (
              <OptionButton key={o} label={o} selected={answers.triedBefore === o} onClick={() => selectSingle("triedBefore", o)} />
            ))}
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-6">Do you have any drug allergies?</h2>
            <textarea
              value={answers.allergies}
              onChange={(e) => setAnswers((prev) => ({ ...prev, allergies: e.target.value }))}
              placeholder="Type 'None' if no known allergies"
              className="w-full rounded-xl border-2 border-gray-light p-4 font-body text-navy resize-none h-28 focus:outline-none focus:border-primary transition-colors"
            />
            <button onClick={goNext} disabled={!answers.allergies.trim()} className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
          </div>
        );
      case 9:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-6">Which option sounds most appealing?</h2>
            {[
              { icon: "💊", label: "Daily pill (Tadalafil 5mg) — always ready" },
              { icon: "💊", label: "As-needed pill (Sildenafil 50mg) — on demand" },
              { icon: "🤷", label: "No preference — clinician recommended" },
            ].map((o) => (
              <OptionButton key={o.label} label={`${o.icon} ${o.label}`} selected={answers.preference === o.label} onClick={() => selectSingle("preference", o.label)} />
            ))}
          </div>
        );
      case 10:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-navy text-2xl md:text-3xl font-bold text-center mb-6">What is your main goal?</h2>
            {["Get an erection when I want one", "Better consistency and reliability", "Longer lasting", "All of the above"].map((o) => (
              <OptionButton key={o} label={o} selected={answers.goal === o} onClick={() => selectSingle("goal", o)} />
            ))}
          </div>
        );
      case 11:
        return (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-600 mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/30">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display text-navy text-3xl font-bold mb-3">Your Intake Is Ready for Physician Review.</h2>
            <p className="font-body text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Based on your answers, a Tennessee-licensed physician will review your chart within 24 hours. If authorized, your prescription will be compounded and dispatched for next-business-day delivery.
            </p>
            <div className="bg-off-white rounded-xl border border-gray-light p-5 text-left space-y-2.5 mb-6">
              {[
                { icon: Pill, text: "Personalized medication recommendation (Tadalafil/Sildenafil)" },
                { icon: Stethoscope, text: "Tennessee licensed physician chart review within 24 hours" },
                { icon: Shield, text: "Compounded by Empower Pharmacy · Next-business-day TN delivery" },
                { icon: FileCheck, text: "100% Direct cash-pay · 100% refund if not clinically eligible" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 font-body text-navy text-xs">
                  <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <span className="font-display text-navy text-4xl font-bold">$75</span>
              <span className="font-body text-muted-foreground text-lg">/month</span>
              <p className="text-xs text-muted-foreground mt-1">Direct Cash-Pay Subscription · Zero Insurance Needed</p>
            </div>
            <button
              onClick={handleFinishAndCheckout}
              disabled={submitting}
              className="btn-primary-lg w-full text-center block disabled:opacity-50"
            >
              {submitting ? "Submitting to Clinician Queue…" : "Complete My Visit — $75/mo →"}
            </button>
            <p className="font-body text-muted-foreground text-xs mt-4 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-muted-foreground" />
              Discreet billing · Cancel anytime · HIPAA-encrypted
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-off-white flex flex-col items-center justify-center px-4 py-24">
      <div className="w-full max-w-[580px]">
        {step < totalSteps && (
          <div className="mb-8">
            <p className="section-label text-center mb-3">
              {step === 0 ? "STEP 1: CONSENTS & IDENTITY" : `STEP ${step + 1} OF ${totalSteps}: CLINICAL QUESTIONS`}
            </p>
            <div className="w-full h-2 bg-gray-light rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <div className="card-base shadow-xl p-6 md:p-10 rounded-2xl relative overflow-hidden min-h-[440px] flex flex-col justify-center">
          {step > 0 && step < totalSteps && (
            <button
              onClick={goBack}
              className="absolute top-4 left-4 font-body text-muted-foreground text-sm hover:text-navy transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
          )}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default Quiz;

import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, Pill, HelpCircle } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

interface QuizState {
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
  age: "", erections: "", duration: "", frequency: "",
  conditions: [], medications: [], triedBefore: "",
  allergies: "", preference: "", goal: "",
};

const Quiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizState>(initialState);
  const [nitrateBlock, setNitrateBlock] = useState(false);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  const totalSteps = 10;

  const goNext = useCallback(() => {
    setDirection(1);
    if (step < totalSteps) setStep(s => s + 1);
  }, [step]);

  const goBack = useCallback(() => {
    setDirection(-1);
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const selectSingle = (key: keyof QuizState, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setTimeout(() => goNext(), 300);
  };

  const toggleMulti = (key: "conditions" | "medications", value: string) => {
    setAnswers(prev => {
      const arr = prev[key] as string[];
      if (value === "None of the above") return { ...prev, [key]: arr.includes(value) ? [] : [value] };
      const filtered = arr.filter(v => v !== "None of the above");
      return { ...prev, [key]: filtered.includes(value) ? filtered.filter(v => v !== value) : [...filtered, value] };
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
      {label}
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-6">How old are you?</h2>
            {["Under 30", "30–39", "40–49", "50–59", "60 or older"].map(o => (
              <OptionButton key={o} label={o} selected={answers.age === o} onClick={() => selectSingle("age", o)} />
            ))}
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-6">How would you describe your erections recently?</h2>
            {["Can't get an erection", "Get one but can't maintain it", "Less firm than usual", "Only works in certain situations"].map(o => (
              <OptionButton key={o} label={o} selected={answers.erections === o} onClick={() => selectSingle("erections", o)} />
            ))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-6">How long has this been going on?</h2>
            {["Less than 3 months", "3–6 months", "6–12 months", "Over a year"].map(o => (
              <OptionButton key={o} label={o} selected={answers.duration === o} onClick={() => selectSingle("duration", o)} />
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-6">How often does it happen?</h2>
            {["Almost always", "Most of the time", "Sometimes", "Rarely"].map(o => (
              <OptionButton key={o} label={o} selected={answers.frequency === o} onClick={() => selectSingle("frequency", o)} />
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-6">Do you have any of the following conditions?</h2>
            <p className="text-center font-body text-muted-foreground text-sm mb-4">Select all that apply</p>
            {["Heart disease or history of heart attack", "High blood pressure (uncontrolled)", "Diabetes (Type 1 or 2)", "Low blood pressure", "None of the above"].map(o => (
              <CheckboxButton key={o} label={o} checked={answers.conditions.includes(o)} onClick={() => toggleMulti("conditions", o)} />
            ))}
            <button onClick={goNext} disabled={answers.conditions.length === 0} className="btn-primary w-full mt-4 disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
          </div>
        );
      case 5: {
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
                <p className="font-body text-foreground text-sm leading-relaxed">
                  Based on your answer, we are unable to prescribe ED medication for you at this time. Nitrate medications and ED medications together can cause a dangerous, life-threatening drop in blood pressure. Please speak with your cardiologist about safe alternatives.
                </p>
              </div>
              <Link to="/" className="btn-secondary">Return to Homepage</Link>
            </div>
          );
        }

        return (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-2">Are you currently taking any of these medications?</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="font-body text-amber-800 text-sm font-medium">This is a critical safety question. Please answer honestly.</p>
            </div>
            <p className="text-center font-body text-muted-foreground text-sm mb-4">Select all that apply</p>
            {meds.map(o => (
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
      case 6:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-6">Have you tried ED medication before?</h2>
            {["No, never", "Yes — it worked", "Yes — didn't work well", "Yes — had side effects"].map(o => (
              <OptionButton key={o} label={o} selected={answers.triedBefore === o} onClick={() => selectSingle("triedBefore", o)} />
            ))}
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-6">Do you have any drug allergies?</h2>
            <textarea
              value={answers.allergies}
              onChange={e => setAnswers(prev => ({ ...prev, allergies: e.target.value }))}
              placeholder="Type 'None' if no known allergies"
              className="w-full rounded-xl border-2 border-gray-light p-4 font-body text-foreground resize-none h-28 focus:outline-none focus:border-primary transition-colors"
            />
            <button onClick={goNext} disabled={!answers.allergies.trim()} className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
          </div>
        );
      case 8:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-6">Which option sounds most appealing?</h2>
            {[
              { icon: "💊", label: "Daily pill — always ready, no planning" },
              { icon: "💊", label: "As-needed pill — take it when you want it" },
              { icon: "🤷", label: "No preference — let the doctor decide" },
            ].map(o => (
              <OptionButton key={o.label} label={`${o.icon} ${o.label}`} selected={answers.preference === o.label} onClick={() => selectSingle("preference", o.label)} />
            ))}
          </div>
        );
      case 9:
        return (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-2xl md:text-3xl font-bold text-center mb-6">What is your main goal?</h2>
            {["Get an erection when I want one", "Better consistency and reliability", "Longer lasting", "All of the above"].map(o => (
              <OptionButton key={o} label={o} selected={answers.goal === o} onClick={() => selectSingle("goal", o)} />
            ))}
          </div>
        );
      case 10:
        return (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green mx-auto flex items-center justify-center mb-6 animate-scale-check">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-display text-foreground text-3xl font-bold mb-3">Your Treatment Plan Is Ready.</h2>
            <p className="font-body text-muted-foreground text-lg max-w-md mx-auto mb-8">
              Based on your answers, you may be a candidate for ED treatment. A board-certified physician will review your case personally within 24 hours.
            </p>
            <div className="bg-off-white rounded-xl border border-gray-light p-6 text-left space-y-3 mb-8">
              {[
                { icon: Pill, text: "Personalized medication recommendation" },
                { icon: HelpCircle, text: "Physician review within 24 hours" },
                { text: "📦 Discreet delivery if prescribed" },
                { text: "↩ Full refund if not a candidate" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 font-body text-foreground text-sm">
                  {"icon" in item && item.icon ? <item.icon className="w-5 h-5 text-primary flex-shrink-0" /> : <span className="text-base">{item.text?.substring(0, 2)}</span>}
                  <span>{"icon" in item ? item.text : item.text?.substring(2)}</span>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <span className="font-display text-foreground text-5xl font-bold">$75</span>
              <span className="font-body text-muted-foreground text-xl">/month</span>
            </div>
            <a href="https://buy.stripe.com/28EfZjb5i0mEa679id7Zu00" className="btn-primary-lg w-full text-center block">Complete My SpryMD Visit — $75 →</a>
            <p className="font-body text-muted-foreground text-xs mt-4">Discreet billing · Cancel anytime · HIPAA-secure</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-off-white flex flex-col items-center justify-center px-4 py-24">
      <div className="w-full max-w-[560px]">
        {step < totalSteps && (
          <div className="mb-8">
            <p className="section-label text-center mb-3">STEP {step + 1} OF {totalSteps}</p>
            <div className="w-full h-2 bg-gray-light rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <div className="card-base shadow-xl p-8 md:p-10 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          {step > 0 && step < totalSteps && (
            <button onClick={goBack} className="absolute top-4 left-4 font-body text-muted-foreground text-sm hover:text-foreground transition-colors">
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
        <MedicalDisclaimer variant="portal" className="mt-6 max-w-[560px]" />
      </div>
    </main>
  );
};

export default Quiz;

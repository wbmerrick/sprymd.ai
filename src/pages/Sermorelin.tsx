import { Link, useNavigate } from "react-router-dom";
import { Check, Star, ShieldCheck, ArrowRight, Pill, Syringe, Sparkles, Clock, Truck, Award, Lock, ChevronRight, RefreshCw } from "lucide-react";

export default function SermorelinPage() {
  const navigate = useNavigate();

  const handleStartIntake = (preference?: "injection" | "tablet") => {
    // Navigate to SpryMD root with condition set so it directly opens Sermorelin intake
    const params = new URLSearchParams();
    params.set("condition", "sermorelin");
    if (preference) {
      params.set("pref", preference);
    }
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-body antialiased flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-center py-2.5 px-4 text-xs sm:text-sm font-semibold tracking-wide shadow-md flex items-center justify-center gap-2">
        <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] sm:text-[11px] uppercase tracking-wider font-bold">
          Summer Special
        </span>
        <span>SUMMER SALE: Sermorelin Growth Hormone Peptide $149/mo</span>
      </div>

      {/* Navigation */}
      <nav className="bg-slate-950/90 text-white border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center w-full">
          <Link to="/" className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-1 group">
            <span className="font-display">SpryMD</span>
            <span className="text-amber-400 text-xl font-normal group-hover:translate-x-0.5 transition-transform">.ai</span>
          </Link>

          <div className="hidden md:flex items-center space-x-2 text-sm text-slate-300 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800">
            <span className="text-emerald-400 font-bold tracking-wider flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-emerald-400 text-emerald-400" />
              ))}
            </span>
            <span className="text-slate-200 font-medium ml-1 text-xs sm:text-sm">4.4 out of 5 on Trustpilot</span>
          </div>

          <a
            href="#options"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2.5 px-4 sm:px-5 rounded-full text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-amber-400/20 hover:-translate-y-0.5 inline-flex items-center gap-1.5"
          >
            <span>View Treatment Options</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 overflow-hidden border-b border-slate-800/80">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-amber-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
              <Sparkles size={14} className="text-amber-400" />
              Physician-Prescribed Peptide Therapy
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.08] font-display tracking-tight text-white">
              Doctor-Prescribed<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
                Sermorelin Online
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl font-light">
              Sermorelin has shown to boost energy, lean muscle mass, and strength by encouraging your body to replenish its own growth hormone safely and gradually, without the risks and side effects of synthetic HGH therapy.
            </p>

            <ul className="space-y-3.5 mb-8 text-sm sm:text-base text-slate-200">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Injection or oral dissolvable tablet</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Personalized treatment plan reviewed by licensed clinicians</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>100% online consultation (No insurance required)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Shipped discreetly from licensed U.S. pharmacies</span>
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 pt-4 border-t border-slate-800/80">
              <div className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>FSA / HSA Eligible</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
                <Truck size={16} className="text-amber-400" />
                <span>Free Discreet Shipping</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
                <Clock size={16} className="text-amber-400" />
                <span>Tennessee Fast-Track Delivery</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur">
              <div className="aspect-[4/3] rounded-xl overflow-hidden relative mb-6 border border-slate-800">
                <img
                  src="/brand/sprymd-care-dawn.webp"
                  alt="Sermorelin Clinical Care"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-semibold block mb-1">
                    CLINICAL COMPOUND
                  </span>
                  <p className="text-sm font-medium leading-snug">
                    Bio-identical GHRH therapy formulated for optimal natural pituitary response.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-slate-400 block">Summer Promotional Rate</span>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-display">
                    $149<span className="text-xs text-slate-400 font-normal ml-1">/month</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartIntake()}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold py-2.5 px-4 sm:px-5 rounded-lg transition-all shadow-md hover:shadow-amber-400/20"
                >
                  Start My Visit
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Lock size={12} className="text-slate-500" />
                <span>No commitment. Cancel or pause anytime.</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Explanation Section */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase font-bold text-amber-400 mb-3 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Award size={14} />
            Natural Hormone Signaling
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-display text-white">
            Sermorelin Therapy, Explained
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-6 leading-relaxed font-light">
            After age 30, human growth hormone (HGH) levels decline by up to 15% per decade, impacting everything from metabolism and muscle tone to recovery and sleep quality.
          </p>
          <p className="text-slate-300 text-base sm:text-lg mb-10 leading-relaxed font-light">
            Peptides are short chains of amino acids that act as signaling molecules. Unlike synthetic options, Sermorelin works with your body, stimulating natural HGH production from the brain to potentially support lean muscle mass, energy, and metabolism.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800 text-left">
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 transition-all hover:border-slate-700">
              <div className="text-amber-400 font-bold text-lg mb-2 font-display">Deep Sleep & Recovery</div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                Supports restorative stage 3 & 4 delta-wave sleep when cellular repair and GH release peak.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 transition-all hover:border-slate-700">
              <div className="text-amber-400 font-bold text-lg mb-2 font-display">Lean Body Composition</div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                Assists natural muscle protein synthesis and metabolic burn without shutoff.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 transition-all hover:border-slate-700">
              <div className="text-amber-400 font-bold text-lg mb-2 font-display">Daytime Energy & Focus</div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                Reduces afternoon brain fog and physical fatigue by replenishing cellular vitality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Options Section */}
      <section id="options" className="py-20 px-4 sm:px-6 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase font-bold text-amber-400 mb-2">
              Flexible Formats
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-3">
              Choose Your Treatment Plan
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-light">
              Same active ingredient, compounded for your preferred daily routine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Option 1: Injections */}
            <div className="bg-slate-900/90 rounded-2xl shadow-xl p-7 sm:p-9 border border-slate-800 flex flex-col justify-between transition-all duration-200 hover:border-slate-700">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Syringe size={24} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    Subcutaneous
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white font-display mb-2">Injections</h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed min-h-[44px] font-light">
                  A prescription Sermorelin option reviewed by licensed medical providers for a simple, once-daily routine.
                </p>

                <div className="text-4xl font-extrabold text-white mb-6 font-display flex items-baseline">
                  $149
                  <span className="text-base text-slate-400 font-normal font-body ml-2">/ Month</span>
                </div>

                <ul className="space-y-3.5 mb-8 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>One 5 mL vial - 2mg/mL</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>Subcutaneous injection kit included</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>1-month supply (approx. 25-30 injections)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>Prepared in a licensed U.S. pharmacy</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleStartIntake("injection")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 group border border-slate-700"
              >
                <span>Select Injections</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Option 2: Tablets */}
            <div className="bg-slate-900/90 rounded-2xl shadow-2xl p-7 sm:p-9 border-2 border-amber-500/80 relative flex flex-col justify-between transition-all duration-200 hover:border-amber-400">
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Pill size={24} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    Oral Dissolve
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white font-display mb-2">Mint Dissolvable Tablets</h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed min-h-[44px] font-light">
                  A needle-free alternative that dissolves under the tongue for convenient daily use.
                </p>

                <div className="text-4xl font-extrabold text-white mb-6 font-display flex items-baseline">
                  $149
                  <span className="text-base text-slate-400 font-normal font-body ml-2">/ Month</span>
                </div>

                <ul className="space-y-3.5 mb-8 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>Dissolves under the tongue</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>1000mcg / dose</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>Same active ingredient as injectable format</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>Prepared in a licensed U.S. pharmacy</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleStartIntake("tablet")}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all duration-200 text-sm shadow-lg hover:shadow-amber-400/20 flex items-center justify-center gap-2 group"
              >
                <span>Select Tablets</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <p className="text-center text-slate-400 mt-8 text-xs sm:text-sm font-light">
            Treatment Plans include free medical evaluation, free shipping and 24/7 care messaging.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase font-bold text-amber-400 mb-2">
              3-Step Care Path
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
              How Treatment Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
            <div className="p-7 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="w-14 h-14 bg-amber-500/15 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-bold font-mono">
                01
              </div>
              <h3 className="text-xl font-bold mb-2 font-display text-white">Complete Intake</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                Submit a short, private health questionnaire for your licensed provider to review.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="w-14 h-14 bg-amber-500/15 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-bold font-mono">
                02
              </div>
              <h3 className="text-xl font-bold mb-2 font-display text-white">Provider Review</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                A licensed clinician evaluates your medical profile and determines whether Sermorelin is appropriate for you.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="w-14 h-14 bg-amber-500/15 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-bold font-mono">
                03
              </div>
              <h3 className="text-xl font-bold mb-2 font-display text-white">Free, Rush Delivery</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                Once approved and filled, your medication is discreetly shipped straight to your door.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => handleStartIntake()}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-4 px-8 rounded-full text-sm transition-all duration-200 shadow-xl hover:shadow-amber-400/20 hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <span>Begin Your Confidential Consultation</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 text-sm mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-slate-800 pb-8">
          <div>
            <div className="text-white font-bold text-lg mb-3 flex items-center gap-1 font-display">
              <span>SpryMD</span>
              <span className="text-amber-400 font-normal">.ai</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mb-2 font-light">
              Support for Energy, Daily Vitality, and Healthy Aging.
            </p>
            <p className="text-xs">
              Direct Contact:{" "}
              <a href="mailto:support@sprymd.ai" className="text-amber-400 hover:underline">
                support@sprymd.ai
              </a>
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2 font-mono">
              Medical Disclaimer
            </h4>
            <p className="text-xs leading-relaxed text-slate-500 font-light">
              These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. Treatment not intended to be prescribed for anti-aging, bodybuilding, or athletic performance. Compounded medications are prepared at licensed U.S. pharmacies upon clinician prescription.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 SpryMD.ai. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/npp" className="hover:text-slate-300 transition-colors">
              Notice of Privacy Practices
            </Link>
            <Link to="/faq" className="hover:text-slate-300 transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Check, Stethoscope, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const steps = [
  { label: "100% Cash-Pay Authorization Held", status: "complete" },
  { label: "Intake Submitted to Tennessee Physician Queue", status: "complete" },
  { label: "Physician Reviews Chart & E-Prescribes (within 24h)", status: "active" },
  { label: "Empower Pharmacy Fulfills & Next-Day TN Delivery", status: "pending" },
];

const Confirmed = () => (
  <main className="min-h-screen bg-off-white flex items-center justify-center px-4 py-24">
    <AnimatedSection>
      <div className="card-base shadow-xl max-w-[580px] w-full p-8 md:p-10 rounded-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-600 mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/20">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-navy text-3xl md:text-4xl font-bold mb-2">
          Consultation & Intake Recorded ✓
        </h1>
        <p className="font-body text-muted-foreground text-base mb-6">
          Your case has been placed in the Tennessee physician review queue.
        </p>

        <div className="bg-muted/40 rounded-xl border border-gray-light p-5 text-left space-y-3.5 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              {s.status === "complete" ? (
                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : s.status === "active" ? (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-300 flex-shrink-0" />
              )}
              <span className={`font-body ${s.status === "pending" ? "text-muted-foreground" : "text-navy font-semibold"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="btn-primary w-full text-center flex items-center justify-center gap-2 py-3.5 text-sm font-semibold"
          >
            Open Patient Dashboard & Tracking <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="btn-secondary w-full text-center block text-xs"
          >
            Return to Home
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-light text-[11px] text-muted-foreground space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            HIPAA-compliant encrypted record · Full refund if clinically contraindicated
          </p>
          <p>
            Tennessee Medical Practice: SpryMD Telehealth Tennessee P.C. · Nashville, TN
          </p>
        </div>
      </div>
    </AnimatedSection>
  </main>
);

export default Confirmed;

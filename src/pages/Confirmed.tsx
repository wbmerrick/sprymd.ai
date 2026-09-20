import { Check } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const steps = [
  { label: "Payment received", status: "complete" },
  { label: "Complete your medical intake", status: "active" },
  { label: "Physician reviews your case", status: "pending" },
  { label: "Prescription processed & shipped", status: "pending" },
];

const Confirmed = () => (
  <main className="min-h-screen bg-off-white flex items-center justify-center px-4 py-24">
    <AnimatedSection>
      <div className="card-base shadow-xl max-w-[560px] w-full p-8 md:p-12 rounded-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-green mx-auto flex items-center justify-center mb-6 animate-scale-check">
          <Check className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-navy text-3xl md:text-4xl font-bold mb-2">Payment Confirmed ✓</h1>
        <p className="font-body text-muted-foreground text-lg mb-8">Your consultation has been started.</p>

        <div className="bg-off-white rounded-xl border border-gray-light p-6 text-left space-y-4 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              {s.status === "complete" ? (
                <div className="w-6 h-6 rounded-full bg-green flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              ) : s.status === "active" ? (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse-dot" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-light flex-shrink-0" />
              )}
              <span className={`font-body text-sm ${s.status === "pending" ? "text-muted-foreground" : "text-navy font-medium"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <a
          href="#"
          className="btn-primary-lg w-full text-center block"
          onClick={(e) => { e.preventDefault(); alert("Replace # with your Healthie intake URL"); }}
        >
          Complete My Medical Intake →
        </a>
        <p className="font-body text-muted-foreground text-xs mt-4">
          You'll be taken to our secure HIPAA-compliant patient portal to complete your health history. Takes about 5 minutes.
        </p>
        <p className="font-body text-muted-foreground text-xs mt-3">
          A confirmation email has been sent to the address you provided.
        </p>
      </div>
    </AnimatedSection>
  </main>
);

export default Confirmed;

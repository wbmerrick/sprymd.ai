import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { writeStoredSessionId, ensureSessionId, isSupabaseConfigured } from "@/lib/intake/persist";
import { createDemoEncounter } from "@/lib/encounters";

const Confirmed = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fromUrl = searchParams.get("session");
    const sessionId = fromUrl ?? ensureSessionId();
    if (fromUrl) writeStoredSessionId(fromUrl);

    if (!isSupabaseConfigured()) {
      createDemoEncounter(sessionId, "paid");
    }
  }, [searchParams]);

  const portalHref = "/portal";

  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center px-4 py-24">
      <AnimatedSection>
        <div className="card-base shadow-xl max-w-[560px] w-full p-8 md:p-12 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-green mx-auto flex items-center justify-center mb-6 animate-scale-check">
            <Check className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-foreground text-3xl md:text-4xl font-bold mb-2">Payment Confirmed ✓</h1>
          <p className="font-body text-muted-foreground text-lg mb-8">Your consultation has been started.</p>

          <div className="bg-off-white rounded-xl border border-gray-light p-6 text-left space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-body text-sm text-foreground font-medium">Payment received</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse-dot" />
              </div>
              <span className="font-body text-sm text-foreground font-medium">Complete your medical intake</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-light flex-shrink-0" />
              <span className="font-body text-sm text-muted-foreground">Physician reviews your case</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-light flex-shrink-0" />
              <span className="font-body text-sm text-muted-foreground">Prescription processed &amp; shipped</span>
            </div>
          </div>

          <Link to={portalHref} className="btn-primary-lg w-full text-center block">
            Go to My Care Portal →
          </Link>
          <Link
            to="/quiz"
            className="font-body text-primary text-sm mt-4 inline-block hover:underline"
          >
            Complete My Medical Intake →
          </Link>
          <p className="font-body text-muted-foreground text-xs mt-4">
            Track your visit status, message your care team, and request refills from your patient portal.
          </p>
          <p className="font-body text-muted-foreground text-xs mt-3">
            A confirmation email has been sent to the address you provided.
          </p>
        </div>
      </AnimatedSection>
    </main>
  );
};

export default Confirmed;

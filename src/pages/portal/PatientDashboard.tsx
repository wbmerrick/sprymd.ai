import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Pill, ClipboardList } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import EncounterStatus from "./EncounterStatus";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { fetchEncounterBySession } from "@/lib/encounters";
import type { Encounter } from "@/lib/encounters";
import { ensureSessionId, readStoredSessionId } from "@/lib/intake/persist";
import { createDemoEncounter } from "@/lib/encounters";

const PatientDashboard = () => {
  const { email, isDemoMode } = usePatientAuth();
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const sessionId = readStoredSessionId() ?? ensureSessionId();

      if (isDemoMode) {
        let demo = await fetchEncounterBySession(sessionId);
        if (!demo) {
          demo = createDemoEncounter(sessionId, "paid");
        }
        setEncounter(demo);
        setLoading(false);
        return;
      }

      const data = await fetchEncounterBySession(sessionId);
      setEncounter(data);
      setLoading(false);
    };

    void load();
  }, [isDemoMode]);

  if (loading) {
    return <p className="font-body text-muted-foreground">Loading your care plan…</p>;
  }

  const careState = encounter?.care_state ?? "paid";

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <div>
          <p className="section-label">Welcome back</p>
          <h1 className="font-display text-foreground text-3xl font-bold mb-2">My Care</h1>
          <p className="font-body text-muted-foreground">
            {email ? `Signed in as ${email}` : "Track your visit from intake to delivery."}
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <EncounterStatus
          careState={careState}
          serviceLine={encounter?.service_line}
          updatedAt={encounter?.updated_at}
        />
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <div className="grid sm:grid-cols-3 gap-4">
          {careState === "draft_intake" || careState === "paid" ? (
            <Link to="/quiz" className="card-base card-hover group">
              <ClipboardList className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display text-foreground font-semibold mb-1">Complete intake</h3>
              <p className="font-body text-muted-foreground text-sm mb-3">
                Finish your health questionnaire (~5 min).
              </p>
              <span className="link-accent text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Continue <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ) : null}

          <Link to="/portal/messages" className="card-base card-hover group">
            <MessageSquare className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display text-foreground font-semibold mb-1">Messages</h3>
            <p className="font-body text-muted-foreground text-sm mb-3">
              Secure messaging with your care team.
            </p>
            <span className="link-accent text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Open inbox <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link to="/portal/refill" className="card-base card-hover group">
            <Pill className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display text-foreground font-semibold mb-1">Request refill</h3>
            <p className="font-body text-muted-foreground text-sm mb-3">
              Renew your prescription when eligible.
            </p>
            <span className="link-accent text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Request <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </AnimatedSection>

      {isDemoMode && (
        <p className="font-body text-muted-foreground text-xs">
          Demo mode — care status is stored locally. Connect Supabase for live updates.
        </p>
      )}
    </div>
  );
};

export default PatientDashboard;

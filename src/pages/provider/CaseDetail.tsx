import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CARE_STATE_LABELS } from "@/lib/care-states";
import { getAuditLogForEncounter, type AuditEntry } from "@/lib/audit";
import {
  fetchEncounterById,
  formatEncounterRef,
  formatIntakeValue,
  INTAKE_FIELD_LABELS,
  updateEncounterCareState,
  type ProviderEncounter,
} from "@/lib/provider-encounters";

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [encounter, setEncounter] = useState<ProviderEncounter | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      const data = await fetchEncounterById(id);
      if (!data) {
        setNotFound(true);
        setEncounter(null);
      } else {
        setEncounter(data);
        setAuditLog(getAuditLogForEncounter(id));
        setNotFound(false);
      }
      setLoading(false);
    };

    load();
  }, [id]);

  const handleDecision = async (decision: "approve" | "decline") => {
    if (!id || !encounter) return;

    setActing(true);
    const nextState = decision === "approve" ? "prescribed" : "declined";
    const action =
      decision === "approve"
        ? "Case approved — prescription authorized"
        : "Case declined — patient will be notified";

    const updated = await updateEncounterCareState(id, nextState, action);
    if (updated) {
      setEncounter(updated);
      setAuditLog(getAuditLogForEncounter(id));
    }
    setActing(false);
    navigate("/provider");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-off-white py-24 px-4">
        <div className="section-container max-w-3xl">
          <p className="font-body text-muted-foreground">Loading case…</p>
        </div>
      </main>
    );
  }

  if (notFound || !encounter) {
    return (
      <main className="min-h-screen bg-off-white py-24 px-4">
        <div className="section-container max-w-3xl text-center">
          <p className="font-display text-foreground text-2xl font-bold mb-4">Case not found</p>
          <Link to="/provider" className="font-body text-primary hover:underline">
            ← Back to queue
          </Link>
        </div>
      </main>
    );
  }

  const isActionable =
    encounter.care_state === "paid" || encounter.care_state === "under_review";

  return (
    <main className="min-h-screen bg-off-white py-24 px-4">
      <div className="section-container max-w-3xl">
        <Link
          to="/provider"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to queue
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-foreground text-3xl font-bold">
              {formatEncounterRef(encounter.id)}
            </h1>
            <p className="font-body text-muted-foreground text-sm mt-1">
              Submitted {new Date(encounter.submitted_at).toLocaleString()}
            </p>
          </div>
          <Badge variant={encounter.care_state === "declined" ? "destructive" : "default"}>
            {CARE_STATE_LABELS[encounter.care_state]}
          </Badge>
        </div>

        <section className="card-base mb-6">
          <h2 className="font-display text-foreground text-xl font-bold mb-4">Intake responses</h2>
          <dl className="space-y-4">
            {(Object.keys(INTAKE_FIELD_LABELS) as Array<keyof typeof INTAKE_FIELD_LABELS>).map(
              (key) => (
                <div key={key} className="border-b border-gray-light pb-3 last:border-0 last:pb-0">
                  <dt className="font-body text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {INTAKE_FIELD_LABELS[key]}
                  </dt>
                  <dd className="font-body text-foreground">
                    {formatIntakeValue(encounter.intake_answers[key])}
                  </dd>
                </div>
              ),
            )}
          </dl>
        </section>

        {isActionable && (
          <section className="card-base mb-6">
            <h2 className="font-display text-foreground text-xl font-bold mb-4">Clinical decision</h2>
            <p className="font-body text-muted-foreground text-sm mb-6">
              Review intake responses and approve or decline this case. Actions are logged to the
              audit trail.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="rounded-full flex-1" disabled={acting}>
                    <Check className="w-4 h-4" />
                    Approve prescription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve this case?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will move the case to prescribed status and authorize pharmacy
                      fulfillment.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDecision("approve")}>
                      Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="rounded-full flex-1" disabled={acting}>
                    <X className="w-4 h-4" />
                    Decline
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Decline this case?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The patient will be notified that treatment was not appropriate at this time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDecision("decline")}>
                      Decline
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        )}

        <section className="card-base">
          <h2 className="font-display text-foreground text-xl font-bold mb-4">Audit trail</h2>
          {auditLog.length === 0 ? (
            <p className="font-body text-muted-foreground text-sm">No actions recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {auditLog.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-light pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-body text-sm text-foreground">{entry.action}</span>
                  <span className="font-body text-xs text-muted-foreground">
                    {entry.actor} · {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default CaseDetail;

import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ClipboardList, LogOut, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CARE_STATE_LABELS } from "@/lib/care-states";
import { fetchReviewQueue, formatEncounterRef, type ProviderEncounter } from "@/lib/provider-encounters";
import { signOutProvider } from "@/lib/provider-auth";
import type { ProviderOutletContext } from "./ProviderGate";

const ReviewQueue = () => {
  const { signOut } = useOutletContext<ProviderOutletContext>();
  const [encounters, setEncounters] = useState<ProviderEncounter[]>([]);
  const [source, setSource] = useState<"supabase" | "mock">("mock");
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    const result = await fetchReviewQueue();
    setEncounters(result.encounters);
    setSource(result.source);
    setLoading(false);
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleSignOut = () => {
    signOutProvider();
    signOut();
  };

  return (
    <main className="min-h-screen bg-off-white py-24 px-4">
      <div className="section-container max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="section-label mb-1">Provider Console</p>
            <h1 className="font-display text-foreground text-3xl font-bold">Review Queue</h1>
            <p className="font-body text-muted-foreground text-sm mt-1">
              Cases awaiting physician review · Dr. Merrick
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadQueue} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>

        {source === "mock" && (
          <p className="font-body text-xs text-muted-foreground bg-muted rounded-lg px-4 py-2 mb-6">
            Demo mode — showing sample encounters (Supabase unavailable or unconfigured).
          </p>
        )}

        {loading ? (
          <div className="card-base text-center py-12">
            <p className="font-body text-muted-foreground">Loading queue…</p>
          </div>
        ) : encounters.length === 0 ? (
          <div className="card-base text-center py-12">
            <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-foreground text-xl font-semibold mb-2">Queue is clear</p>
            <p className="font-body text-muted-foreground text-sm">
              No cases in paid or under-review status.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {encounters.map((encounter) => (
              <li key={encounter.id}>
                <Link
                  to={`/provider/case/${encounter.id}`}
                  className="card-base card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 block"
                >
                  <div>
                    <p className="font-body font-semibold text-foreground">
                      {formatEncounterRef(encounter.id)}
                    </p>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      Submitted {new Date(encounter.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={encounter.care_state === "under_review" ? "default" : "secondary"}
                    className="self-start sm:self-center"
                  >
                    {CARE_STATE_LABELS[encounter.care_state]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default ReviewQueue;

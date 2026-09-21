import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Pill } from "lucide-react";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import type { Encounter } from "@/lib/encounters";
import { fetchEncounterBySession } from "@/lib/encounters";
import { flags } from "@/lib/flags";
import { isSupabaseConfigured, readStoredSessionId } from "@/lib/intake/persist";

type RefillStatus = "requested" | "approved" | "denied";

interface RefillRow {
  id: string;
  encounter_id: string;
  status: RefillStatus;
  note: string | null;
  created_at: string;
}

const mockRefillsKey = (encounterId: string) => `spry_mock_refills_${encounterId}`;

const readMockRefills = (encounterId: string): RefillRow[] => {
  try {
    const raw = localStorage.getItem(mockRefillsKey(encounterId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RefillRow[]) : [];
  } catch {
    return [];
  }
};

const writeMockRefills = (encounterId: string, rows: RefillRow[]): void => {
  try {
    localStorage.setItem(mockRefillsKey(encounterId), JSON.stringify(rows));
  } catch {
    // ignore storage failures in private browsing
  }
};

const STATUS_STYLES: Record<RefillStatus, string> = {
  requested: "bg-amber-100 text-amber-800",
  approved: "bg-green/10 text-green",
  denied: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<RefillStatus, string> = {
  requested: "Pending review",
  approved: "Approved",
  denied: "Not approved",
};

const RefillHeader = ({ subtitle }: { subtitle: string }) => (
  <AnimatedSection>
    <p className="section-label">Prescription renewal</p>
    <h1 className="font-display text-foreground text-3xl font-bold mb-2">Request a Refill</h1>
    <p className="font-body text-muted-foreground">{subtitle}</p>
  </AnimatedSection>
);

const RefillComingSoon = () => (
  <div className="space-y-6">
    <RefillHeader subtitle="Refill requests will be available once you're on active treatment." />
    <AnimatedSection delay={0.1}>
      <div className="card-base text-center py-16">
        <Pill className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-display text-foreground text-lg font-semibold mb-2">
          Refills launch soon
        </h2>
        <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto">
          After your first prescription is fulfilled and you're in active care, you can request
          refills here. Your physician will review each renewal.
        </p>
      </div>
    </AnimatedSection>
  </div>
);

const RefillForm = () => {
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [requests, setRequests] = useState<RefillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const sessionId = readStoredSessionId();
      if (!sessionId) {
        setLoading(false);
        return;
      }

      const enc = await fetchEncounterBySession(sessionId);
      setEncounter(enc);
      if (!enc) {
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("refill_requests")
          .select("*")
          .eq("encounter_id", enc.id)
          .order("created_at", { ascending: false });

        if (error || !data) {
          setRequests([]);
        } else {
          // status is a loose string column; narrow it to the union.
          setRequests(data.map((row) => ({ ...row, status: row.status as RefillStatus })));
        }
      } else {
        setRequests(readMockRefills(enc.id));
      }

      setLoading(false);
    };

    void load();
  }, []);

  const handleSubmit = async () => {
    if (!encounter || submitting) return;
    setSubmitting(true);

    const trimmedNote = note.trim();
    // Reconstruct the row client-side: after an anonymous insert, RLS can
    // block selecting the row back, so we never re-query what we just wrote.
    const request: RefillRow = {
      id: crypto.randomUUID(),
      encounter_id: encounter.id,
      status: "requested",
      note: trimmedNote || null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("refill_requests").insert({
        encounter_id: encounter.id,
        status: "requested",
        note: trimmedNote || null,
      });
      if (error) {
        toast.error("Refill request failed", { description: error.message });
        setSubmitting(false);
        return;
      }
    } else {
      writeMockRefills(encounter.id, [request, ...readMockRefills(encounter.id)]);
    }

    setRequests((prev) => [request, ...prev]);
    setNote("");
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <RefillHeader subtitle="Request a prescription renewal from your physician." />
        <p className="font-body text-muted-foreground">Loading your refill history…</p>
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="space-y-6">
        <RefillHeader subtitle="Request a prescription renewal from your physician." />
        <AnimatedSection delay={0.1}>
          <div className="card-base text-center py-16">
            <Pill className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-display text-foreground text-lg font-semibold mb-2">
              No visit found
            </h2>
            <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Complete your health questionnaire and first prescription before requesting
              a refill.
            </p>
            <Link to="/quiz" className="btn-secondary">Start my visit</Link>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RefillHeader subtitle="Request a prescription renewal from your physician." />

      <AnimatedSection delay={0.1}>
        {submitted ? (
          <div className="card-base text-center py-12">
            <div className="w-14 h-14 rounded-full bg-green/10 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-green" />
            </div>
            <h2 className="font-display text-foreground text-xl font-bold mb-2">
              Refill request received
            </h2>
            <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Your physician will review your renewal within 24 hours. We'll email you
              once it's approved and your medication ships.
            </p>
            <button type="button" onClick={() => setSubmitted(false)} className="btn-secondary">
              Request another refill
            </button>
          </div>
        ) : (
          <div className="card-base">
            <h2 className="font-display text-foreground text-lg font-semibold mb-1">
              New refill request
            </h2>
            <p className="font-body text-muted-foreground text-sm mb-4">
              Add an optional note for your physician — dosage feedback, side effects,
              or anything that's changed since your last visit.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note for your physician…"
              className="w-full rounded-xl border-2 border-gray-light p-4 font-body text-sm text-foreground resize-none h-28 focus:outline-none focus:border-primary transition-colors mb-4"
            />
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Request Refill"}
            </button>
          </div>
        )}
      </AnimatedSection>

      {requests.length > 0 && (
        <AnimatedSection delay={0.15}>
          <div className="card-base">
            <h2 className="font-display text-foreground text-lg font-semibold mb-4">
              Past requests
            </h2>
            <ul className="space-y-3">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-gray-light p-4"
                >
                  <div className="min-w-0">
                    <p className="font-body text-foreground text-sm font-medium">
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {r.note && (
                      <p className="font-body text-muted-foreground text-sm truncate">{r.note}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex self-start sm:self-center rounded-full px-3 py-1 font-body text-xs font-semibold ${STATUS_STYLES[r.status]}`}
                  >
                    {STATUS_LABELS[r.status]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
};

const RefillRequest = () => (flags.refills ? <RefillForm /> : <RefillComingSoon />);

export default RefillRequest;

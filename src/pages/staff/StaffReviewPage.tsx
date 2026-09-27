import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ClinicalReviewQueue } from "@/components/dashboard/pro/ClinicalReviewQueue";
import {
  getClinicalCasesForReview,
  hydrateClinicalReviewQueue,
} from "@/lib/patientCareStore";

export default function StaffReviewPage() {
  const { email } = useOutletContext<{ email: string; name: string }>();
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await hydrateClinicalReviewQueue();
      if (!cancelled) {
        setTick((t) => t + 1);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  const clinicalCases = useMemo(() => {
    void tick;
    return getClinicalCasesForReview(email);
  }, [email, tick]);

  const pending = clinicalCases.filter(
    (c) => c.status === "pending_review" || c.status === "needs_info",
  ).length;

  const refresh = useCallback(() => {
    void (async () => {
      await hydrateClinicalReviewQueue();
      setTick((t) => t + 1);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <Link
          to="/staff"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#C89E67]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to inbox
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">
          Clinician workspace
        </p>
        <h1 className="text-2xl font-semibold text-white md:text-3xl font-display">
          Authorize care safely
        </h1>
        <p className="max-w-2xl text-sm text-zinc-500">
          Review intakes, approve or decline protocols, and request more information before pharmacy
          release.
          {loading
            ? " Loading queue…"
            : pending > 0
              ? ` ${pending} chart${pending === 1 ? "" : "s"} waiting.`
              : " Queue is clear."}
        </p>
      </header>

      <ClinicalReviewQueue
        clinicalCases={clinicalCases}
        userEmail={email}
        onActionComplete={refresh}
      />
    </div>
  );
}

import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Clock, Send, ShieldCheck, Stethoscope, ChevronDown, ChevronUp, User, MapPin, Pill, FileText } from "lucide-react";
import type { ClinicalCase } from "@/types/dashboard";
import { approveClinicalCase, requestMoreInfoClinicalCase, denyClinicalCase } from "@/lib/patientCareStore";
import { ProPanel } from "./ProPanel";
import { cn } from "@/lib/utils";

interface ClinicalReviewQueueProps {
  clinicalCases?: ClinicalCase[];
  userEmail?: string;
  onActionComplete?: () => void;
}

export function ClinicalReviewQueue({
  clinicalCases = [],
  userEmail,
  onActionComplete,
}: ClinicalReviewQueueProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [infoPrompt, setInfoPrompt] = useState("");
  const [denyReason, setDenyReason] = useState("");
  const [showInfoInput, setShowInfoInput] = useState<string | null>(null);
  const [showDenyInput, setShowDenyInput] = useState<string | null>(null);

  const pendingCases = clinicalCases.filter((c) => c.status === "pending_review" || c.status === "needs_info");
  const reviewedCases = clinicalCases.filter((c) => c.status === "approved" || c.status === "denied");

  const handleApprove = async (caseId: string) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await approveClinicalCase(caseId, userEmail || "clinician@sprymd.ai");
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        onActionComplete?.();
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to approve prescription." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async (caseId: string) => {
    if (!infoPrompt.trim()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await requestMoreInfoClinicalCase(caseId, infoPrompt, userEmail || "clinician@sprymd.ai");
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setShowInfoInput(null);
        setInfoPrompt("");
        onActionComplete?.();
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to send message." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async (caseId: string) => {
    if (!denyReason.trim()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await denyClinicalCase(caseId, denyReason, userEmail || "clinician@sprymd.ai");
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setShowDenyInput(null);
        setDenyReason("");
        onActionComplete?.();
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to decline case." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ProPanel
      title="Clinician Intake & Rx Approval Queue"
      eyebrow="Licensed Tennessee Physician Review Desk"
      className="border-[#C89E67]/30 bg-[#0C120F]/95"
      action={
        <span className="flex items-center gap-1.5 rounded-full border border-[#C89E67]/30 bg-[#C89E67]/10 px-2.5 py-0.5 text-xs font-medium text-[#C89E67]">
          <Stethoscope className="h-3 w-3" />
          {pendingCases.length} Pending Chart{pendingCases.length === 1 ? "" : "s"}
        </span>
      }
    >
      <div className="space-y-4">
        {feedback && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed",
              feedback.type === "success"
                ? "border border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                : "border border-rose-500/30 bg-rose-950/40 text-rose-300"
            )}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {pendingCases.length === 0 && reviewedCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-400">
            <ShieldCheck className="h-8 w-8 text-[#C89E67]/60 mb-2" />
            <p className="text-sm font-medium text-zinc-300">All Patient Intakes Reviewed</p>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              When new patients complete an intake questionnaire, their case will appear here with contraindication screening.
            </p>
          </div>
        ) : null}

        {/* Pending Cases */}
        {pendingCases.map((c) => {
          const isExpanded = selectedCaseId === c.id;
          const answers = (c.intake || {}) as Record<string, unknown>;
          const hasNitrateFlag = JSON.stringify(answers).toLowerCase().includes("nitrate");

          return (
            <div
              key={c.id}
              className="rounded-xl border border-white/10 bg-[#16211B] p-4 transition-all hover:border-[#C89E67]/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{c.planName || "Intake Protocol"}</span>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        c.status === "pending_review"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      )}
                    >
                      {c.status === "pending_review" ? "Pending Clinician Review" : "Info Requested"}
                    </span>
                    {hasNitrateFlag && (
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40">
                        ⚠ Nitrate Alert
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-zinc-500" />
                      {c.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-[#C89E67]">
                      <MapPin className="h-3 w-3" />
                      TN Resident (Next-Day Delivery)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCaseId(isExpanded ? null : c.id)}
                    className="flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-white/30"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#C89E67]" />
                    {isExpanded ? "Hide Chart" : "View Chart & Answers"}
                    {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </button>
                </div>
              </div>

              {/* Expanded Chart View */}
              {isExpanded && (
                <div className="mt-4 space-y-4 rounded-lg border border-white/5 bg-[#0C120F] p-4 text-xs text-zinc-300">
                  <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] text-[#C89E67]">
                    Patient Medical Intake Questionnaire
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(answers).map(([key, val]) => {
                      if (key === "consents") return null;
                      return (
                        <div key={key} className="rounded border border-white/5 bg-[#101915] p-2.5">
                          <p className="text-[10px] font-mono uppercase text-zinc-500">{key}</p>
                          <p className="mt-0.5 font-medium text-zinc-200">
                            {Array.isArray(val) ? val.join(", ") : typeof val === "object" ? JSON.stringify(val) : String(val)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Consents verification */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[11px] text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Tennessee Telehealth Consent & 100% Cash-Pay Agreement digitally executed.</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleApprove(c.id)}
                      className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Transmit Rx to Empower Pharmacy
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInfoInput(showInfoInput === c.id ? null : c.id)}
                      className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      Request Info / Labs
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDenyInput(showDenyInput === c.id ? null : c.id)}
                      className="flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Decline & Full Refund
                    </button>
                  </div>

                  {/* Info Input */}
                  {showInfoInput === c.id && (
                    <div className="space-y-2 rounded-md border border-amber-500/20 bg-amber-950/20 p-3">
                      <label className="text-[11px] font-medium text-amber-200">
                        Message to patient requesting clarification or recent lab work:
                      </label>
                      <input
                        type="text"
                        value={infoPrompt}
                        onChange={(e) => setInfoPrompt(e.target.value)}
                        placeholder="e.g. Please provide your most recent blood pressure reading or clarify nitrate medication usage."
                        className="w-full rounded border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        disabled={actionLoading || !infoPrompt.trim()}
                        onClick={() => handleRequestInfo(c.id)}
                        className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
                      >
                        Send Secure Message
                      </button>
                    </div>
                  )}

                  {/* Deny Input */}
                  {showDenyInput === c.id && (
                    <div className="space-y-2 rounded-md border border-rose-500/20 bg-rose-950/20 p-3">
                      <label className="text-[11px] font-medium text-rose-200">
                        Reason for declining (shared with patient and recorded on chart):
                      </label>
                      <input
                        type="text"
                        value={denyReason}
                        onChange={(e) => setDenyReason(e.target.value)}
                        placeholder="e.g. Nitrate contraindication or cardiovascular risk factor requires in-person cardiology evaluation."
                        className="w-full rounded border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
                      />
                      <button
                        type="button"
                        disabled={actionLoading || !denyReason.trim()}
                        onClick={() => handleDeny(c.id)}
                        className="rounded bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-50"
                      >
                        Confirm Decline & Process Full Refund
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Recently Reviewed */}
        {reviewedCases.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <h4 className="text-xs font-semibold text-zinc-400 mb-2">Reviewed Cases ({reviewedCases.length})</h4>
            <div className="space-y-2">
              {reviewedCases.slice(0, 3).map((rc) => (
                <div
                  key={rc.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-[#101915] p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Pill className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-zinc-200 font-medium">{rc.planName || "Treatment Plan"}</span>
                    <span className="text-zinc-500">· {rc.email}</span>
                  </div>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
                      rc.status === "approved" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                    )}
                  >
                    {rc.status === "approved" ? "Approved & Dispatched" : "Declined (Refunded)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProPanel>
  );
}

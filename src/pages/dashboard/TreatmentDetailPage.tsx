import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { formatDateRange } from "@/lib/dashboardFormat";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";

export default function TreatmentDetailPage() {
  const { treatmentId } = useParams<{ treatmentId: string }>();
  const { getTreatment } = useDashboard();
  const tx = treatmentId ? getTreatment(treatmentId) : undefined;

  if (!tx) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Treatment not found</h1>
        <Link to="/dashboard/goals" className="text-[#C89E67] hover:underline">
          Back to goals
        </Link>
      </div>
    );
  }

  const actions = [
    { label: "Renew", onClick: () => console.info("stub: renew", tx.id) },
    { label: "Report side effect", onClick: () => console.info("stub: side effect", tx.id) },
    { label: "Add medication", onClick: () => console.info("stub: add medication") },
    { label: "Manage", onClick: () => console.info("stub: manage", tx.id) },
  ];

  return (
    <div className="space-y-8">
      <Link
        to="/dashboard/goals"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Goals
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{tx.category}</p>
            <h1 className="mt-1 text-3xl font-semibold text-white font-display">
              {tx.medicationName}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{tx.dosage}</p>
          </div>
          <StatusChip status={tx.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-[#C89E67]/50 hover:bg-[#C89E67]/10"
            >
              {a.label}
            </button>
          ))}
        </div>
      </header>

      <section
        aria-labelledby="rx-info-heading"
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3"
      >
        <h2 id="rx-info-heading" className="text-sm font-medium uppercase tracking-[0.12em] text-zinc-500">
          Prescription
        </h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-zinc-500">Status</dt>
            <dd className="mt-1">
              <StatusChip status={tx.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Coverage</dt>
            <dd className="mt-1 text-sm text-white">{formatDateRange(tx.startDate, tx.refillThroughDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Refills left</dt>
            <dd className="mt-1 text-sm text-white">{tx.refillsRemaining}</dd>
          </div>
        </dl>
        <p className="text-sm leading-relaxed text-zinc-300">
          <span className="text-zinc-500">Goal · </span>
          {tx.goal}
        </p>
      </section>

      <section aria-labelledby="details-heading">
        <h2 id="details-heading" className="sr-only">
          Medication details
        </h2>
        <Accordion type="multiple" className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-white">
          <AccordionItem value="dosing" className="border-white/10">
            <AccordionTrigger className="text-left text-white hover:no-underline hover:text-[#C89E67]">Dosing instructions</AccordionTrigger>
            <AccordionContent className="text-zinc-400">{tx.dosingInstructions}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="storage" className="border-white/10">
            <AccordionTrigger className="text-left text-white hover:no-underline hover:text-[#C89E67]">Storage</AccordionTrigger>
            <AccordionContent className="text-zinc-400">{tx.storage}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="how" className="border-white/10">
            <AccordionTrigger className="text-left text-white hover:no-underline hover:text-[#C89E67]">How it works</AccordionTrigger>
            <AccordionContent className="text-zinc-400">{tx.howItWorks}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="sides" className="border-white/10">
            <AccordionTrigger className="text-left text-white hover:no-underline hover:text-[#C89E67]">Side effects</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3">
                {(tx.sideEffects || []).map((s) => (
                  <li key={s.effect} className="text-sm">
                    <p className="font-medium text-white">{s.effect}</p>
                    <p className="mt-1 text-zinc-400">{s.mitigation}</p>
                  </li>
                ))}
                {!tx.sideEffects?.length && <p className="text-zinc-500">No listed side effects in mock data.</p>}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="trouble" className="border-white/10">
            <AccordionTrigger className="text-left text-white hover:no-underline hover:text-[#C89E67]">Troubleshooting</AccordionTrigger>
            <AccordionContent className="text-zinc-400">{tx.troubleshooting}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="warnings" className="border-white/10">
            <AccordionTrigger className="text-left text-white hover:no-underline hover:text-[#C89E67]">Warnings & interactions</AccordionTrigger>
            <AccordionContent className="text-zinc-400">{tx.warnings}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}

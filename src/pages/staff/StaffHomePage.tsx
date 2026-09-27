import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Inbox, Stethoscope, ArrowRight, Users } from "lucide-react";
import { StaffInboxPanel } from "@/components/dashboard/pro/StaffInboxPanel";
import { listStaffInbox } from "@/lib/messaging";
import {
  getClinicalCasesForReview,
  hydrateClinicalReviewQueue,
} from "@/lib/patientCareStore";
import { listStaffTeamThreads } from "@/lib/staffMessaging";

export default function StaffHomePage() {
  const { email, name } = useOutletContext<{ email: string; name: string }>();
  const [inboxCount, setInboxCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [chartTick, setChartTick] = useState(0);

  const pendingCharts = useMemo(() => {
    void chartTick;
    return getClinicalCasesForReview(email).filter(
      (c) => c.status === "pending_review" || c.status === "needs_info",
    ).length;
  }, [email, chartTick]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [threads, team] = await Promise.all([
        listStaffInbox(),
        listStaffTeamThreads(email),
        hydrateClinicalReviewQueue(),
      ]);
      if (cancelled) return;
      setInboxCount(threads.length);
      setUrgentCount(threads.filter((t) => t.urgency === "urgent").length);
      setUnreadCount(threads.filter((t) => t.staffUnread).length);
      setTeamCount(team.length);
      setChartTick((t) => t + 1);
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  const first = name.trim().split(/\s+/)[0] || "Doctor";

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">Clinician workspace</p>
        <h1
          className="text-2xl font-semibold text-white md:text-3xl"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Clear today&apos;s queue, {first}
        </h1>
        <p className="max-w-2xl text-sm text-zinc-500">
          Triage patient messages by urgency, then finish pending chart reviews. Patients never see this workspace.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li className="rounded-2xl border border-rose-500/25 bg-rose-950/20 p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-rose-300/80">Urgent patients</p>
          <p className="mt-1 text-2xl font-semibold text-white">{urgentCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Priority patient messages</p>
        </li>
        <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Patient inbox</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {inboxCount}
            {unreadCount > 0 && (
              <span className="ml-2 text-sm font-medium text-amber-200">{unreadCount} unread</span>
            )}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
            <Inbox className="h-3.5 w-3.5" /> Reply below
          </p>
        </li>
        <li className="rounded-2xl border border-sky-500/25 bg-sky-950/20 p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-sky-300/80">Team chat</p>
          <p className="mt-1 text-2xl font-semibold text-white">{teamCount}</p>
          <Link
            to="/staff/team"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 hover:underline"
          >
            <Users className="h-3.5 w-3.5" />
            Message colleagues
            <ArrowRight className="h-3 w-3" />
          </Link>
        </li>
        <li className="rounded-2xl border border-[#C89E67]/30 bg-[#C89E67]/10 p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#C89E67]">Chart review</p>
          <p className="mt-1 text-2xl font-semibold text-white">{pendingCharts}</p>
          <Link
            to="/staff/review"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#C89E67] hover:underline"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Open review queue
            <ArrowRight className="h-3 w-3" />
          </Link>
        </li>
      </ul>

      <section aria-labelledby="staff-work-inbox" className="space-y-3">
        <h2 id="staff-work-inbox" className="sr-only">
          Patient message queue
        </h2>
        <StaffInboxPanel userEmail={email} compact />
      </section>
    </div>
  );
}

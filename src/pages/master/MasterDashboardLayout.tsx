import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MasterNav } from "@/components/master/MasterNav";
import {
  restoreCustomerSession,
  getSessionEmail,
  getStoredAccount,
} from "@/lib/customerAccounts";
import { isMasterDashboardEmail, isStaffDashboardEmail } from "@/lib/dashboardRole";

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export default function MasterDashboardLayout() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await restoreCustomerSession();
      if (cancelled) return;
      setEmail(session?.email || getSessionEmail());
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const account = useMemo(() => (email ? getStoredAccount(email) : null), [email]);
  const name = account?.name || "Owner";

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030806] text-emerald-500/70">
        <span className="font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
          Booting command center…
        </span>
      </div>
    );
  }

  if (!email) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?auth=1&returnTo=${returnTo}`} replace />;
  }

  if (!isMasterDashboardEmail(email)) {
    if (isStaffDashboardEmail(email)) return <Navigate to="/staff" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#030806] text-zinc-100"
      style={{ fontFamily: "'IBM Plex Sans', 'DM Sans', system-ui, sans-serif" }}
    >
      {/* Distinct master atmosphere — telemetry grid, not patient wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative z-10">
        <MasterNav name={name} email={email} initials={initials(name, email)} />
        <main className="mx-auto max-w-[1440px] px-3 py-6 md:px-5 md:py-8">
          <Outlet context={{ email, name }} />
        </main>
      </div>
    </div>
  );
}

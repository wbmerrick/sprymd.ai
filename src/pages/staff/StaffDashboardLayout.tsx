import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import BrandAtmosphere from "@/components/brand/BrandAtmosphere";
import { StaffNav } from "@/components/staff/StaffNav";
import {
  restoreCustomerSession,
  getSessionEmail,
  getStoredAccount,
} from "@/lib/customerAccounts";
import { isStaffDashboardEmail } from "@/lib/dashboardRole";

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export default function StaffDashboardLayout() {
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
  const name = account?.name || email?.split("@")[0] || "Staff";

  if (!ready) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] text-zinc-500">
        <span className="relative text-xs tracking-[0.16em] uppercase animate-pulse text-[#C89E67]/80">
          Loading staff workspace…
        </span>
      </div>
    );
  }

  if (!email) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?auth=1&returnTo=${returnTo}`} replace />;
  }

  if (!isStaffDashboardEmail(email)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#050505] text-zinc-100"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <BrandAtmosphere plate="hawaiiDawn" variant="wash" />
      <div className="relative z-10">
        <StaffNav name={name} email={email} initials={initials(name, email)} />
        <main className="mx-auto max-w-[1440px] px-3 py-6 md:px-5 md:py-8">
          <Outlet context={{ email, name }} />
        </main>
      </div>
    </div>
  );
}

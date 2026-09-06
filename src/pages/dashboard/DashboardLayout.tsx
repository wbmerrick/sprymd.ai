import { Outlet, Navigate, useLocation } from "react-router-dom";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { WearableToolbar } from "@/components/dashboard/WearableToolbar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { createContext, useContext } from "react";
import type { UseDashboardDataReturn } from "@/hooks/useDashboardData";

const DashboardContext = createContext<UseDashboardDataReturn | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardLayout");
  return ctx;
}

export default function DashboardLayout() {
  const data = useDashboardData();
  const location = useLocation();

  if (!data.ready) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] text-zinc-500">
        <span className="relative text-xs tracking-[0.16em] uppercase animate-pulse text-[#E87722]/80">
          Loading your care…
        </span>
      </div>
    );
  }

  if (!data.isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?auth=1&returnTo=${returnTo}`} replace />;
  }

  return (
    <DashboardContext.Provider value={data}>
      <div
        className="relative min-h-screen overflow-hidden bg-[#050505] text-zinc-100"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(232,119,34,0.08), transparent 55%)",
          }}
        />
        <div className="relative z-10">
          <DashboardNav user={data.user} unreadCount={data.unreadCount} />
          <main className="mx-auto max-w-[1440px] px-3 py-6 pb-28 md:px-5 md:py-8 md:pb-32">
            <Outlet />
          </main>
          <WearableToolbar />
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

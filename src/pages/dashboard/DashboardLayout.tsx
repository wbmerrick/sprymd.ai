import { Outlet, Navigate, useLocation } from "react-router-dom";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { WearableToolbar } from "@/components/dashboard/WearableToolbar";
import { useDashboardData } from "@/hooks/useDashboardData";
import BrandAtmosphere from "@/components/brand/BrandAtmosphere";
import { FEATURES } from "@/config/features";
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
        <span className="relative text-xs tracking-[0.16em] uppercase animate-pulse text-[#C89E67]/80">
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
        className="relative min-h-screen overflow-hidden bg-[#050505] text-zinc-100 font-body"
      >
        <BrandAtmosphere plate="hawaiiDawn" variant="wash" />
        <div className="relative z-10">
          <DashboardNav user={data.user} unreadCount={data.unreadCount} />
          <main
            className={
              FEATURES.enableDeviceDashboard
                ? "mx-auto max-w-[1440px] px-3 py-6 pb-28 md:px-5 md:py-8 md:pb-32"
                : "mx-auto max-w-[1440px] px-3 py-6 md:px-5 md:py-8"
            }
          >
            <Outlet />
          </main>
          {FEATURES.enableDeviceDashboard ? <WearableToolbar /> : null}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

import { Outlet, Navigate, useLocation } from "react-router-dom";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { useDashboardData } from "@/hooks/useDashboardData";
import { createContext, useContext } from "react";
import type { UseDashboardDataReturn } from "@/hooks/useDashboardData";
import { HexMesh } from "@/components/graphics";

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
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <HexMesh />
        </div>
        <span className="relative font-mono text-xs tracking-[0.16em] uppercase animate-pulse text-[#1EC8A5]/80">
          Syncing uplink…
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
              "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(30,200,165,0.08), transparent 55%), radial-gradient(ellipse 50% 30% at 100% 0%, rgba(18,28,36,0.55), transparent 50%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
          <HexMesh />
        </div>
        <div className="relative z-10">
          <DashboardNav user={data.user} unreadCount={data.unreadCount} />
          <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

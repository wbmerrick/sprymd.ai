import { Outlet } from "react-router-dom";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
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

  return (
    <DashboardContext.Provider value={data}>
      <div className="min-h-screen bg-[#050505] text-zinc-100" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <DashboardNav user={data.user} unreadCount={data.unreadCount} />
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <Outlet />
        </main>
      </div>
    </DashboardContext.Provider>
  );
}

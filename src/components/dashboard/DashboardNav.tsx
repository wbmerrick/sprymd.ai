import { NavLink, Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardUser } from "@/types/dashboard";

const NAV_GROUPS = [
  {
    label: "Care",
    items: [
      { to: "/dashboard", label: "Home", end: true },
      { to: "/dashboard/goals", label: "Goals", end: false },
    ],
  },
  {
    label: "Orders",
    items: [
      { to: "/dashboard/orders", label: "Shipments", end: false },
      { to: "/dashboard/subscriptions", label: "Subscriptions", end: false },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/dashboard/support", label: "Support", end: false },
      { to: "/dashboard/profile", label: "Profile", end: false },
    ],
  },
] as const;

interface DashboardNavProps {
  user: DashboardUser;
  unreadCount: number;
}

export function DashboardNav({ user, unreadCount }: DashboardNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-6 min-w-0">
          <Link to="/" className="shrink-0 font-semibold tracking-tight text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Spry<span className="text-[#1EC8A5]">MD</span>
          </Link>
          <nav aria-label="Patient account" className="hidden md:flex items-center gap-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{group.label}</span>
                <ul className="flex items-center gap-1">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          cn(
                            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-white text-black"
                              : "text-zinc-300 hover:bg-white/5 hover:text-white",
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/support"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-200 hover:bg-white/10"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1EC8A5] px-1 text-[10px] font-semibold text-[#04120e]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/dashboard/profile"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1EC8A5]/20 text-sm font-semibold text-[#1EC8A5] ring-1 ring-[#1EC8A5]/30"
            aria-label={`Account for ${user.name}`}
          >
            {user.avatarInitials}
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <nav aria-label="Patient account mobile" className="flex gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 md:hidden scrollbar-hide">
        {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                isActive ? "bg-white text-black" : "text-zinc-400",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

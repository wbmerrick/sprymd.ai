import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRY_MD_COLOR } from "@/brand/tokens";
import type { DashboardUser } from "@/types/dashboard";
import { signOutCustomer } from "@/lib/customerAccounts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const MOBILE_NAV_ITEMS = NAV_GROUPS.flatMap((group) => [...group.items]);

interface DashboardNavProps {
  user: DashboardUser;
  unreadCount: number;
}

export function DashboardNav({ user, unreadCount }: DashboardNavProps) {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutCustomer();
      navigate("/", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-3 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" className="shrink-0 font-semibold tracking-tight text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Spry<span style={{ color: SPRY_MD_COLOR }}>MD</span>
          </Link>
          <nav aria-label="Patient account" className="hidden items-center gap-6 md:flex">
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
                            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1EC8A5]/20 text-sm font-semibold text-[#1EC8A5] ring-1 ring-[#1EC8A5]/30 outline-none hover:bg-[#1EC8A5]/30 focus-visible:ring-2 focus-visible:ring-[#1EC8A5]"
                aria-label={`Account menu for ${user.name}`}
              >
                {user.avatarInitials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#121214] text-zinc-100">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-white">{user.name}</span>
                  <span className="truncate text-xs text-zinc-500">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
                <Link to="/dashboard/profile">
                  <UserRound className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                disabled={signingOut}
                onSelect={(event) => {
                  event.preventDefault();
                  void handleSignOut();
                }}
                className="cursor-pointer text-rose-300 focus:bg-rose-500/10 focus:text-rose-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {signingOut ? "Signing out…" : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav aria-label="Patient account mobile" className="scrollbar-hide flex gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 md:hidden">
        {MOBILE_NAV_ITEMS.map((item) => (
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

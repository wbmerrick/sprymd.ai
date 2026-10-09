import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Landmark,
  Users,
  BookUser,
  Sparkles,
  Home,
  Inbox,
  MessageSquare,
  Stethoscope,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutCustomer } from "@/lib/customerAccounts";

const PRIMARY = [
  { to: "/master", label: "Command", end: true, icon: LayoutDashboard },
  { to: "/master/finance", label: "Finance", end: false, icon: Landmark },
  { to: "/master/members", label: "Members", end: false, icon: Users },
  { to: "/master/ai", label: "AI advisor", end: false, icon: Sparkles },
] as const;

const CLINICAL = [
  { to: "/staff", label: "SpryMD STAFF home", end: true, icon: Home },
  { to: "/staff", label: "Patient inbox", icon: Inbox },
  { to: "/staff/contacts", label: "All contacts", icon: BookUser },
  { to: "/staff/team", label: "Team chat", icon: MessageSquare },
  { to: "/staff/review", label: "Chart review", icon: Stethoscope },
] as const;

interface MasterNavProps {
  name: string;
  email: string;
  initials: string;
}

export function MasterNav({ name, email, initials }: MasterNavProps) {
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
    <header className="sticky top-0 z-40 border-b border-emerald-500/20 bg-[#030806]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-3 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            to="/master"
            className="shrink-0 font-semibold tracking-tight text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Spry<span className="text-emerald-400">MD</span>
            <span className="ml-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Master
            </span>
          </Link>
          <nav aria-label="Master command" className="hidden items-center gap-1 lg:flex">
            {PRIMARY.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-400 text-[#04120e]"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white",
                  )
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
            <span className="mx-1 h-4 w-px bg-white/10" aria-hidden />
            {CLINICAL.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={"end" in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
                  )
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="truncate text-[11px] text-emerald-500/80">{email}</p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/40">
            {initials}
          </span>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            {signingOut ? "…" : "Sign out"}
          </button>
        </div>
      </div>

      <nav
        aria-label="Master command mobile"
        className="flex gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 lg:hidden"
      >
        {[...PRIMARY, ...CLINICAL].map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={"end" in item ? item.end : false}
            className={({ isActive }) =>
              cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                isActive ? "bg-emerald-400 text-[#04120e]" : "text-zinc-400",
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

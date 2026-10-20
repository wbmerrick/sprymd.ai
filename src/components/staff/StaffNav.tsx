import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { BookUser, Inbox, LogOut, Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutCustomer } from "@/lib/customerAccounts";

/** Staff nav — patient queues + internal team coordination. */
const NAV_ITEMS = [
  { to: "/staff", label: "Patient inbox", end: true, icon: Inbox },
  { to: "/staff/contacts", label: "All contacts", end: false, icon: BookUser },
  { to: "/staff/team", label: "Team chat", end: false, icon: Users },
  { to: "/staff/review", label: "Chart review", end: false, icon: Stethoscope },
] as const;

interface StaffNavProps {
  name: string;
  email: string;
  initials: string;
}

export function StaffNav({ name, email, initials }: StaffNavProps) {
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-3 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            to="/staff"
            className="shrink-0 font-semibold tracking-tight text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Spry<span className="text-[#1EC8A5]">MD</span>
            <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#C89E67]">
              Staff
            </span>
          </Link>
          <nav aria-label="Staff workspace" className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white text-black"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white",
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
            <p className="truncate text-[11px] text-zinc-500">{email}</p>
          </div>
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#C89E67]/20 text-sm font-semibold text-[#C89E67] ring-1 ring-[#C89E67]/35"
            aria-hidden
          >
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
        aria-label="Staff workspace mobile"
        className="flex gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 md:hidden"
      >
        {NAV_ITEMS.map((item) => (
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

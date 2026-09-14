import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Pill, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { flags } from "@/lib/flags";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/portal", label: "My Care", icon: LayoutDashboard, end: true },
  ...(flags.messaging
    ? [{ to: "/portal/messages", label: "Messages", icon: MessageSquare }]
    : []),
  ...(flags.refills ? [{ to: "/portal/refill", label: "Refill", icon: Pill }] : []),
];

const PortalShell = () => {
  const { email, signOut } = usePatientAuth();
  const location = useLocation();

  const isActive = (to: string, end?: boolean) => {
    if (end) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-off-white pt-16">
      <div className="section-container px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="card-base lg:sticky lg:top-24">
              <p className="section-label mb-1">Patient Portal</p>
              <p className="font-body text-sm text-muted-foreground mb-6 truncate">
                {email ?? "Your account"}
              </p>
              <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 font-body text-sm transition-colors whitespace-nowrap ${
                      isActive(item.to, item.end)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex items-center gap-2 w-full mt-6 px-4 py-3 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalShell;

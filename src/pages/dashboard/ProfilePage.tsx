import { Link, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Package,
  RefreshCw,
  Settings,
  FlaskConical,
  LifeBuoy,
  MessageSquare,
  LogOut,
  ChevronRight,
  Ruler,
} from "lucide-react";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";
import { signOutCustomer } from "@/lib/customerAccounts";
import { BodyMetricsPanel } from "@/components/dashboard/pro/BodyMetricsPanel";

export default function ProfilePage() {
  const { user, bodyProfile, bodyGoals, updateBody } = useDashboard();
  const navigate = useNavigate();

  const shortcuts = [
    { to: "/dashboard/support", label: "Counseling", icon: HeartPulse },
    { to: "/dashboard/orders", label: "Orders", icon: Package },
    { to: "/dashboard/subscriptions", label: "Subscriptions", icon: RefreshCw },
  ];

  const settings = [
    { to: "/dashboard/profile", label: "Account settings", icon: Settings },
    { to: "/dashboard/goals", label: "Body size & goals", icon: Ruler },
    { to: "/dashboard/profile", label: "Lab history", icon: FlaskConical },
    { to: "/dashboard/support", label: "Help center", icon: LifeBuoy },
    { to: "/dashboard/support", label: "Support", icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await signOutCustomer();
    navigate("/");
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C89E67]">Account</p>
        <h1 className="text-3xl font-semibold text-white font-display">
          {user.name}
        </h1>
        <p className="text-sm text-zinc-400">{user.email}</p>
      </header>

      <BodyMetricsPanel bodyProfile={bodyProfile} bodyGoals={bodyGoals || []} onUpdateBody={updateBody} />

      <section aria-labelledby="shortcuts-heading">
        <h2 id="shortcuts-heading" className="sr-only">
          Shortcuts
        </h2>
        <ul className="grid grid-cols-3 gap-3">
          {shortcuts.map((s) => (
            <li key={s.label}>
              <Link
                to={s.to}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-5 text-center transition hover:border-[#C89E67]/40"
              >
                <s.icon className="h-5 w-5 text-[#C89E67]" aria-hidden />
                <span className="text-xs font-medium text-zinc-200">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-zinc-500">
          Settings
        </h2>
        <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
          {settings.map((item) => (
            <li key={item.label}>
              <Link
                to={item.to}
                className="flex items-center gap-3 px-4 py-4 text-sm text-white transition hover:bg-white/[0.04]"
              >
                <item.icon className="h-4 w-4 text-zinc-500" aria-hidden />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-zinc-600" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-rose-400/40 hover:text-rose-200"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  );
}

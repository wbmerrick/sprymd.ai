import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { formatMoney, formatShortDate } from "@/lib/dashboardFormat";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";

export default function SubscriptionsPage() {
  const { subscriptions, getTreatment, toggleAutoship } = useDashboard();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C89E67]">Orders</p>
        <h1 className="text-3xl font-semibold text-white font-display">
          Subscriptions
        </h1>
        <p className="text-sm text-zinc-400">
          Billing for each care plan — linked to your treatments.
        </p>
      </header>

      <ul className="grid gap-3">
        {subscriptions.map((sub) => {
          const tx = getTreatment(sub.treatmentId);
          return (
            <li
              key={sub.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    to={`/dashboard/goals/${sub.treatmentId}`}
                    className="text-lg font-medium text-white hover:text-[#C89E67] font-display"
                  >
                    {tx?.medicationName || "Treatment"}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-400">
                    {formatMoney(sub.price)} · {sub.billingCadence}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Next charge {formatShortDate(sub.nextChargeDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor={`autoship-${sub.id}`} className="text-sm text-zinc-400">
                    Autoship
                  </label>
                  <Switch
                    id={`autoship-${sub.id}`}
                    checked={sub.autoshipEnabled}
                    onCheckedChange={(checked) => toggleAutoship(sub.id, checked)}
                    aria-label={`Autoship for ${tx?.medicationName || "treatment"}`}
                    className="data-[state=checked]:bg-[#C89E67] data-[state=unchecked]:bg-zinc-600"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

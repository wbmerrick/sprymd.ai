import { useState } from "react";
import { Link } from "react-router-dom";
import { SimpleTabs } from "@/components/dashboard/SimpleTabs";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { formatMoney, formatShortDate } from "@/lib/dashboardFormat";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";

export default function OrdersPage() {
  const { shipments, transactions } = useDashboard();
  const [tab, setTab] = useState("shipments");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C89E67]">Orders</p>
        <h1 className="text-3xl font-semibold text-white font-display">
          Orders
        </h1>
        <p className="text-sm text-zinc-400">Shipments link back to the treatment they fulfill.</p>
      </header>

      <SimpleTabs
        tabs={[
          { id: "shipments", label: "Shipments" },
          { id: "transactions", label: "Transactions" },
        ]}
        activeId={tab}
        onChange={setTab}
      />

      {tab === "shipments" && (
        <section role="tabpanel" aria-labelledby="tab-shipments" className="space-y-2">
          <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
            {shipments.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <Link
                    to={`/dashboard/goals/${s.treatmentId}`}
                    className="font-medium text-white hover:text-[#C89E67]"
                  >
                    {s.medicationName}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-500">
                    {s.nextShipmentDate ? formatShortDate(s.nextShipmentDate) : "Delivered"}
                    {" · "}Qty {s.quantity ?? 1}
                  </p>
                </div>
                <StatusChip status={s.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "transactions" && (
        <section role="tabpanel" aria-labelledby="tab-transactions" className="space-y-2">
          <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
            {transactions.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-medium text-white">{t.product}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatShortDate(t.date)} · Qty {t.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-zinc-300">{formatMoney(t.amount)}</span>
                  <StatusChip status={t.status.toLowerCase()} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

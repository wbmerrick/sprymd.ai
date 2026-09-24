import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import type { Shipment } from "@/types/dashboard";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { formatShortDate } from "@/lib/dashboardFormat";

interface UpcomingShipmentsProps {
  shipments: Shipment[];
}

export function UpcomingShipments({ shipments }: UpcomingShipmentsProps) {
  const upcoming = shipments.filter((s) => s.status !== "delivered");

  return (
    <section aria-labelledby="shipments-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 id="shipments-heading" className="text-lg font-semibold text-white font-display">
          Upcoming shipments
        </h2>
        <Link to="/dashboard/orders" className="text-sm text-[#C89E67] hover:underline">
          View orders
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-zinc-500">
          No shipments scheduled.
        </p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((s) => (
            <li key={s.id}>
              <Link
                to={`/dashboard/goals/${s.treatmentId}`}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-[#C89E67]/35"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                  <Package className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{s.medicationName}</p>
                  <p className="text-xs text-zinc-500">
                    {s.nextShipmentDate
                      ? `Next · ${formatShortDate(s.nextShipmentDate)}`
                      : "Date pending"}
                    {" · "}linked treatment
                  </p>
                </div>
                <StatusChip status={s.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

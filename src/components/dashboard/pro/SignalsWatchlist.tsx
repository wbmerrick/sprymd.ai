import { Link } from "react-router-dom";
import type { WearableDevice, WearableKind, WearableReading } from "@/types/dashboard";
import { WEARABLE_IMAGES } from "@/data/wearables";
import { cn } from "@/lib/utils";
import { ProPanel } from "./ProPanel";
import { FEATURES } from "@/config/features";

function lastFor(deviceId: WearableKind, readings: WearableReading[]) {
  return readings.find((r) => r.deviceId === deviceId);
}

export function SignalsWatchlist({
  devices,
  readings,
  selectedId,
  onSelect,
}: {
  devices: WearableDevice[];
  readings: WearableReading[];
  selectedId: WearableKind | null;
  onSelect: (id: WearableKind) => void;
}) {
  const owned = devices.filter((d) => d.owned);
  const locked = devices.filter((d) => !d.owned);

  return (
    <ProPanel
      title="Your devices"
      eyebrow="Connected gear"
      dense
      action={
        FEATURES.enableShop ? (
          <Link
            to="/?view=marketplace&filter=Devices"
            className="font-mono text-[10px] uppercase tracking-wider text-[#C89E67] hover:underline"
          >
            + Buy
          </Link>
        ) : undefined
      }
      className="min-h-[280px]"
    >
      <ul className="space-y-0.5">
        {owned.map((d) => {
          const last = lastFor(d.id, readings);
          const live = d.syncMode === "continuous" || d.status === "monitoring";
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => onSelect(d.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition",
                  selectedId === d.id ? "bg-[#C89E67]/12 ring-1 ring-[#C89E67]/30" : "hover:bg-white/[0.04]",
                )}
              >
                <img
                  src={WEARABLE_IMAGES[d.imageKey] || WEARABLE_IMAGES.bp_monitor}
                  alt=""
                  className="h-7 w-7 rounded object-cover opacity-90"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-[#C89E67]" : "bg-zinc-600")} />
                    <p className="truncate text-xs font-medium text-zinc-100">
                      {d.brand} · {d.name}
                    </p>
                  </div>
                  <p className="truncate font-mono text-[10px] text-zinc-500">
                    {last ? `${last.metric} ${last.value}${last.unit}` : "No readings"}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {FEATURES.enableShop && locked.length > 0 ? (
        <div className="mt-3 border-t border-white/5 pt-2">
          <p className="mb-1 px-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Locked</p>
          <ul className="space-y-0.5">
            {locked.slice(0, 5).map((d) => (
              <li key={d.id}>
                <Link
                  to="/?view=marketplace&filter=Devices"
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
                >
                  <span>
                    {d.brand} {d.name}
                  </span>
                  <span className="font-mono text-[10px] text-[#C89E67]">${d.priceUsd}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </ProPanel>
  );
}

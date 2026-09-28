import { WEARABLE_IMAGES, WEARABLE_CATALOG } from "@/data/wearables";
import type { WearableReading } from "@/types/dashboard";

function deviceMeta(deviceId: string) {
  return WEARABLE_CATALOG.find((d) => d.id === deviceId);
}

function formatValue(r: WearableReading) {
  // BP special-case when note indicates systolic/diastolic pair stored as value/secondary
  if (r.deviceId === "bp_monitor" && r.secondaryValue != null) {
    return `${r.value}/${r.secondaryValue} ${r.unit}`;
  }
  const primary = `${r.value}${r.unit ? ` ${r.unit}` : ""}`;
  if (r.secondaryValue != null) {
    return `${primary} · ${r.secondaryValue}${r.secondaryUnit ? ` ${r.secondaryUnit}` : ""}`;
  }
  return primary;
}

interface WearableReadingsProps {
  readings: WearableReading[];
}

export function WearableReadings({ readings }: WearableReadingsProps) {
  const items = readings.slice(0, 8);

  return (
    <section aria-labelledby="wearable-readings-heading" className="space-y-4 pb-24 md:pb-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C89E67]">Home devices</p>
          <h2
            id="wearable-readings-heading"
            className="mt-1 text-2xl font-semibold tracking-tight text-white font-display"
          >
            Wearable readings
          </h2>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-zinc-500 sm:block">
          Upload, sync, or continuously monitor from the toolbar below.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
          <p className="text-sm text-zinc-400">No device data yet.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Open the floating wearables bar to sync a BP monitor, pulse ox, scale, or sleep device.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {WEARABLE_CATALOG.slice(0, 4).map((d) => (
              <div key={d.id} className="h-12 w-12 overflow-hidden rounded-full border border-white/10">
                <img src={WEARABLE_IMAGES[d.imageKey]} alt={d.name} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((r) => {
            const meta = deviceMeta(r.deviceId);
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#C89E67]/30"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  <img
                    src={WEARABLE_IMAGES[r.deviceId] || WEARABLE_IMAGES.bp_monitor}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-white">
                      {meta ? `${meta.brand} ${meta.name}` : r.deviceId}
                    </p>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                      {r.source}
                    </span>
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tracking-tight text-[#C89E67] font-display">
                    {formatValue(r)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {r.metric} · {new Date(r.recordedAt).toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

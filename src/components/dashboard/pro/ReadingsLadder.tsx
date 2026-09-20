import type { WearableReading } from "@/types/dashboard";
import { ProPanel } from "./ProPanel";
import { cn } from "@/lib/utils";

function bandClass(r: WearableReading): string {
  const m = r.metric.toLowerCase();
  if (m.includes("spo") && r.value < 94) return "text-rose-300";
  if (m.includes("blood") && r.value >= 140) return "text-rose-300";
  if (m.includes("glucose") && (r.value < 70 || r.value > 180)) return "text-rose-300";
  if (m.includes("ahi") && r.value > 5) return "text-rose-300";
  return "text-[#C89E67]";
}

export function ReadingsLadder({ readings }: { readings: WearableReading[] }) {
  const rows = readings.slice(0, 24);

  return (
    <ProPanel title="Recent readings" eyebrow="Newest first" dense className="min-h-[220px]">
      {rows.length === 0 ? (
        <p className="px-1 py-6 text-center text-xs text-zinc-500">No readings yet — upload or stream a device.</p>
      ) : (
        <ul className="divide-y divide-white/5 font-mono text-[11px]">
          {rows.map((r, i) => (
            <li
              key={r.id}
              className={cn(
                "grid grid-cols-[1fr_auto_auto] items-center gap-2 px-1 py-1.5",
                i === 0 && "bg-[#C89E67]/08 transition-colors duration-700",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-zinc-300">{r.metric}</p>
                <p className="truncate text-[10px] text-zinc-600">
                  {r.deviceId.replace(/_/g, " ")} · {r.source}
                </p>
              </div>
              <span className={cn("tabular-nums", bandClass(r))}>
                {r.value}
                {r.secondaryValue != null ? `/${r.secondaryValue}` : ""}
                <span className="text-zinc-600"> {r.unit}</span>
              </span>
              <span className="text-[10px] text-zinc-600 tabular-nums">
                {new Date(r.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ProPanel>
  );
}

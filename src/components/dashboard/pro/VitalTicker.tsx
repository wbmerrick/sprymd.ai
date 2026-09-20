import { useMemo } from "react";
import type { BodyProfile, WearableReading } from "@/types/dashboard";
import { computeBmi } from "@/data/wearables";
import { cn } from "@/lib/utils";

function latestByMetric(readings: WearableReading[], match: RegExp): WearableReading | undefined {
  return readings.find((r) => match.test(r.metric));
}

export function VitalTicker({
  readings,
  bodyProfile,
  live,
}: {
  readings: WearableReading[];
  bodyProfile: BodyProfile;
  live: boolean;
}) {
  const items = useMemo(() => {
    const hr = latestByMetric(readings, /heart rate|^hr$|pulse/i);
    const spo2 = latestByMetric(readings, /spo/i);
    const bp = latestByMetric(readings, /blood pressure/i);
    const weight =
      bodyProfile.weightLb != null
        ? { value: bodyProfile.weightLb, unit: "lb", label: "Weight" }
        : latestByMetric(readings, /weight/i);
    const sleep = latestByMetric(readings, /sleep score/i);
    const hrv = latestByMetric(readings, /hrv/i);
    const glucose = latestByMetric(readings, /glucose/i);
    const bmi = computeBmi(bodyProfile.heightCm, bodyProfile.weightLb);

    const row: { key: string; label: string; value: string; hot?: boolean }[] = [];
    if (hr) row.push({ key: "hr", label: "Heart", value: `${hr.value} ${hr.unit}`, hot: true });
    if (spo2) row.push({ key: "spo2", label: "Oxygen", value: `${spo2.value}${spo2.unit}` });
    if (weight && "value" in weight)
      row.push({
        key: "wt",
        label: "Weight",
        value: `${typeof weight.value === "number" ? weight.value : (weight as WearableReading).value} ${"unit" in weight ? weight.unit : "lb"}`,
      });
    if (bp)
      row.push({
        key: "bp",
        label: "BP",
        value: bp.secondaryValue != null ? `${bp.value}/${bp.secondaryValue}` : `${bp.value}`,
      });
    if (sleep) row.push({ key: "sleep", label: "Sleep", value: `${sleep.value}` });
    if (hrv) row.push({ key: "hrv", label: "Recovery", value: `${hrv.value}${hrv.unit}` });
    if (glucose) row.push({ key: "cgm", label: "Sugar", value: `${glucose.value}` });
    if (bmi != null) row.push({ key: "bmi", label: "BMI", value: String(bmi) });
    if (!row.length) {
      row.push(
        { key: "hr", label: "Heart", value: "—" },
        { key: "spo2", label: "Oxygen", value: "—" },
        { key: "wt", label: "Weight", value: "—" },
        { key: "bp", label: "BP", value: "—" },
      );
    }
    return row;
  }, [readings, bodyProfile]);

  return (
    <div className="flex items-stretch gap-0 overflow-hidden rounded-lg border border-white/10 bg-[#0B0B0C]">
      <div className="flex shrink-0 items-center gap-2 border-r border-white/10 px-3 py-2">
        <span
          className={cn(
            "inline-flex h-1.5 w-1.5 rounded-full",
            live ? "bg-[#C89E67] animate-pulse" : "bg-zinc-600",
          )}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          {live ? "Live" : "Idle"}
        </span>
      </div>
      <div className="flex flex-1 items-center gap-1 overflow-x-auto px-1 py-1 scrollbar-hide">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex min-w-[88px] flex-col px-3 py-1.5 transition-colors duration-300"
          >
            <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-500">{item.label}</span>
            <span
              className={cn(
                "font-mono text-sm tabular-nums text-zinc-100",
                item.hot && "text-[#C89E67]",
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

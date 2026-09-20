import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WearableKind, WearableReading } from "@/types/dashboard";
import { ProPanel } from "./ProPanel";

const METRIC_TABS: { id: string; label: string; match: RegExp; kinds?: WearableKind[] }[] = [
  { id: "hr", label: "Heart", match: /heart rate|^hr$|pulse/i },
  { id: "spo2", label: "Oxygen", match: /spo/i },
  { id: "wt", label: "Weight", match: /weight/i },
  { id: "bp", label: "BP", match: /blood pressure/i },
  { id: "sleep", label: "Sleep", match: /sleep score/i },
  { id: "hrv", label: "Recovery", match: /hrv/i },
  { id: "glucose", label: "Sugar", match: /glucose/i },
];

export function BiometricChart({
  readings,
  selectedMetric,
  onSelectMetric,
  selectedDevice,
}: {
  readings: WearableReading[];
  selectedMetric: string;
  onSelectMetric: (id: string) => void;
  selectedDevice: WearableKind | null;
}) {
  const tab = METRIC_TABS.find((t) => t.id === selectedMetric) || METRIC_TABS[0];

  const series = useMemo(() => {
    const filtered = readings
      .filter((r) => tab.match.test(r.metric))
      .filter((r) => !selectedDevice || r.deviceId === selectedDevice)
      .slice(0, 40)
      .reverse()
      .map((r) => ({
        t: new Date(r.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        v: r.value,
        s: r.secondaryValue,
      }));
    return filtered;
  }, [readings, tab, selectedDevice]);

  return (
    <ProPanel
      title="Your body readings"
      eyebrow="Live chart"
      action={
        <div className="flex flex-wrap justify-end gap-1">
          {METRIC_TABS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMetric(m.id)}
              className={
                selectedMetric === m.id
                  ? "rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider bg-[#C89E67]/20 text-[#C89E67]"
                  : "rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-200"
              }
            >
              {m.label}
            </button>
          ))}
        </div>
      }
      className="min-h-[280px]"
    >
      {series.length < 2 ? (
        <div className="flex h-[220px] items-center justify-center text-center">
          <p className="max-w-xs text-sm text-zinc-500">
            Sync a device, upload a file, or turn on live stream to see your {tab.label} numbers.
          </p>
        </div>
      ) : (
        <div className="h-[220px] w-full animate-in fade-in duration-500">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="vitalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C89E67" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C89E67" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} width={36} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "#121214",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Area type="monotone" dataKey="v" stroke="#C89E67" fill="url(#vitalFill)" strokeWidth={1.75} isAnimationActive animationDuration={400} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ProPanel>
  );
}

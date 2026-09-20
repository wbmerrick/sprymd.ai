import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Radio, RefreshCw, Upload } from "lucide-react";
import type { BodyGoalMetric, WearableDevice, WearableKind, WearableSyncMode } from "@/types/dashboard";
import { metricDefaults } from "@/data/wearables";
import { ProPanel } from "./ProPanel";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/config/features";

type Tab = "reading" | "upload" | "goal" | "buy";

export function ActionDock({
  devices,
  selectedId,
  onSelectDevice,
  setWearableSyncMode,
  syncWearable,
  saveWearableReading,
  importWearableFile,
  saveBodyGoal,
}: {
  devices: WearableDevice[];
  selectedId: WearableKind | null;
  onSelectDevice: (id: WearableKind) => void;
  setWearableSyncMode: (id: WearableKind, mode: WearableSyncMode) => void;
  syncWearable: (id: WearableKind) => void;
  saveWearableReading: (input: {
    deviceId: WearableKind;
    metric: string;
    value: number;
    unit: string;
    secondaryValue?: number;
    secondaryUnit?: string;
    note?: string;
    source?: "manual";
  }) => void;
  importWearableFile: (deviceId: WearableKind, fileName: string, text: string) => void;
  saveBodyGoal: (input: {
    title: string;
    metric: BodyGoalMetric;
    targetValue: number;
    unit: string;
    deviceId?: WearableKind;
  }) => void;
}) {
  const owned = devices.filter((d) => d.owned);
  const selected = useMemo(
    () => owned.find((d) => d.id === (selectedId || owned[0]?.id)) || null,
    [owned, selectedId],
  );
  const [tab, setTab] = useState<Tab>("reading");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [note, setNote] = useState("");
  const [goalTitle, setGoalTitle] = useState("Target weight");
  const [goalTarget, setGoalTarget] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const defaults = selected ? metricDefaults(selected.kind) : null;

  useEffect(() => {
    setPrimary("");
    setSecondary("");
    setNote("");
    setNotice("");
    setError("");
  }, [selected?.id]);

  const run = async (fn: () => void | Promise<void>, ok: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice(ok);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const modes: { id: WearableSyncMode; label: string }[] = [
    { id: "manual", label: "Manual" },
    { id: "sync", label: "Sync" },
    { id: "continuous", label: "Stream" },
  ];

  return (
    <ProPanel title="Quick actions" eyebrow="Log · upload · goals" dense className="min-h-[280px]">
      <div className="mb-2 flex gap-1">
        {(
          [
            ["reading", "Reading"],
            ["upload", "Upload"],
            ["goal", "Goal"],
            ...(FEATURES.enableShop ? ([["buy", "Buy"]] as const) : []),
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider",
              tab === id ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-200",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {FEATURES.enableShop && tab === "buy" ? (
        <div className="space-y-3 p-1">
          <p className="text-xs text-zinc-400">
            Add fitness devices — Oura, Whoop, Apple Watch, Garmin, Dexcom — and see their readings here.
          </p>
          <Link
            to="/?view=marketplace&filter=Devices"
            className="inline-flex w-full items-center justify-center rounded-md bg-[#C89E67] px-3 py-2 text-sm font-semibold text-white"
          >
            Open device marketplace
          </Link>
        </div>
      ) : null}

      {tab !== "buy" && !selected ? (
        <p className="p-2 text-xs text-zinc-500">
          {FEATURES.enableShop
            ? "Buy a device to start logging your health numbers."
            : "Connect a device to start logging your health numbers."}
        </p>
      ) : null}

      {tab !== "buy" && selected ? (
        <div className="space-y-2">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Device</span>
            <select
              value={selected.id}
              onChange={(e) => onSelectDevice(e.target.value as WearableKind)}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-zinc-100"
            >
              {owned.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.brand} {d.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-1">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={busy}
                onClick={() => run(() => setWearableSyncMode(selected.id, m.id), `${m.label} mode on`)}
                className={cn(
                  "flex-1 rounded-md border px-1 py-1.5 font-mono text-[10px] uppercase tracking-wider",
                  selected.syncMode === m.id
                    ? "border-[#C89E67]/50 bg-[#C89E67]/15 text-[#C89E67]"
                    : "border-white/10 text-zinc-400 hover:border-white/20",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {tab === "reading" ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="font-mono text-[10px] text-zinc-500">{defaults?.metric}</span>
                  <input
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm"
                    placeholder={defaults?.unit}
                  />
                </label>
                {defaults?.secondaryMetric ? (
                  <label className="block">
                    <span className="font-mono text-[10px] text-zinc-500">{defaults.secondaryMetric}</span>
                    <input
                      value={secondary}
                      onChange={(e) => setSecondary(e.target.value)}
                      className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm"
                      placeholder={defaults.secondaryUnit}
                    />
                  </label>
                ) : null}
              </div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note"
                className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(() => {
                      const value = Number(primary);
                      if (!Number.isFinite(value) || !defaults) throw new Error("Enter a valid value.");
                      const secondaryValue = secondary.trim() === "" ? undefined : Number(secondary);
                      if (secondary.trim() !== "" && !Number.isFinite(secondaryValue)) {
                        throw new Error("Secondary must be a number.");
                      }
                      saveWearableReading({
                        deviceId: selected.id,
                        metric: defaults.metric,
                        value,
                        unit: defaults.unit,
                        secondaryValue,
                        secondaryUnit: secondaryValue != null ? defaults.secondaryUnit : undefined,
                        note: note.trim() || undefined,
                        source: "manual",
                      });
                      setPrimary("");
                      setSecondary("");
                      setNote("");
                    }, "Reading saved")
                  }
                  className="flex-1 rounded-md bg-[#C89E67] px-3 py-2 text-sm font-semibold text-white"
                >
                  Save reading
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => syncWearable(selected.id), "Synced")}
                  className="inline-flex items-center justify-center rounded-md border border-white/15 px-3 text-zinc-200"
                  aria-label="Sync device"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </button>
              </div>
            </>
          ) : null}

          {tab === "upload" ? (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Upload a CSV or JSON file from your device app. New numbers show up right away.</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.tsv,.json,text/csv,application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  await run(() => importWearableFile(selected.id, file.name, text), `Imported ${file.name}`);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm text-zinc-100"
              >
                <Upload className="h-4 w-4" /> Upload data file
              </button>
              {selected.syncMode === "continuous" ? (
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#C89E67]">
                  <Radio className="h-3 w-3" /> Stream active
                </p>
              ) : null}
            </div>
          ) : null}

          {tab === "goal" ? (
            <div className="space-y-2">
              <input
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm"
                placeholder="Goal title"
              />
              <input
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm"
                placeholder="Target value (e.g. 175)"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(() => {
                    const targetValue = Number(goalTarget);
                    if (!Number.isFinite(targetValue)) throw new Error("Enter a target number.");
                    saveBodyGoal({
                      title: goalTitle.trim() || "Body goal",
                      metric: "weight",
                      targetValue,
                      unit: "lb",
                      deviceId: selected.id === "smart_scale" ? "smart_scale" : undefined,
                    });
                    setGoalTarget("");
                  }, "Goal saved")
                }
                className="w-full rounded-md bg-[#C89E67] px-3 py-2 text-sm font-semibold text-white"
              >
                Set goal
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {notice ? <p className="mt-2 text-xs text-[#C89E67]">{notice}</p> : null}
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </ProPanel>
  );
}

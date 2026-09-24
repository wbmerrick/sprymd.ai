import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
  Radio,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";
import { WEARABLE_IMAGES, metricDefaults } from "@/data/wearables";
import type { WearableDevice, WearableKind, WearableSyncMode } from "@/types/dashboard";
import { cn } from "@/lib/utils";

function statusLabel(device: WearableDevice) {
  if (device.syncMode === "continuous" || device.status === "monitoring") return "Monitoring";
  if (device.status === "syncing") return "Syncing";
  if (device.syncMode === "sync" || device.status === "paired") return "Synced";
  return "Manual";
}

export function WearableToolbar() {
  const {
    wearableDevices,
    setWearableSyncMode,
    syncWearable,
    saveWearableReading,
    importWearableFile,
  } = useDashboard();

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<WearableKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [note, setNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const devices = (wearableDevices || []).filter((d) => d.owned !== false);
  const selected = useMemo(
    () => devices.find((d) => d.id === (selectedId || devices[0]?.id)) || null,
    [devices, selectedId],
  );

  useEffect(() => {
    if (!selectedId && devices[0]) setSelectedId(devices[0].id);
  }, [devices, selectedId]);

  useEffect(() => {
    setPrimary("");
    setSecondary("");
    setNote("");
    setNotice("");
    setError("");
  }, [selected?.id]);

  const defaults = selected ? metricDefaults(selected.kind) : null;

  const openDevice = (id: WearableKind) => {
    setSelectedId(id);
    setOpen(true);
  };

  const run = async (fn: () => void | Promise<void>, okMsg: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice(okMsg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const onUpload = async (file: File | null) => {
    if (!file || !selected) return;
    const text = await file.text();
    await run(() => importWearableFile(selected.id, file.name, text), `Imported ${file.name}`);
  };

  const onSaveManual = async () => {
    if (!selected || !defaults) return;
    const value = Number(primary);
    if (!Number.isFinite(value)) {
      setError("Enter a valid primary reading value.");
      return;
    }
    const secondaryValue = secondary.trim() === "" ? undefined : Number(secondary);
    if (secondary.trim() !== "" && !Number.isFinite(secondaryValue)) {
      setError("Secondary value must be a number.");
      return;
    }
    await run(
      () =>
        saveWearableReading({
          deviceId: selected.id,
          metric: defaults.metric,
          value,
          unit: defaults.unit,
          secondaryValue,
          secondaryUnit: secondaryValue != null ? defaults.secondaryUnit : undefined,
          note: note.trim() || undefined,
          source: "manual",
        }),
      "Reading saved to your dashboard",
    );
    setPrimary("");
    setSecondary("");
    setNote("");
  };

  return (
    <>
      {/* Floating dock */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4 md:pb-6">
        <div className="pointer-events-auto w-full max-w-3xl">
          <div
            className={cn(
              "overflow-hidden border border-white/10 bg-[#0B0B0C]/92 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all",
              open ? "rounded-2xl" : "rounded-full",
            )}
          >
            <div className="flex items-center gap-2 px-2 py-2 md:gap-3 md:px-3">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-left"
                aria-expanded={open}
                aria-controls="wearable-panel"
              >
                <Activity className="h-4 w-4 text-[#C89E67]" aria-hidden />
                <span className="hidden sm:inline">
                  <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-[#C89E67]">
                    Wearables
                  </span>
                  <span className="block text-xs text-zinc-300">Home devices</span>
                </span>
                {open ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronUp className="h-4 w-4 text-zinc-500" />}
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-hide md:gap-2">
                {devices.map((device) => {
                  const active = selected?.id === device.id && open;
                  return (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => openDevice(device.id)}
                      className={cn(
                        "group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border transition md:h-14 md:w-14",
                        active
                          ? "border-[#C89E67] ring-2 ring-[#C89E67]/30"
                          : "border-white/10 hover:border-white/25",
                      )}
                      title={`${device.brand} ${device.name}`}
                      aria-label={`${device.name}, ${statusLabel(device)}`}
                    >
                      <img
                        src={WEARABLE_IMAGES[device.imageKey]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={cn(
                          "absolute bottom-1 right-1 h-2 w-2 rounded-full border border-black",
                          device.syncMode === "continuous"
                            ? "bg-[#C89E67]"
                            : device.syncMode === "sync"
                              ? "bg-sky-400"
                              : "bg-zinc-500",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {open && selected && defaults && (
              <div id="wearable-panel" className="border-t border-white/10 px-4 py-4 md:px-5 md:py-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-black/40 md:h-20 md:w-20">
                      <img
                        src={WEARABLE_IMAGES[selected.imageKey]}
                        alt={selected.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#C89E67]">{selected.brand}</p>
                      <h3 className="text-lg font-semibold tracking-tight text-white font-display">
                        {selected.name}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {statusLabel(selected)}
                        {selected.lastSyncedAt
                          ? ` · last ${new Date(selected.lastSyncedAt).toLocaleString()}`
                          : " · no data yet"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                    aria-label="Close wearable panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Sync modes */}
                <div className="mb-4">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500">Data mode</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "manual", label: "Upload", hint: "File / entry" },
                        { id: "sync", label: "Sync", hint: "Pull session" },
                        { id: "continuous", label: "Monitor", hint: "Always on" },
                      ] as { id: WearableSyncMode; label: string; hint: string }[]
                    ).map((mode) => {
                      const on = selected.syncMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => setWearableSyncMode(selected.id, mode.id),
                              mode.id === "continuous"
                                ? "Continuous monitoring enabled"
                                : mode.id === "sync"
                                  ? "Sync mode enabled"
                                  : "Manual upload mode",
                            )
                          }
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-left transition",
                            on
                              ? "border-[#C89E67]/50 bg-[#C89E67]/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20",
                          )}
                        >
                          <span className="block text-sm font-medium text-white">{mode.label}</span>
                          <span className="block text-[11px] text-zinc-500">{mode.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => syncWearable(selected.id), "Device synced")}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Sync now
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(() => setWearableSyncMode(selected.id, "continuous"), "Continuous monitoring on")
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[#C89E67]/40 bg-[#C89E67]/10 px-4 py-2 text-sm font-medium text-[#C89E67] disabled:opacity-50"
                  >
                    <Radio className="h-4 w-4" />
                    Continuous monitoring
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/5 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    Upload data
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.tsv,.txt,.json,text/csv,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      e.target.value = "";
                      void onUpload(file);
                    }}
                  />
                </div>

                {/* Manual entry */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 md:p-4">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    Save reading · {defaults.metric}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs text-zinc-400">
                      {defaults.metric} ({defaults.unit || "value"})
                      <input
                        value={primary}
                        onChange={(e) => setPrimary(e.target.value)}
                        inputMode="decimal"
                        placeholder="e.g. 120"
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C89E67]/50"
                      />
                    </label>
                    {defaults.secondaryMetric && (
                      <label className="block text-xs text-zinc-400">
                        {defaults.secondaryMetric} ({defaults.secondaryUnit})
                        <input
                          value={secondary}
                          onChange={(e) => setSecondary(e.target.value)}
                          inputMode="decimal"
                          placeholder="optional"
                          className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C89E67]/50"
                        />
                      </label>
                    )}
                  </div>
                  <label className="mt-3 block text-xs text-zinc-400">
                    Note
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional context for your clinician"
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C89E67]/50"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onSaveManual()}
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-[#C89E67] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Save to dashboard
                  </button>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                    Uploads accept CSV/JSON exports from your device app. Synced and continuous readings stay private to your account.
                  </p>
                </div>

                {(notice || error) && (
                  <p className={cn("mt-3 text-sm", error ? "text-red-400" : "text-[#C89E67]")}>
                    {error || notice}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

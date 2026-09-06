import { useMemo, useState } from "react";
import type {
  BodyGoal,
  BodyProfile,
  Shipment,
  Treatment,
  WearableDevice,
  WearableKind,
  WearableReading,
  WearableSyncMode,
  BodyGoalMetric,
} from "@/types/dashboard";
import { VitalTicker } from "./VitalTicker";
import { BiometricChart } from "./BiometricChart";
import { SignalsWatchlist } from "./SignalsWatchlist";
import { ActionDock } from "./ActionDock";
import { ReadingsLadder } from "./ReadingsLadder";
import { BodyMetricsPanel } from "./BodyMetricsPanel";
import { CurrentManagement } from "@/components/dashboard/CurrentManagement";
import { UpcomingShipments } from "@/components/dashboard/UpcomingShipments";
import { cn } from "@/lib/utils";

type Preset = "clinical_terminal" | "care_simple" | "device_ops";

const PRESET_KEY = "sprymd_dashboard_preset_v1";

function loadPreset(): Preset {
  try {
    const v = localStorage.getItem(PRESET_KEY);
    if (v === "care_simple" || v === "device_ops" || v === "clinical_terminal") return v;
  } catch {
    /* ignore */
  }
  return "clinical_terminal";
}

export function ClinicalTerminal({
  wearableDevices,
  wearableReadings,
  bodyProfile,
  bodyGoals,
  activeTreatments,
  shipments,
  setWearableSyncMode,
  syncWearable,
  saveWearableReading,
  importWearableFile,
  updateBody,
  saveBodyGoal,
}: {
  wearableDevices: WearableDevice[];
  wearableReadings: WearableReading[];
  bodyProfile: BodyProfile;
  bodyGoals: BodyGoal[];
  activeTreatments: Treatment[];
  shipments: Shipment[];
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
  updateBody: (patch: Partial<Pick<BodyProfile, "heightCm" | "weightLb" | "targetWeightLb">>) => void;
  saveBodyGoal: (input: {
    title: string;
    metric: BodyGoalMetric;
    targetValue: number;
    unit: string;
    deviceId?: WearableKind;
  }) => void;
}) {
  const [preset, setPreset] = useState<Preset>(() => loadPreset());
  const [selectedDevice, setSelectedDevice] = useState<WearableKind | null>(null);
  const [selectedMetric, setSelectedMetric] = useState("hr");

  const live = useMemo(
    () => wearableDevices.some((d) => d.owned && (d.syncMode === "continuous" || d.status === "monitoring")),
    [wearableDevices],
  );

  const changePreset = (p: Preset) => {
    setPreset(p);
    try {
      localStorage.setItem(PRESET_KEY, p);
    } catch {
      /* ignore */
    }
  };

  const showFull = preset === "clinical_terminal";
  const showDeviceOps = preset === "device_ops" || showFull;
  const showCare = preset === "care_simple" || showFull;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#E87722]">Health desk</p>
          <h1 className="text-2xl font-semibold text-white md:text-3xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Your care at a glance
          </h1>
        </div>
        <div className="flex gap-1 rounded-md border border-white/10 p-0.5">
          {(
            [
              ["clinical_terminal", "Full"],
              ["care_simple", "Care"],
              ["device_ops", "Devices"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => changePreset(id)}
              className={cn(
                "rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
                preset === id ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <VitalTicker readings={wearableReadings} bodyProfile={bodyProfile} live={live} />

      {showDeviceOps || showCare ? (
        <div
          className={cn(
            "grid gap-3",
            preset === "care_simple"
              ? "grid-cols-1 lg:grid-cols-[1.4fr_1fr]"
              : "grid-cols-1 lg:grid-cols-[1.4fr_0.9fr_0.9fr]",
          )}
        >
          <BiometricChart
            readings={wearableReadings}
            selectedMetric={selectedMetric}
            onSelectMetric={setSelectedMetric}
            selectedDevice={selectedDevice}
          />
          {preset !== "care_simple" ? (
            <SignalsWatchlist
              devices={wearableDevices}
              readings={wearableReadings}
              selectedId={selectedDevice}
              onSelect={setSelectedDevice}
            />
          ) : null}
          <ActionDock
            devices={wearableDevices}
            selectedId={selectedDevice}
            onSelectDevice={setSelectedDevice}
            setWearableSyncMode={setWearableSyncMode}
            syncWearable={syncWearable}
            saveWearableReading={saveWearableReading}
            importWearableFile={importWearableFile}
            saveBodyGoal={saveBodyGoal}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-3",
          preset === "device_ops"
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1 lg:grid-cols-[0.9fr_0.9fr_1.2fr]",
        )}
      >
        {(showFull || preset === "device_ops") && (
          <BodyMetricsPanel bodyProfile={bodyProfile} bodyGoals={bodyGoals} onUpdateBody={updateBody} />
        )}
        {(showFull || preset === "device_ops") && <ReadingsLadder readings={wearableReadings} />}
        {showCare && (
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-[#0B0B0C]/90 p-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Your care plans</p>
              <CurrentManagement treatments={activeTreatments} />
            </div>
            {preset !== "device_ops" ? (
              <div className="rounded-lg border border-white/10 bg-[#0B0B0C]/90 p-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Shipments on the way</p>
                <UpcomingShipments shipments={shipments} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

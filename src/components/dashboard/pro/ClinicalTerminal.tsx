import { useMemo, useState } from "react";
import type {
  BodyGoal,
  BodyGoalMetric,
  BodyProfile,
  DashboardLayoutConfig,
  Shipment,
  Treatment,
  WearableDevice,
  WearableKind,
  WearableReading,
  WearableSyncMode,
} from "@/types/dashboard";
import { VitalTicker } from "./VitalTicker";
import { BiometricChart } from "./BiometricChart";
import { SignalsWatchlist } from "./SignalsWatchlist";
import { ActionDock } from "./ActionDock";
import { ReadingsLadder } from "./ReadingsLadder";
import { BodyMetricsPanel } from "./BodyMetricsPanel";
import { CurrentManagement } from "@/components/dashboard/CurrentManagement";
import { UpcomingShipments } from "@/components/dashboard/UpcomingShipments";
import { ConnectDevicesPanel } from "./ConnectDevicesPanel";
import { CustomizeDashboardPanel, widgetsForLayout } from "./CustomizeDashboardPanel";
import { cn } from "@/lib/utils";

export function ClinicalTerminal({
  wearableDevices,
  wearableReadings,
  bodyProfile,
  bodyGoals,
  activeTreatments,
  shipments,
  dashboardLayout,
  setWearableSyncMode,
  syncWearable,
  saveWearableReading,
  importWearableFile,
  updateBody,
  saveBodyGoal,
  connectDevice,
  registerCustomDevice,
  saveDashboardLayout,
}: {
  wearableDevices: WearableDevice[];
  wearableReadings: WearableReading[];
  bodyProfile: BodyProfile;
  bodyGoals: BodyGoal[];
  activeTreatments: Treatment[];
  shipments: Shipment[];
  dashboardLayout?: DashboardLayoutConfig;
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
  connectDevice: (id: WearableKind) => void;
  registerCustomDevice: (input: { brand: string; name: string; metrics?: string[] }) => void;
  saveDashboardLayout: (patch: Partial<DashboardLayoutConfig>) => void;
}) {
  const [selectedDevice, setSelectedDevice] = useState<WearableKind | null>(null);
  const [selectedMetric, setSelectedMetric] = useState("hr");
  const [panel, setPanel] = useState<"none" | "connect" | "customize">("none");

  const layout = dashboardLayout;
  const widgets = useMemo(() => widgetsForLayout(layout), [layout]);

  const live = useMemo(
    () => wearableDevices.some((d) => d.owned && (d.syncMode === "continuous" || d.status === "monitoring")),
    [wearableDevices],
  );

  const ownedCount = wearableDevices.filter((d) => d.owned).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">Health desk</p>
          <h1 className="text-2xl font-semibold text-white md:text-3xl font-display">
            Your care at a glance
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {ownedCount} device{ownedCount === 1 ? "" : "s"} connected · layout saved to your account
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPanel((p) => (p === "connect" ? "none" : "connect"))}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold",
              panel === "connect"
                ? "border-[#C89E67] bg-[#C89E67] text-white"
                : "border-white/15 text-zinc-200 hover:border-[#C89E67]/50",
            )}
          >
            Connect devices
          </button>
          <button
            type="button"
            onClick={() => setPanel((p) => (p === "customize" ? "none" : "customize"))}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold",
              panel === "customize"
                ? "border-[#C89E67] bg-[#C89E67] text-white"
                : "border-white/15 text-zinc-200 hover:border-[#C89E67]/50",
            )}
          >
            Customize
          </button>
        </div>
      </div>

      {panel === "connect" ? (
        <ConnectDevicesPanel
          devices={wearableDevices}
          onConnect={(id) => {
            connectDevice(id);
            setSelectedDevice(id);
          }}
          onRegisterCustom={(input) => {
            registerCustomDevice(input);
          }}
          onClose={() => setPanel("none")}
        />
      ) : null}

      {panel === "customize" && layout ? (
        <CustomizeDashboardPanel
          layout={layout}
          onChange={saveDashboardLayout}
          onClose={() => setPanel("none")}
        />
      ) : null}

      {widgets.has("ticker") ? (
        <VitalTicker readings={wearableReadings} bodyProfile={bodyProfile} live={live} />
      ) : null}

      {widgets.has("chart") || widgets.has("devices") || widgets.has("actions") ? (
        <div
          className={cn(
            "grid gap-3",
            widgets.has("chart") && widgets.has("devices") && widgets.has("actions")
              ? "grid-cols-1 lg:grid-cols-[1.4fr_0.9fr_0.9fr]"
              : widgets.has("chart") && (widgets.has("devices") || widgets.has("actions"))
                ? "grid-cols-1 lg:grid-cols-[1.4fr_1fr]"
                : "grid-cols-1",
          )}
        >
          {widgets.has("chart") ? (
            <BiometricChart
              readings={wearableReadings}
              selectedMetric={selectedMetric}
              onSelectMetric={setSelectedMetric}
              selectedDevice={selectedDevice}
            />
          ) : null}
          {widgets.has("devices") ? (
            <SignalsWatchlist
              devices={wearableDevices}
              readings={wearableReadings}
              selectedId={selectedDevice}
              onSelect={setSelectedDevice}
            />
          ) : null}
          {widgets.has("actions") ? (
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
          ) : null}
        </div>
      ) : null}

      {widgets.has("body") || widgets.has("readings") || widgets.has("care") || widgets.has("shipments") ? (
        <div
          className={cn(
            "grid gap-3",
            [widgets.has("body"), widgets.has("readings"), widgets.has("care") || widgets.has("shipments")].filter(Boolean)
              .length >= 3
              ? "grid-cols-1 lg:grid-cols-[0.9fr_0.9fr_1.2fr]"
              : "grid-cols-1 lg:grid-cols-2",
          )}
        >
          {widgets.has("body") ? (
            <BodyMetricsPanel bodyProfile={bodyProfile} bodyGoals={bodyGoals} onUpdateBody={updateBody} />
          ) : null}
          {widgets.has("readings") ? <ReadingsLadder readings={wearableReadings} /> : null}
          {widgets.has("care") || widgets.has("shipments") ? (
            <div className="space-y-3">
              {widgets.has("care") ? (
                <div className="rounded-lg border border-white/10 bg-[#0B0B0C]/90 p-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Your care plans</p>
                  <CurrentManagement treatments={activeTreatments} />
                </div>
              ) : null}
              {widgets.has("shipments") ? (
                <div className="rounded-lg border border-white/10 bg-[#0B0B0C]/90 p-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Shipments on the way</p>
                  <UpcomingShipments shipments={shipments} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

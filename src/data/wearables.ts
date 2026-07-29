import type { WearableDevice, WearableKind, WearableSyncMode } from "@/types/dashboard";
import imgBpMonitor from "@/assets/products/p8_bp_monitor.webp";
import imgPulseOx from "@/assets/products/p9_pulse_oximeter.webp";
import imgSmartScale from "@/assets/products/p10_smart_scale.webp";
import imgCpap from "@/assets/products/p5_nasal_pillow.webp";
import imgSleepMask from "@/assets/products/p6_full_face_mask.webp";

export const WEARABLE_IMAGES: Record<string, string> = {
  bp_monitor: imgBpMonitor,
  pulse_oximeter: imgPulseOx,
  smart_scale: imgSmartScale,
  cpap: imgCpap,
  sleep_tracker: imgSleepMask,
};

export const WEARABLE_CATALOG: Omit<WearableDevice, "syncMode" | "status" | "lastSyncedAt" | "enabled">[] = [
  {
    id: "bp_monitor",
    name: "Smart BP Monitor",
    brand: "Omron",
    kind: "bp_monitor",
    metrics: ["Systolic", "Diastolic", "Pulse"],
    imageKey: "bp_monitor",
  },
  {
    id: "pulse_oximeter",
    name: "Pulse Oximeter",
    brand: "Masimo",
    kind: "pulse_oximeter",
    metrics: ["SpO₂", "Pulse"],
    imageKey: "pulse_oximeter",
  },
  {
    id: "smart_scale",
    name: "Body Composition Scale",
    brand: "Withings",
    kind: "smart_scale",
    metrics: ["Weight", "Body fat %"],
    imageKey: "smart_scale",
  },
  {
    id: "cpap",
    name: "CPAP Therapy",
    brand: "ResMed",
    kind: "cpap",
    metrics: ["AHI", "Usage hours"],
    imageKey: "cpap",
  },
  {
    id: "sleep_tracker",
    name: "Sleep Interface",
    brand: "Philips",
    kind: "sleep_tracker",
    metrics: ["Sleep score", "Hours asleep"],
    imageKey: "sleep_tracker",
  },
];

export function defaultWearableDevices(): WearableDevice[] {
  return WEARABLE_CATALOG.map((d) => ({
    ...d,
    syncMode: "manual" as WearableSyncMode,
    status: "disconnected",
    lastSyncedAt: null,
    enabled: true,
  }));
}

export function metricDefaults(kind: WearableKind): { metric: string; unit: string; secondaryMetric?: string; secondaryUnit?: string } {
  switch (kind) {
    case "bp_monitor":
      return { metric: "Blood pressure", unit: "mmHg", secondaryMetric: "Pulse", secondaryUnit: "bpm" };
    case "pulse_oximeter":
      return { metric: "SpO₂", unit: "%", secondaryMetric: "Pulse", secondaryUnit: "bpm" };
    case "smart_scale":
      return { metric: "Weight", unit: "lb", secondaryMetric: "Body fat", secondaryUnit: "%" };
    case "cpap":
      return { metric: "AHI", unit: "events/hr", secondaryMetric: "Usage", secondaryUnit: "hr" };
    case "sleep_tracker":
      return { metric: "Sleep score", unit: "/100", secondaryMetric: "Hours asleep", secondaryUnit: "hr" };
    default:
      return { metric: "Reading", unit: "" };
  }
}

import type { WearableDevice, WearableKind, WearableSyncMode } from "@/types/dashboard";
import imgBpMonitor from "@/assets/products/p8_bp_monitor.webp";
import imgPulseOx from "@/assets/products/p9_pulse_oximeter.webp";
import imgSmartScale from "@/assets/products/p10_smart_scale.webp";
import imgCpap from "@/assets/products/p5_nasal_pillow.webp";
import imgSleepMask from "@/assets/products/p6_full_face_mask.webp";
import imgHero from "@/assets/products/marketplace-hero.webp";

export const WEARABLE_IMAGES: Record<string, string> = {
  bp_monitor: imgBpMonitor,
  pulse_oximeter: imgPulseOx,
  smart_scale: imgSmartScale,
  cpap: imgCpap,
  sleep_tracker: imgSleepMask,
  oura_ring: imgHero,
  whoop_band: imgHero,
  apple_watch: imgHero,
  garmin_watch: imgHero,
  cgm: imgPulseOx,
};

/** Marketplace SKU → wearable kind unlock map */
export const MARKETPLACE_DEVICE_MAP: Record<string, WearableKind> = {
  p8: "bp_monitor",
  p9: "pulse_oximeter",
  p10: "smart_scale",
  p13: "oura_ring",
  p14: "whoop_band",
  p15: "apple_watch",
  p16: "garmin_watch",
  p17: "cgm",
};

/** Continuous stream tick intervals (ms) by device */
export const CONTINUOUS_TICK_MS: Record<WearableKind, number> = {
  bp_monitor: 12000,
  pulse_oximeter: 4000,
  smart_scale: 20000,
  cpap: 15000,
  sleep_tracker: 18000,
  oura_ring: 5000,
  whoop_band: 4500,
  apple_watch: 3500,
  garmin_watch: 4000,
  cgm: 3000,
};

type CatalogEntry = Omit<WearableDevice, "syncMode" | "status" | "lastSyncedAt" | "enabled">;

export const WEARABLE_CATALOG: CatalogEntry[] = [
  {
    id: "bp_monitor",
    name: "Smart BP Monitor",
    brand: "Omron",
    kind: "bp_monitor",
    metrics: ["Systolic", "Diastolic", "Pulse"],
    imageKey: "bp_monitor",
    owned: true,
    marketplaceProductId: "p8",
    priceUsd: 89,
    tier: "clinical",
  },
  {
    id: "pulse_oximeter",
    name: "Pulse Oximeter",
    brand: "Masimo",
    kind: "pulse_oximeter",
    metrics: ["SpO₂", "Pulse"],
    imageKey: "pulse_oximeter",
    owned: true,
    marketplaceProductId: "p9",
    priceUsd: 42,
    tier: "clinical",
  },
  {
    id: "smart_scale",
    name: "Body Composition Scale",
    brand: "Withings",
    kind: "smart_scale",
    metrics: ["Weight", "Body fat %"],
    imageKey: "smart_scale",
    owned: true,
    marketplaceProductId: "p10",
    priceUsd: 99,
    tier: "clinical",
  },
  {
    id: "cpap",
    name: "CPAP Therapy",
    brand: "ResMed",
    kind: "cpap",
    metrics: ["AHI", "Usage hours"],
    imageKey: "cpap",
    owned: true,
    priceUsd: 119,
    tier: "sleep",
  },
  {
    id: "sleep_tracker",
    name: "Sleep Interface",
    brand: "Philips",
    kind: "sleep_tracker",
    metrics: ["Sleep score", "Hours asleep"],
    imageKey: "sleep_tracker",
    owned: true,
    priceUsd: 149,
    tier: "sleep",
  },
  {
    id: "oura_ring",
    name: "Ring 4",
    brand: "Oura",
    kind: "oura_ring",
    metrics: ["HR", "HRV", "Sleep score", "Temp Δ"],
    imageKey: "oura_ring",
    owned: false,
    marketplaceProductId: "p13",
    priceUsd: 349,
    tier: "recovery",
  },
  {
    id: "whoop_band",
    name: "Whoop 5.0",
    brand: "Whoop",
    kind: "whoop_band",
    metrics: ["Strain", "Recovery", "HRV", "Sleep"],
    imageKey: "whoop_band",
    owned: false,
    marketplaceProductId: "p14",
    priceUsd: 239,
    tier: "recovery",
  },
  {
    id: "apple_watch",
    name: "Watch Series",
    brand: "Apple",
    kind: "apple_watch",
    metrics: ["HR", "HRV", "SpO₂", "Steps"],
    imageKey: "apple_watch",
    owned: false,
    marketplaceProductId: "p15",
    priceUsd: 429,
    tier: "recovery",
  },
  {
    id: "garmin_watch",
    name: "Venu 3",
    brand: "Garmin",
    kind: "garmin_watch",
    metrics: ["HR", "HRV", "SpO₂", "Training load"],
    imageKey: "garmin_watch",
    owned: false,
    marketplaceProductId: "p16",
    priceUsd: 449,
    tier: "recovery",
  },
  {
    id: "cgm",
    name: "G7 CGM Kit",
    brand: "Dexcom",
    kind: "cgm",
    metrics: ["Glucose"],
    imageKey: "cgm",
    owned: false,
    marketplaceProductId: "p17",
    priceUsd: 199,
    tier: "metabolic",
  },
];

export function defaultWearableDevices(): WearableDevice[] {
  return WEARABLE_CATALOG.map((d) => ({
    ...d,
    syncMode: "manual" as WearableSyncMode,
    status: d.owned ? ("disconnected" as const) : ("disconnected" as const),
    lastSyncedAt: null,
    enabled: d.owned,
  }));
}

/** Merge catalog defaults into persisted devices (adds new SKUs, preserves state). */
export function mergeWearableCatalog(existing: WearableDevice[] | undefined): WearableDevice[] {
  const prev = existing || [];
  const byId = new Map(prev.map((d) => [d.id, d]));
  return WEARABLE_CATALOG.map((catalog) => {
    const saved = byId.get(catalog.id);
    if (!saved) {
      return {
        ...catalog,
        syncMode: "manual" as WearableSyncMode,
        status: "disconnected" as const,
        lastSyncedAt: null,
        enabled: catalog.owned,
      };
    }
    return {
      ...catalog,
      ...saved,
      name: catalog.name,
      brand: catalog.brand,
      metrics: catalog.metrics,
      imageKey: catalog.imageKey,
      marketplaceProductId: catalog.marketplaceProductId,
      priceUsd: catalog.priceUsd,
      tier: catalog.tier,
      owned: saved.owned ?? catalog.owned,
    };
  });
}

export function metricDefaults(kind: WearableKind): {
  metric: string;
  unit: string;
  secondaryMetric?: string;
  secondaryUnit?: string;
} {
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
    case "oura_ring":
      return { metric: "HRV", unit: "ms", secondaryMetric: "Sleep score", secondaryUnit: "/100" };
    case "whoop_band":
      return { metric: "Recovery", unit: "%", secondaryMetric: "Strain", secondaryUnit: "" };
    case "apple_watch":
      return { metric: "Heart rate", unit: "bpm", secondaryMetric: "SpO₂", secondaryUnit: "%" };
    case "garmin_watch":
      return { metric: "Heart rate", unit: "bpm", secondaryMetric: "HRV", secondaryUnit: "ms" };
    case "cgm":
      return { metric: "Glucose", unit: "mg/dL" };
    default:
      return { metric: "Reading", unit: "" };
  }
}

export function computeBmi(heightCm: number | null | undefined, weightLb: number | null | undefined): number | null {
  if (!heightCm || !weightLb || heightCm <= 0 || weightLb <= 0) return null;
  const heightM = heightCm / 100;
  const weightKg = weightLb * 0.45359237;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function heightCmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalIn = cm / 2.54;
  const feet = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn - feet * 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

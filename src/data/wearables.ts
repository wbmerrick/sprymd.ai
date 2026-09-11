import type { WearableConnector, WearableDevice, WearableKind, WearableSyncMode } from "@/types/dashboard";
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
  fitness: imgHero,
  ring: imgHero,
  band: imgHero,
  custom: imgHero,
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

type CatalogEntry = Omit<WearableDevice, "syncMode" | "status" | "lastSyncedAt" | "enabled">;

function entry(
  partial: CatalogEntry & { continuousMs?: number },
): CatalogEntry {
  const { continuousMs: _c, ...rest } = partial as CatalogEntry & { continuousMs?: number };
  return rest;
}

/**
 * Stock catalog — major clinical + consumer wearables.
 * Unknown brands still connect via `registerCustomWearable` (any device).
 */
export const WEARABLE_CATALOG: CatalogEntry[] = [
  // ── Clinical home (owned by default) ───────────────────────────────────────
  entry({
    id: "bp_monitor",
    name: "Smart BP Monitor",
    brand: "Omron",
    kind: "bp_monitor",
    metrics: ["Systolic", "Diastolic", "Pulse"],
    metricKeys: ["bp_sys", "bp_dia", "pulse"],
    imageKey: "bp_monitor",
    owned: true,
    marketplaceProductId: "p8",
    priceUsd: 89,
    tier: "clinical",
    connector: "native_sim",
  }),
  entry({
    id: "pulse_oximeter",
    name: "Pulse Oximeter",
    brand: "Masimo",
    kind: "pulse_oximeter",
    metrics: ["SpO₂", "Pulse"],
    metricKeys: ["spo2", "hr"],
    imageKey: "pulse_oximeter",
    owned: true,
    marketplaceProductId: "p9",
    priceUsd: 42,
    tier: "clinical",
    connector: "native_sim",
  }),
  entry({
    id: "smart_scale",
    name: "Body Composition Scale",
    brand: "Withings",
    kind: "smart_scale",
    metrics: ["Weight", "Body fat %"],
    metricKeys: ["weight", "body_fat", "bmi"],
    imageKey: "smart_scale",
    owned: true,
    marketplaceProductId: "p10",
    priceUsd: 99,
    tier: "clinical",
    connector: "withings",
  }),
  entry({
    id: "cpap",
    name: "CPAP Therapy",
    brand: "ResMed",
    kind: "cpap",
    metrics: ["AHI", "Usage hours"],
    metricKeys: ["ahi", "cpap_usage_hr"],
    imageKey: "cpap",
    owned: true,
    priceUsd: 119,
    tier: "sleep",
    connector: "resmed_myair",
  }),
  entry({
    id: "sleep_tracker",
    name: "Sleep Interface",
    brand: "Philips",
    kind: "sleep_tracker",
    metrics: ["Sleep score", "Hours asleep"],
    metricKeys: ["sleep_score", "sleep_hours"],
    imageKey: "sleep_tracker",
    owned: true,
    priceUsd: 149,
    tier: "sleep",
    connector: "philips_healthsuite",
  }),

  // ── Recovery / rings & bands ───────────────────────────────────────────────
  entry({
    id: "oura_ring",
    name: "Ring 4",
    brand: "Oura",
    kind: "oura_ring",
    metrics: ["HR", "HRV", "Sleep score", "Temp Δ"],
    metricKeys: ["hr", "hrv", "sleep_score", "skin_temp_delta"],
    imageKey: "oura_ring",
    owned: false,
    marketplaceProductId: "p13",
    priceUsd: 349,
    tier: "recovery",
    connector: "oura_cloud",
  }),
  entry({
    id: "whoop_band",
    name: "Whoop 5.0",
    brand: "Whoop",
    kind: "whoop_band",
    metrics: ["Strain", "Recovery", "HRV", "Sleep"],
    metricKeys: ["strain", "recovery", "hrv", "sleep_score"],
    imageKey: "whoop_band",
    owned: false,
    marketplaceProductId: "p14",
    priceUsd: 239,
    tier: "recovery",
    connector: "whoop_cloud",
  }),
  entry({
    id: "ultrahuman_ring",
    name: "Ring Air",
    brand: "Ultrahuman",
    kind: "ultrahuman_ring",
    metrics: ["HR", "HRV", "Sleep", "Temp"],
    metricKeys: ["hr", "hrv", "sleep_score", "skin_temp_delta"],
    imageKey: "ring",
    owned: false,
    priceUsd: 349,
    tier: "recovery",
    connector: "ultrahuman_cloud",
  }),
  entry({
    id: "circular_ring",
    name: "Slim Ring",
    brand: "Circular",
    kind: "circular_ring",
    metrics: ["HR", "HRV", "SpO₂", "Sleep"],
    metricKeys: ["hr", "hrv", "spo2", "sleep_score"],
    imageKey: "ring",
    owned: false,
    priceUsd: 299,
    tier: "recovery",
    connector: "circular_cloud",
  }),

  // ── Watches ────────────────────────────────────────────────────────────────
  entry({
    id: "apple_watch",
    name: "Watch Series",
    brand: "Apple",
    kind: "apple_watch",
    metrics: ["HR", "HRV", "SpO₂", "Steps"],
    metricKeys: ["hr", "hrv", "spo2", "steps"],
    imageKey: "apple_watch",
    owned: false,
    marketplaceProductId: "p15",
    priceUsd: 429,
    tier: "recovery",
    connector: "healthkit",
  }),
  entry({
    id: "apple_watch_ultra",
    name: "Watch Ultra 2",
    brand: "Apple",
    kind: "apple_watch_ultra",
    metrics: ["HR", "HRV", "SpO₂", "Workouts"],
    metricKeys: ["hr", "hrv", "spo2", "active_kcal"],
    imageKey: "apple_watch",
    owned: false,
    priceUsd: 799,
    tier: "fitness",
    connector: "healthkit",
  }),
  entry({
    id: "garmin_watch",
    name: "Venu 3",
    brand: "Garmin",
    kind: "garmin_watch",
    metrics: ["HR", "HRV", "SpO₂", "Training load"],
    metricKeys: ["hr", "hrv", "spo2", "strain"],
    imageKey: "garmin_watch",
    owned: false,
    marketplaceProductId: "p16",
    priceUsd: 449,
    tier: "recovery",
    connector: "garmin_connect",
  }),
  entry({
    id: "garmin_forerunner",
    name: "Forerunner 965",
    brand: "Garmin",
    kind: "garmin_forerunner",
    metrics: ["HR", "Training load", "VO₂", "Sleep"],
    metricKeys: ["hr", "strain", "sleep_score", "steps"],
    imageKey: "garmin_watch",
    owned: false,
    priceUsd: 599,
    tier: "fitness",
    connector: "garmin_connect",
  }),
  entry({
    id: "garmin_index_scale",
    name: "Index S2 Scale",
    brand: "Garmin",
    kind: "garmin_index_scale",
    metrics: ["Weight", "Body fat %", "BMI"],
    metricKeys: ["weight", "body_fat", "bmi"],
    imageKey: "smart_scale",
    owned: false,
    priceUsd: 179,
    tier: "clinical",
    connector: "garmin_connect",
  }),
  entry({
    id: "samsung_watch",
    name: "Galaxy Watch 7",
    brand: "Samsung",
    kind: "samsung_watch",
    metrics: ["HR", "SpO₂", "Sleep", "Steps"],
    metricKeys: ["hr", "spo2", "sleep_score", "steps"],
    imageKey: "fitness",
    owned: false,
    priceUsd: 299,
    tier: "fitness",
    connector: "samsung_health",
  }),
  entry({
    id: "fitbit_charge",
    name: "Charge 6",
    brand: "Fitbit",
    kind: "fitbit_charge",
    metrics: ["HR", "Sleep", "Steps", "SpO₂"],
    metricKeys: ["hr", "sleep_score", "steps", "spo2"],
    imageKey: "band",
    owned: false,
    priceUsd: 159,
    tier: "fitness",
    connector: "fitbit",
  }),
  entry({
    id: "fitbit_sense",
    name: "Sense 2",
    brand: "Fitbit",
    kind: "fitbit_sense",
    metrics: ["HR", "EDA", "Sleep", "SpO₂"],
    metricKeys: ["hr", "sleep_score", "spo2", "stress"],
    imageKey: "fitness",
    owned: false,
    priceUsd: 249,
    tier: "fitness",
    connector: "fitbit",
  }),
  entry({
    id: "google_pixel_watch",
    name: "Pixel Watch 3",
    brand: "Google",
    kind: "google_pixel_watch",
    metrics: ["HR", "SpO₂", "Sleep", "Steps"],
    metricKeys: ["hr", "spo2", "sleep_score", "steps"],
    imageKey: "fitness",
    owned: false,
    priceUsd: 349,
    tier: "fitness",
    connector: "google_fit",
  }),
  entry({
    id: "polar_watch",
    name: "Vantage V3",
    brand: "Polar",
    kind: "polar_watch",
    metrics: ["HR", "HRV", "Training load", "Sleep"],
    metricKeys: ["hr", "hrv", "strain", "sleep_score"],
    imageKey: "fitness",
    owned: false,
    priceUsd: 599,
    tier: "fitness",
    connector: "polar_accesslink",
  }),
  entry({
    id: "coros_watch",
    name: "Pace 3",
    brand: "COROS",
    kind: "coros_watch",
    metrics: ["HR", "Training load", "Sleep", "Steps"],
    metricKeys: ["hr", "strain", "sleep_score", "steps"],
    imageKey: "fitness",
    owned: false,
    priceUsd: 229,
    tier: "fitness",
    connector: "coros_cloud",
  }),
  entry({
    id: "amazfit_band",
    name: "Band 7",
    brand: "Amazfit",
    kind: "amazfit_band",
    metrics: ["HR", "SpO₂", "Sleep", "Steps"],
    metricKeys: ["hr", "spo2", "sleep_score", "steps"],
    imageKey: "band",
    owned: false,
    priceUsd: 49,
    tier: "fitness",
    connector: "zepp_cloud",
  }),
  entry({
    id: "xiaomi_band",
    name: "Smart Band 8",
    brand: "Xiaomi",
    kind: "xiaomi_band",
    metrics: ["HR", "SpO₂", "Sleep", "Steps"],
    metricKeys: ["hr", "spo2", "sleep_score", "steps"],
    imageKey: "band",
    owned: false,
    priceUsd: 39,
    tier: "fitness",
    connector: "zepp_cloud",
  }),

  // ── Metabolic / CGM ────────────────────────────────────────────────────────
  entry({
    id: "cgm",
    name: "G7 CGM Kit",
    brand: "Dexcom",
    kind: "cgm",
    metrics: ["Glucose"],
    metricKeys: ["glucose"],
    imageKey: "cgm",
    owned: false,
    marketplaceProductId: "p17",
    priceUsd: 199,
    tier: "metabolic",
    connector: "dexcom",
  }),
  entry({
    id: "libre_cgm",
    name: "FreeStyle Libre 3",
    brand: "Abbott",
    kind: "libre_cgm",
    metrics: ["Glucose"],
    metricKeys: ["glucose"],
    imageKey: "cgm",
    owned: false,
    priceUsd: 189,
    tier: "metabolic",
    connector: "libre_view",
  }),
  entry({
    id: "levels_cgm",
    name: "Levels CGM Program",
    brand: "Levels",
    kind: "levels_cgm",
    metrics: ["Glucose", "Metabolic score"],
    metricKeys: ["glucose"],
    imageKey: "cgm",
    owned: false,
    priceUsd: 199,
    tier: "metabolic",
    connector: "levels_api",
  }),

  // ── Clinical BP / cardio alternatives ──────────────────────────────────────
  entry({
    id: "withings_bpm",
    name: "BPM Connect",
    brand: "Withings",
    kind: "withings_bpm",
    metrics: ["Systolic", "Diastolic", "Pulse"],
    metricKeys: ["bp_sys", "bp_dia", "pulse"],
    imageKey: "bp_monitor",
    owned: false,
    priceUsd: 129,
    tier: "clinical",
    connector: "withings",
  }),
  entry({
    id: "omron_complete",
    name: "Complete BP + EKG",
    brand: "Omron",
    kind: "omron_complete",
    metrics: ["Systolic", "Diastolic", "EKG"],
    metricKeys: ["bp_sys", "bp_dia", "hr"],
    imageKey: "bp_monitor",
    owned: false,
    priceUsd: 189,
    tier: "clinical",
    connector: "omron_connect",
  }),
  entry({
    id: "withings_bodyscan",
    name: "Body Scan Scale",
    brand: "Withings",
    kind: "withings_bodyscan",
    metrics: ["Weight", "Body fat %", "Vascular age"],
    metricKeys: ["weight", "body_fat", "bmi"],
    imageKey: "smart_scale",
    owned: false,
    priceUsd: 399,
    tier: "clinical",
    connector: "withings",
  }),

  // ── Sleep environment ──────────────────────────────────────────────────────
  entry({
    id: "eight_sleep",
    name: "Pod 4 Cover",
    brand: "Eight Sleep",
    kind: "eight_sleep",
    metrics: ["Sleep score", "HR", "HRV", "Bed temp"],
    metricKeys: ["sleep_score", "hr", "hrv", "temp"],
    imageKey: "sleep_tracker",
    owned: false,
    priceUsd: 2299,
    tier: "sleep",
    connector: "eight_sleep",
  }),
  entry({
    id: "sleep_number",
    name: "Climate360 Smart Bed",
    brand: "Sleep Number",
    kind: "sleep_number",
    metrics: ["Sleep score", "HR", "Breathing"],
    metricKeys: ["sleep_score", "hr"],
    imageKey: "sleep_tracker",
    owned: false,
    priceUsd: 3999,
    tier: "sleep",
    connector: "sleep_number",
  }),
  entry({
    id: "withings_sleep",
    name: "Sleep Analyzer",
    brand: "Withings",
    kind: "withings_sleep",
    metrics: ["Sleep score", "HR", "Breathing disturbances"],
    metricKeys: ["sleep_score", "hr", "ahi"],
    imageKey: "sleep_tracker",
    owned: false,
    priceUsd: 129,
    tier: "sleep",
    connector: "withings",
  }),
];

/** Default continuous tick interval (ms). Unknown devices use 8s. */
export const CONTINUOUS_TICK_MS: Record<string, number> = {
  bp_monitor: 12000,
  pulse_oximeter: 4000,
  smart_scale: 20000,
  cpap: 15000,
  sleep_tracker: 18000,
  oura_ring: 5000,
  whoop_band: 4500,
  apple_watch: 3500,
  apple_watch_ultra: 3500,
  garmin_watch: 4000,
  garmin_forerunner: 4000,
  cgm: 3000,
  libre_cgm: 3000,
  levels_cgm: 5000,
  fitbit_charge: 5000,
  samsung_watch: 4000,
  eight_sleep: 20000,
};

export function continuousTickMs(kind: WearableKind): number {
  return CONTINUOUS_TICK_MS[kind] ?? 8000;
}

export function defaultWearableDevices(): WearableDevice[] {
  return WEARABLE_CATALOG.map((d) => ({
    ...d,
    syncMode: "manual" as WearableSyncMode,
    status: "disconnected" as const,
    lastSyncedAt: null,
    enabled: d.owned,
  }));
}

/** Merge catalog defaults into persisted devices; keep user-added custom devices. */
export function mergeWearableCatalog(existing: WearableDevice[] | undefined): WearableDevice[] {
  const prev = existing || [];
  const byId = new Map(prev.map((d) => [d.id, d]));
  const merged = WEARABLE_CATALOG.map((catalog) => {
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
      metricKeys: catalog.metricKeys,
      imageKey: catalog.imageKey,
      marketplaceProductId: catalog.marketplaceProductId,
      priceUsd: catalog.priceUsd,
      tier: catalog.tier,
      connector: catalog.connector,
      owned: saved.owned ?? catalog.owned,
      isCustom: false,
    };
  });

  const catalogIds = new Set(WEARABLE_CATALOG.map((d) => d.id));
  const customs = prev.filter((d) => d.isCustom || !catalogIds.has(d.id));
  return [...merged, ...customs];
}

export function metricDefaults(kind: WearableKind): {
  metric: string;
  unit: string;
  secondaryMetric?: string;
  secondaryUnit?: string;
} {
  switch (kind) {
    case "bp_monitor":
    case "withings_bpm":
    case "omron_complete":
      return { metric: "Blood pressure", unit: "mmHg", secondaryMetric: "Pulse", secondaryUnit: "bpm" };
    case "pulse_oximeter":
      return { metric: "SpO₂", unit: "%", secondaryMetric: "Pulse", secondaryUnit: "bpm" };
    case "smart_scale":
    case "garmin_index_scale":
    case "withings_bodyscan":
      return { metric: "Weight", unit: "lb", secondaryMetric: "Body fat", secondaryUnit: "%" };
    case "cpap":
      return { metric: "AHI", unit: "events/hr", secondaryMetric: "Usage", secondaryUnit: "hr" };
    case "sleep_tracker":
    case "eight_sleep":
    case "sleep_number":
    case "withings_sleep":
      return { metric: "Sleep score", unit: "/100", secondaryMetric: "Hours asleep", secondaryUnit: "hr" };
    case "oura_ring":
    case "ultrahuman_ring":
    case "circular_ring":
      return { metric: "HRV", unit: "ms", secondaryMetric: "Sleep score", secondaryUnit: "/100" };
    case "whoop_band":
      return { metric: "Recovery", unit: "%", secondaryMetric: "Strain", secondaryUnit: "" };
    case "apple_watch":
    case "apple_watch_ultra":
    case "samsung_watch":
    case "google_pixel_watch":
      return { metric: "Heart rate", unit: "bpm", secondaryMetric: "SpO₂", secondaryUnit: "%" };
    case "garmin_watch":
    case "garmin_forerunner":
    case "polar_watch":
    case "coros_watch":
      return { metric: "Heart rate", unit: "bpm", secondaryMetric: "HRV", secondaryUnit: "ms" };
    case "fitbit_charge":
    case "fitbit_sense":
    case "amazfit_band":
    case "xiaomi_band":
      return { metric: "Heart rate", unit: "bpm", secondaryMetric: "Steps", secondaryUnit: "steps" };
    case "cgm":
    case "libre_cgm":
    case "levels_cgm":
      return { metric: "Glucose", unit: "mg/dL" };
    default:
      return { metric: "Reading", unit: "" };
  }
}

export function slugifyDeviceId(brand: string, name: string): string {
  const base = `${brand}_${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
  return `custom_${base || "device"}_${Math.random().toString(36).slice(2, 6)}`;
}

export function buildCustomWearable(input: {
  brand: string;
  name: string;
  metrics?: string[];
  connector?: WearableConnector;
}): WearableDevice {
  const brand = input.brand.trim() || "Generic";
  const name = input.name.trim() || "Wearable";
  const id = slugifyDeviceId(brand, name);
  return {
    id,
    name,
    brand,
    kind: id,
    metrics: input.metrics?.length ? input.metrics : ["Heart rate", "Steps", "Sleep score"],
    metricKeys: ["hr", "steps", "sleep_score"],
    imageKey: "custom",
    syncMode: "manual",
    status: "paired",
    lastSyncedAt: null,
    enabled: true,
    owned: true,
    tier: "custom",
    connector: input.connector || "file_import",
    isCustom: true,
  };
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

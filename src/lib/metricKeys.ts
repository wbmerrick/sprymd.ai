/** Canonical metric keys for cross-vendor wearable normalization. */

export type MetricKey =
  | "hr"
  | "hrv"
  | "spo2"
  | "bp_sys"
  | "bp_dia"
  | "pulse"
  | "weight"
  | "body_fat"
  | "bmi"
  | "sleep_score"
  | "sleep_hours"
  | "skin_temp_delta"
  | "glucose"
  | "strain"
  | "recovery"
  | "steps"
  | "active_kcal"
  | "ahi"
  | "cpap_usage_hr"
  | "temp"
  | "custom";

export const METRIC_META: Record<
  MetricKey,
  { label: string; unit: string; aliases: string[] }
> = {
  hr: { label: "Heart rate", unit: "bpm", aliases: ["hr", "heart rate", "pulse", "bpm", "resting hr", "rhr"] },
  hrv: { label: "HRV", unit: "ms", aliases: ["hrv", "heart rate variability", "rmssd", "sdnn"] },
  spo2: { label: "Oxygen", unit: "%", aliases: ["spo2", "spo₂", "oxygen", "o2 sat", "oxygen saturation"] },
  bp_sys: { label: "Systolic BP", unit: "mmHg", aliases: ["systolic", "bp sys", "bp_sys", "sys", "blood pressure"] },
  bp_dia: { label: "Diastolic BP", unit: "mmHg", aliases: ["diastolic", "bp dia", "bp_dia", "dia"] },
  pulse: { label: "Pulse", unit: "bpm", aliases: ["pulse rate"] },
  weight: { label: "Weight", unit: "lb", aliases: ["weight", "wt", "body weight", "mass"] },
  body_fat: { label: "Body fat", unit: "%", aliases: ["body fat", "bodyfat", "fat %", "bf%"] },
  bmi: { label: "BMI", unit: "", aliases: ["bmi", "body mass index"] },
  sleep_score: { label: "Sleep score", unit: "/100", aliases: ["sleep score", "sleep", "sleep quality"] },
  sleep_hours: { label: "Sleep hours", unit: "hr", aliases: ["hours asleep", "sleep hours", "time asleep", "tst"] },
  skin_temp_delta: { label: "Temp change", unit: "°", aliases: ["temp delta", "skin temp", "temperature deviation", "temp Δ"] },
  glucose: { label: "Blood sugar", unit: "mg/dL", aliases: ["glucose", "bg", "blood glucose", "cgm", "sugar"] },
  strain: { label: "Strain", unit: "", aliases: ["strain", "training load", "load"] },
  recovery: { label: "Recovery", unit: "%", aliases: ["recovery", "readiness", "recovery score"] },
  steps: { label: "Steps", unit: "steps", aliases: ["steps", "step count", "daily steps"] },
  active_kcal: { label: "Active calories", unit: "kcal", aliases: ["calories", "active kcal", "kcal", "energy"] },
  ahi: { label: "AHI", unit: "events/hr", aliases: ["ahi", "apnea", "apnea-hypopnea"] },
  cpap_usage_hr: { label: "CPAP usage", unit: "hr", aliases: ["usage", "usage hours", "cpap hours", "mask on"] },
  temp: { label: "Temperature", unit: "°F", aliases: ["temperature", "temp", "body temp"] },
  custom: { label: "Custom", unit: "", aliases: [] },
};

/** Map free-text metric labels from any vendor export into a MetricKey. */
export function normalizeMetricKey(raw: string | null | undefined): MetricKey {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  if (!s) return "custom";
  for (const [key, meta] of Object.entries(METRIC_META) as [MetricKey, (typeof METRIC_META)[MetricKey]][]) {
    if (key === "custom") continue;
    if (meta.aliases.some((a) => s === a || s.includes(a))) return key;
  }
  return "custom";
}

export function metricLabel(key: MetricKey): string {
  return METRIC_META[key]?.label || "Reading";
}

export function metricUnit(key: MetricKey): string {
  return METRIC_META[key]?.unit || "";
}

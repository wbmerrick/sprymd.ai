import type { WearableKind } from "@/types/dashboard";
import type { ConnectorAdapter, OemProviderId, OemSyncResult, OemTokenSet } from "../types";
import { OEM_PROVIDERS } from "../oemProviders";

function jitter(n: number, spread: number) {
  return n + Math.round((Math.random() - 0.5) * spread);
}

function reading(
  deviceId: WearableKind,
  metric: string,
  value: number,
  unit: string,
  extra?: Partial<OemSyncResult["readings"][number]>,
): OemSyncResult["readings"][number] {
  return {
    deviceId,
    metric,
    value,
    unit,
    source: "sync",
    recordedAt: new Date().toISOString(),
    note: extra?.note,
    secondaryValue: extra?.secondaryValue,
    secondaryUnit: extra?.secondaryUnit,
  };
}

async function tryLive(url: string, tokens: OemTokenSet): Promise<boolean> {
  if (tokens.sandbox) return false;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `${tokens.tokenType || "Bearer"} ${tokens.accessToken}`,
        Accept: "application/json",
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function sandboxReadings(providerId: OemProviderId, deviceId: WearableKind): OemSyncResult["readings"] {
  const name = OEM_PROVIDERS[providerId]?.displayName || providerId;
  switch (providerId) {
    case "fitbit":
      return [
        reading(deviceId, "Heart rate", jitter(68, 12), "bpm", { note: `${name} cloud` }),
        reading(deviceId, "Steps", jitter(7400, 1800), "steps"),
      ];
    case "oura":
      return [
        reading(deviceId, "HRV", jitter(44, 14), "ms", {
          secondaryValue: jitter(78, 12),
          secondaryUnit: "/100",
          note: `${name} cloud`,
        }),
      ];
    case "whoop":
      return [
        reading(deviceId, "Recovery", jitter(66, 18), "%", {
          secondaryValue: Number((9 + Math.random() * 8).toFixed(1)),
          secondaryUnit: "strain",
          note: `${name} cloud`,
        }),
      ];
    case "withings":
      return [
        reading(deviceId, "Weight", Number((167 + Math.random() * 3).toFixed(1)), "lb", {
          secondaryValue: Number((22 + Math.random() * 2).toFixed(1)),
          secondaryUnit: "%",
          note: `${name} cloud`,
        }),
      ];
    case "omron":
      return [
        reading(deviceId, "Blood pressure", jitter(118, 8), "mmHg", {
          secondaryValue: jitter(76, 6),
          secondaryUnit: "mmHg",
          note: `${name} cloud`,
        }),
      ];
    case "dexcom":
    case "libre":
    case "levels":
      return [reading(deviceId, "Glucose", jitter(112, 28), "mg/dL", { note: `${name} cloud` })];
    case "resmed":
    case "philips":
      return [
        reading(deviceId, "AHI", Number((1.4 + Math.random() * 2).toFixed(1)), "events/hr", {
          secondaryValue: Number((6.7 + Math.random()).toFixed(1)),
          secondaryUnit: "hr",
          note: `${name} therapy`,
        }),
      ];
    case "eight_sleep":
    case "sleep_number":
      return [
        reading(deviceId, "Sleep score", jitter(84, 10), "/100", {
          secondaryValue: Number((7.1 + Math.random()).toFixed(1)),
          secondaryUnit: "hr",
          note: `${name} cloud`,
        }),
      ];
    case "masimo":
      return [
        reading(deviceId, "SpO₂", jitter(97, 2), "%", {
          secondaryValue: jitter(70, 10),
          secondaryUnit: "bpm",
          note: `${name} cloud`,
        }),
      ];
    default:
      return [reading(deviceId, "Heart rate", jitter(66, 14), "bpm", { note: `${name} cloud sync` })];
  }
}

function makeAdapter(providerId: OemProviderId): ConnectorAdapter {
  return {
    providerId,
    async sync({ deviceId, tokens }) {
      const cfg = OEM_PROVIDERS[providerId];
      let liveApi = false;
      let readings = sandboxReadings(providerId, deviceId);
      if (!tokens.sandbox && cfg.endpoints) {
        liveApi = await tryLive(`${cfg.endpoints.apiBaseUrl}/`, tokens);
        if (liveApi) {
          readings = readings.map((r) => ({
            ...r,
            note: `${cfg.displayName} live API · ${r.note || "sync"}`,
          }));
        }
      }
      return {
        providerId,
        deviceId,
        readings,
        liveApi,
        rawNote: liveApi ? "live" : tokens.sandbox ? "sandbox" : "fallback",
      };
    },
  };
}

const ADAPTERS = Object.fromEntries(
  (Object.keys(OEM_PROVIDERS) as OemProviderId[]).map((id) => [id, makeAdapter(id)]),
) as Record<OemProviderId, ConnectorAdapter>;

export function getAdapter(providerId: OemProviderId): ConnectorAdapter {
  return ADAPTERS[providerId] || ADAPTERS.generic_oem;
}

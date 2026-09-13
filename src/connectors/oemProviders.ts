import type { WearableConnector } from "@/types/dashboard";
import type { OemProviderConfig, OemProviderId } from "./types";

export const OEM_PROVIDERS: Record<OemProviderId, OemProviderConfig> = {
  fitbit: {
    id: "fitbit",
    displayName: "Fitbit",
    connector: "fitbit",
    authMode: "oauth2_pkce",
    envPrefix: "FITBIT",
    docsUrl: "https://dev.fitbit.com/",
    endpoints: {
      authorizeUrl: "https://www.fitbit.com/oauth2/authorize",
      tokenUrl: "https://api.fitbit.com/oauth2/token",
      revokeUrl: "https://api.fitbit.com/oauth2/revoke",
      apiBaseUrl: "https://api.fitbit.com/1",
      scopes: ["activity", "heartrate", "sleep", "weight", "oxygen_saturation", "profile"],
    },
  },
  oura: {
    id: "oura",
    displayName: "Oura",
    connector: "oura_cloud",
    authMode: "oauth2_pkce",
    envPrefix: "OURA",
    docsUrl: "https://cloud.ouraring.com/docs/",
    endpoints: {
      authorizeUrl: "https://cloud.ouraring.com/oauth/authorize",
      tokenUrl: "https://api.ouraring.com/oauth/token",
      apiBaseUrl: "https://api.ouraring.com/v2",
      scopes: ["email", "personal", "daily", "heartrate", "workout", "session", "spo2"],
    },
  },
  whoop: {
    id: "whoop",
    displayName: "WHOOP",
    connector: "whoop_cloud",
    authMode: "oauth2_pkce",
    envPrefix: "WHOOP",
    docsUrl: "https://developer.whoop.com/",
    endpoints: {
      authorizeUrl: "https://api.prod.whoop.com/oauth/oauth2/auth",
      tokenUrl: "https://api.prod.whoop.com/oauth/oauth2/token",
      apiBaseUrl: "https://api.prod.whoop.com/developer",
      scopes: ["read:recovery", "read:cycles", "read:sleep", "read:workout", "read:profile", "read:body_measurement"],
    },
  },
  withings: {
    id: "withings",
    displayName: "Withings",
    connector: "withings",
    authMode: "oauth2",
    envPrefix: "WITHINGS",
    docsUrl: "https://developer.withings.com/",
    endpoints: {
      authorizeUrl: "https://account.withings.com/oauth2_user/authorize2",
      tokenUrl: "https://wbsapi.withings.net/v2/oauth2",
      apiBaseUrl: "https://wbsapi.withings.net",
      scopes: ["user.metrics", "user.activity", "user.sleepevents"],
    },
  },
  garmin: {
    id: "garmin",
    displayName: "Garmin Connect",
    connector: "garmin_connect",
    authMode: "oauth2_pkce",
    envPrefix: "GARMIN",
    docsUrl: "https://developer.garmin.com/gc-developer-program/overview/",
    endpoints: {
      authorizeUrl: "https://connect.garmin.com/oauthConfirm",
      tokenUrl: "https://diauth.garmin.com/di-oauth2-token",
      apiBaseUrl: "https://apis.garmin.com/wellness-api/rest",
      scopes: ["ACTIVITY_READ", "HEALTH_EXPORT", "SLEEP_READ", "HEART_RATE_READ"],
    },
  },
  dexcom: {
    id: "dexcom",
    displayName: "Dexcom",
    connector: "dexcom",
    authMode: "oauth2",
    envPrefix: "DEXCOM",
    docsUrl: "https://developer.dexcom.com/",
    endpoints: {
      authorizeUrl: "https://sandbox-api.dexcom.com/v2/oauth2/login",
      tokenUrl: "https://sandbox-api.dexcom.com/v2/oauth2/token",
      apiBaseUrl: "https://sandbox-api.dexcom.com/v2",
      scopes: ["offline_access"],
    },
  },
  google_fit: {
    id: "google_fit",
    displayName: "Google Fit",
    connector: "google_fit",
    authMode: "oauth2_pkce",
    envPrefix: "GOOGLE_FIT",
    docsUrl: "https://developers.google.com/fit",
    endpoints: {
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      apiBaseUrl: "https://www.googleapis.com/fitness/v1",
      scopes: [
        "https://www.googleapis.com/auth/fitness.heart_rate.read",
        "https://www.googleapis.com/auth/fitness.sleep.read",
        "https://www.googleapis.com/auth/fitness.body.read",
        "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
      ],
    },
  },
  samsung_health: {
    id: "samsung_health",
    displayName: "Samsung Health",
    connector: "samsung_health",
    authMode: "native_bridge",
    envPrefix: "SAMSUNG_HEALTH",
    docsUrl: "https://developer.samsung.com/health",
    requiresNativeBridge: true,
  },
  apple_health: {
    id: "apple_health",
    displayName: "Apple Health",
    connector: "healthkit",
    authMode: "native_bridge",
    envPrefix: "APPLE_HEALTH",
    docsUrl: "https://developer.apple.com/documentation/healthkit",
    requiresNativeBridge: true,
  },
  polar: {
    id: "polar",
    displayName: "Polar AccessLink",
    connector: "polar_accesslink",
    authMode: "oauth2",
    envPrefix: "POLAR",
    docsUrl: "https://www.polar.com/accesslink-api/",
    endpoints: {
      authorizeUrl: "https://flow.polar.com/oauth2/authorization",
      tokenUrl: "https://polarremote.com/v2/oauth2/token",
      apiBaseUrl: "https://www.polaraccesslink.com/v3",
      scopes: ["accesslink.read_all"],
    },
  },
  coros: {
    id: "coros",
    displayName: "COROS",
    connector: "coros_cloud",
    authMode: "oauth2_pkce",
    envPrefix: "COROS",
    docsUrl: "https://www.coros.com/",
    endpoints: {
      authorizeUrl: "https://open.coros.com/oauth2/authorize",
      tokenUrl: "https://open.coros.com/oauth2/token",
      apiBaseUrl: "https://open.coros.com/api",
      scopes: ["activity", "sleep", "heartrate"],
    },
  },
  zepp: {
    id: "zepp",
    displayName: "Zepp",
    connector: "zepp_cloud",
    authMode: "oauth2_pkce",
    envPrefix: "ZEPP",
    docsUrl: "https://api.huami.com/",
    endpoints: {
      authorizeUrl: "https://account.huami.com/oauth2/authorize",
      tokenUrl: "https://account-us.huami.com/oauth2/token",
      apiBaseUrl: "https://api-mifit.huami.com",
      scopes: ["profile", "activity", "heartrate", "sleep"],
    },
  },
  ultrahuman: {
    id: "ultrahuman",
    displayName: "Ultrahuman",
    connector: "ultrahuman_cloud",
    authMode: "oauth2_pkce",
    envPrefix: "ULTRAHUMAN",
    docsUrl: "https://www.ultrahuman.com/",
    endpoints: {
      authorizeUrl: "https://www.ultrahuman.com/oauth/authorize",
      tokenUrl: "https://www.ultrahuman.com/oauth/token",
      apiBaseUrl: "https://api.ultrahuman.com/v1",
      scopes: ["read:vitals", "read:sleep", "read:recovery"],
    },
  },
  circular: {
    id: "circular",
    displayName: "Circular",
    connector: "circular_cloud",
    authMode: "oauth2_pkce",
    envPrefix: "CIRCULAR",
    docsUrl: "https://www.circular.xyz/",
    endpoints: {
      authorizeUrl: "https://app.circular.xyz/oauth/authorize",
      tokenUrl: "https://api.circular.xyz/oauth/token",
      apiBaseUrl: "https://api.circular.xyz/v1",
      scopes: ["read:metrics", "read:sleep"],
    },
  },
  resmed: {
    id: "resmed",
    displayName: "ResMed myAir",
    connector: "resmed_myair",
    authMode: "oauth2",
    envPrefix: "RESMED",
    docsUrl: "https://developer.resmed.com/",
    endpoints: {
      authorizeUrl: "https://auth.myair.com/oauth2/authorize",
      tokenUrl: "https://auth.myair.com/oauth2/token",
      apiBaseUrl: "https://api.myair.com/v1",
      scopes: ["therapy.read"],
    },
  },
  philips: {
    id: "philips",
    displayName: "Philips HealthSuite",
    connector: "philips_healthsuite",
    authMode: "oauth2",
    envPrefix: "PHILIPS",
    docsUrl: "https://www.usa.philips.com/healthcare",
    endpoints: {
      authorizeUrl: "https://www.careorchestrator.com/oauth/authorize",
      tokenUrl: "https://www.careorchestrator.com/oauth/token",
      apiBaseUrl: "https://api.careorchestrator.com/v1",
      scopes: ["sleep.read", "therapy.read"],
    },
  },
  eight_sleep: {
    id: "eight_sleep",
    displayName: "Eight Sleep",
    connector: "eight_sleep",
    authMode: "oauth2_pkce",
    envPrefix: "EIGHT_SLEEP",
    docsUrl: "https://www.eightsleep.com/",
    endpoints: {
      authorizeUrl: "https://client-api.8slp.net/oauth/authorize",
      tokenUrl: "https://client-api.8slp.net/oauth/token",
      apiBaseUrl: "https://client-api.8slp.net/v1",
      scopes: ["read:sleep", "read:vitals"],
    },
  },
  sleep_number: {
    id: "sleep_number",
    displayName: "Sleep Number",
    connector: "sleep_number",
    authMode: "oauth2",
    envPrefix: "SLEEP_NUMBER",
    docsUrl: "https://www.sleepnumber.com/",
    endpoints: {
      authorizeUrl: "https://prod-api.sleepiq.sleepnumber.com/oauth/authorize",
      tokenUrl: "https://prod-api.sleepiq.sleepnumber.com/oauth/token",
      apiBaseUrl: "https://prod-api.sleepiq.sleepnumber.com/rest",
      scopes: ["sleep.read"],
    },
  },
  libre: {
    id: "libre",
    displayName: "Abbott LibreView",
    connector: "libre_view",
    authMode: "oauth2",
    envPrefix: "LIBRE",
    docsUrl: "https://www.libreview.com/",
    endpoints: {
      authorizeUrl: "https://api.libreview.io/oauth/authorize",
      tokenUrl: "https://api.libreview.io/oauth/token",
      apiBaseUrl: "https://api.libreview.io",
      scopes: ["glucose.read"],
    },
  },
  levels: {
    id: "levels",
    displayName: "Levels",
    connector: "levels_api",
    authMode: "oauth2_pkce",
    envPrefix: "LEVELS",
    docsUrl: "https://www.levels.com/",
    endpoints: {
      authorizeUrl: "https://www.levels.com/oauth/authorize",
      tokenUrl: "https://api.levels.com/oauth/token",
      apiBaseUrl: "https://api.levels.com/v1",
      scopes: ["read:glucose", "read:metabolic"],
    },
  },
  omron: {
    id: "omron",
    displayName: "Omron Connect",
    connector: "omron_connect",
    authMode: "oauth2",
    envPrefix: "OMRON",
    docsUrl: "https://www.omronhealthcare.com/",
    endpoints: {
      authorizeUrl: "https://oauth.omronhealthcare.com/authorize",
      tokenUrl: "https://oauth.omronhealthcare.com/token",
      apiBaseUrl: "https://api.omronhealthcare.com/v1",
      scopes: ["bloodpressure", "activity", "weight"],
    },
  },
  masimo: {
    id: "masimo",
    displayName: "Masimo Health",
    connector: "masimo_cloud",
    authMode: "oauth2",
    envPrefix: "MASIMO",
    docsUrl: "https://www.masimo.com/",
    endpoints: {
      authorizeUrl: "https://auth.masimo.com/oauth2/authorize",
      tokenUrl: "https://auth.masimo.com/oauth2/token",
      apiBaseUrl: "https://api.masimo.com/v1",
      scopes: ["spo2.read", "pulse.read"],
    },
  },
  generic_oem: {
    id: "generic_oem",
    displayName: "OEM Cloud",
    connector: "generic_api",
    authMode: "oauth2_pkce",
    envPrefix: "GENERIC_OEM",
    endpoints: {
      authorizeUrl: "/oauth/authorize",
      tokenUrl: "/api/oauth/token",
      apiBaseUrl: "/api/oauth",
      scopes: ["read:vitals"],
    },
  },
  native_sim: {
    id: "native_sim",
    displayName: "PeakMD direct",
    connector: "native_sim",
    authMode: "sim",
    envPrefix: "NATIVE_SIM",
  },
  file_import: {
    id: "file_import",
    displayName: "File import",
    connector: "file_import",
    authMode: "file",
    envPrefix: "FILE_IMPORT",
  },
};

const CONNECTOR_TO_PROVIDER: Partial<Record<WearableConnector, OemProviderId>> = {
  fitbit: "fitbit",
  oura_cloud: "oura",
  whoop_cloud: "whoop",
  withings: "withings",
  garmin_connect: "garmin",
  dexcom: "dexcom",
  google_fit: "google_fit",
  samsung_health: "samsung_health",
  healthkit: "apple_health",
  polar_accesslink: "polar",
  coros_cloud: "coros",
  zepp_cloud: "zepp",
  ultrahuman_cloud: "ultrahuman",
  circular_cloud: "circular",
  resmed_myair: "resmed",
  philips_healthsuite: "philips",
  eight_sleep: "eight_sleep",
  sleep_number: "sleep_number",
  libre_view: "libre",
  levels_api: "levels",
  omron_connect: "omron",
  masimo_cloud: "masimo",
  generic_api: "generic_oem",
  custom: "generic_oem",
  native_sim: "native_sim",
  file_import: "file_import",
};

export function providerForConnector(connector?: WearableConnector): OemProviderConfig {
  const id = (connector && CONNECTOR_TO_PROVIDER[connector]) || "generic_oem";
  return OEM_PROVIDERS[id];
}

export function listOauthProviders(): OemProviderConfig[] {
  return Object.values(OEM_PROVIDERS).filter(
    (p) => p.authMode === "oauth2" || p.authMode === "oauth2_pkce" || p.authMode === "oauth1",
  );
}

export function getOemClientId(providerId: OemProviderId): string | undefined {
  const prefix = OEM_PROVIDERS[providerId]?.envPrefix;
  if (!prefix) return undefined;
  const key = `VITE_${prefix}_CLIENT_ID`;
  return (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env?.[key]?.trim() || undefined;
}

export function oemUsesLiveCloud(providerId: OemProviderId): boolean {
  const cfg = OEM_PROVIDERS[providerId];
  if (!cfg || cfg.authMode === "sim" || cfg.authMode === "file" || cfg.requiresNativeBridge) return false;
  return Boolean(getOemClientId(providerId));
}

export function connectorNeedsOauth(connector?: WearableConnector): boolean {
  const p = providerForConnector(connector);
  return (
    p.authMode === "oauth2" ||
    p.authMode === "oauth2_pkce" ||
    p.authMode === "oauth1" ||
    p.authMode === "native_bridge"
  );
}

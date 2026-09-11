import type { WearableConnector, WearableKind, WearableReading } from "@/types/dashboard";

export type OemAuthMode =
  | "oauth2"
  | "oauth2_pkce"
  | "oauth1"
  | "native_bridge"
  | "file"
  | "sim";

export type OemProviderId =
  | "fitbit"
  | "oura"
  | "whoop"
  | "withings"
  | "garmin"
  | "dexcom"
  | "google_fit"
  | "samsung_health"
  | "apple_health"
  | "polar"
  | "coros"
  | "zepp"
  | "ultrahuman"
  | "circular"
  | "resmed"
  | "philips"
  | "eight_sleep"
  | "sleep_number"
  | "libre"
  | "levels"
  | "omron"
  | "masimo"
  | "generic_oem"
  | "native_sim"
  | "file_import";

export interface OemOAuthEndpoints {
  authorizeUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
  apiBaseUrl: string;
  scopes: string[];
}

export interface OemProviderConfig {
  id: OemProviderId;
  displayName: string;
  connector: WearableConnector;
  authMode: OemAuthMode;
  envPrefix: string;
  endpoints?: OemOAuthEndpoints;
  docsUrl?: string;
  requiresNativeBridge?: boolean;
}

export interface OemTokenSet {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  scope?: string;
  expiresAt?: string;
  externalUserId?: string;
  sandbox?: boolean;
}

export interface OemConnection {
  id: string;
  providerId: OemProviderId;
  connector: WearableConnector;
  deviceId: WearableKind;
  email: string;
  status: "pending" | "connected" | "expired" | "revoked" | "error";
  externalUserId?: string;
  scopes: string[];
  connectedAt: string;
  lastSyncAt?: string;
  lastError?: string;
  sandbox: boolean;
}

export interface OemSyncResult {
  providerId: OemProviderId;
  deviceId: WearableKind;
  readings: Array<Omit<WearableReading, "id" | "createdAt">>;
  rawNote?: string;
  liveApi: boolean;
}

export interface PendingOAuthState {
  state: string;
  codeVerifier: string;
  providerId: OemProviderId;
  deviceId: WearableKind;
  email: string;
  returnTo: string;
  createdAt: string;
  connector: WearableConnector;
}

export interface ConnectorAdapter {
  providerId: OemProviderId;
  sync(ctx: {
    deviceId: WearableKind;
    tokens: OemTokenSet;
    since?: string;
  }): Promise<OemSyncResult>;
}

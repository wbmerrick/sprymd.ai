import type { WearableKind, WearableReading } from "@/types/dashboard";
import { getAdapter } from "./adapters";
import { OEM_PROVIDERS } from "./oemProviders";
import { getOemConnection, getOemTokens, upsertOemConnection } from "./tokenVault";

/** Pull OEM cloud readings for a linked device. */
export async function syncOemCloud(
  email: string,
  deviceId: WearableKind,
): Promise<{ readings: WearableReading[]; liveApi: boolean; providerName: string }> {
  const conn = getOemConnection(email, deviceId);
  const tokens = getOemTokens(email, deviceId);
  if (!conn || !tokens || conn.status !== "connected") {
    throw new Error("No OEM cloud link for this device. Connect with OAuth first.");
  }

  const result = await getAdapter(conn.providerId).sync({
    deviceId,
    tokens,
    since: conn.lastSyncAt,
  });

  upsertOemConnection({
    ...conn,
    lastSyncAt: new Date().toISOString(),
    lastError: undefined,
    status: "connected",
  });

  const now = new Date().toISOString();
  const readings: WearableReading[] = result.readings.map((r, i) => ({
    ...r,
    id: `oem_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
    deviceId,
    createdAt: now,
  }));

  return {
    readings,
    liveApi: result.liveApi,
    providerName: OEM_PROVIDERS[conn.providerId]?.displayName || conn.providerId,
  };
}

export function hasOemCloudLink(email: string, deviceId: WearableKind): boolean {
  const conn = getOemConnection(email, deviceId);
  return Boolean(conn && conn.status === "connected" && getOemTokens(email, deviceId));
}

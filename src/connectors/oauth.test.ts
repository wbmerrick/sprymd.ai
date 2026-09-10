import { beforeEach, describe, expect, it, vi } from "vitest";
import { WEARABLE_CATALOG } from "@/data/wearables";
import {
  completeOemOAuth,
  connectorNeedsOauth,
  hasOemCloudLink,
  issueSandboxAuthCode,
  listOauthProviders,
  OEM_PROVIDERS,
  savePendingOAuth,
  startOemOAuth,
  syncOemCloud,
} from "@/connectors";
import {
  connectWearableDevice,
  getPatientCare,
  markWearableOAuthLinked,
  syncWearableDeviceFromCloud,
} from "@/lib/patientCareStore";

const EMAIL = "oem.oauth@example.com";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("OEM OAuth cloud connectors", () => {
  it("registers OAuth providers for major OEM clouds", () => {
    const ids = listOauthProviders().map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "fitbit",
        "oura",
        "whoop",
        "withings",
        "garmin",
        "dexcom",
        "google_fit",
        "polar",
        "resmed",
        "libre",
      ]),
    );
    expect(Object.keys(OEM_PROVIDERS).length).toBeGreaterThanOrEqual(20);
  });

  it("flags catalog cloud devices as needing OAuth", () => {
    const fitbit = WEARABLE_CATALOG.find((d) => d.connector === "fitbit");
    const oura = WEARABLE_CATALOG.find((d) => d.connector === "oura_cloud");
    const native = WEARABLE_CATALOG.find((d) => d.connector === "native_sim");
    expect(fitbit && connectorNeedsOauth(fitbit.connector)).toBe(true);
    expect(oura && connectorNeedsOauth(oura.connector)).toBe(true);
    expect(native && connectorNeedsOauth(native.connector)).toBe(false);
  });

  it("completes sandbox OAuth and syncs OEM cloud readings into the care record", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      origin: "http://localhost:8080",
      assign,
    });

    await startOemOAuth({
      email: EMAIL,
      deviceId: "fitbit_charge",
      connector: "fitbit",
      returnTo: "/dashboard?oem=connected",
    });

    expect(assign).toHaveBeenCalled();
    const target = String(assign.mock.calls[0][0]);
    expect(target).toContain("/oauth/authorize");
    const url = new URL(target);
    const state = url.searchParams.get("state")!;
    expect(state).toBeTruthy();

    // Simulate authorize page issuing a sandbox code, then callback completing exchange.
    // Pending state was saved by startOemOAuth.
    const code = issueSandboxAuthCode("fitbit");
    const { connection, returnTo } = await completeOemOAuth({ code, state });
    expect(connection.status).toBe("connected");
    expect(connection.sandbox).toBe(true);
    expect(returnTo).toContain("/dashboard");
    expect(hasOemCloudLink(EMAIL, "fitbit_charge")).toBe(true);

    connectWearableDevice(EMAIL, "fitbit_charge");
    markWearableOAuthLinked(EMAIL, {
      providerId: connection.providerId,
      connector: connection.connector,
      deviceId: connection.deviceId,
      status: "connected",
      sandbox: true,
      connectedAt: connection.connectedAt,
      externalUserId: connection.externalUserId,
    });

    const cloud = await syncOemCloud(EMAIL, "fitbit_charge");
    expect(cloud.readings.length).toBeGreaterThan(0);
    expect(cloud.providerName.toLowerCase()).toContain("fitbit");

    await syncWearableDeviceFromCloud(EMAIL, "fitbit_charge");
    const care = getPatientCare(EMAIL);
    expect(care.wearableReadings.length).toBeGreaterThan(0);
    expect(care.oauthLinks?.some((l) => l.deviceId === "fitbit_charge" && l.status === "connected")).toBe(true);
  });

  it("links native-bridge OEMs without leaving the app", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      origin: "http://localhost:8080",
      assign,
    });

    await startOemOAuth({
      email: EMAIL,
      deviceId: "apple_watch",
      connector: "healthkit",
      returnTo: "/dashboard?oem=connected",
    });

    expect(assign).toHaveBeenCalledWith("/dashboard?oem=connected");
    expect(hasOemCloudLink(EMAIL, "apple_watch")).toBe(true);
  });
});

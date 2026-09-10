import type { WearableConnector, WearableKind } from "@/types/dashboard";
import { createPkcePair, randomUrlSafe } from "./pkce";
import { getOemClientId, OEM_PROVIDERS, oemUsesLiveCloud, providerForConnector } from "./oemProviders";
import {
  clearPendingOAuth,
  loadPendingOAuth,
  removeOemConnection,
  saveOemTokens,
  savePendingOAuth,
  upsertOemConnection,
} from "./tokenVault";
import type { OemConnection, OemProviderId, OemTokenSet } from "./types";

function origin() {
  return typeof window === "undefined" ? "http://localhost:8080" : window.location.origin;
}

export function oauthCallbackUrl() {
  return `${origin()}/oauth/callback`;
}

export function oauthAuthorizePageUrl() {
  return `${origin()}/oauth/authorize`;
}

function tokenApiUrl() {
  return `${origin()}/api/oauth/token`;
}

/** Start OEM OAuth — live vendor when client id is set, otherwise SpryMD sandbox consent. */
export async function startOemOAuth(input: {
  email: string;
  deviceId: WearableKind;
  connector?: WearableConnector;
  returnTo?: string;
}): Promise<void> {
  const provider = providerForConnector(input.connector);
  const returnTo = input.returnTo || "/dashboard?oem=connected";
  const email = input.email.trim().toLowerCase();

  if (provider.authMode === "sim" || provider.authMode === "file") {
    throw new Error(`${provider.displayName} does not use cloud OAuth.`);
  }

  if (provider.requiresNativeBridge || provider.authMode === "native_bridge") {
    const tokens: OemTokenSet = {
      accessToken: `bridge_${provider.id}_${randomUrlSafe(24)}`,
      refreshToken: `bridge_refresh_${randomUrlSafe(16)}`,
      tokenType: "Bearer",
      scope: "native_bridge",
      expiresAt: new Date(Date.now() + 30 * 86400_000).toISOString(),
      externalUserId: `bridge_${email.split("@")[0]}`,
      sandbox: true,
    };
    saveOemTokens(email, input.deviceId, tokens);
    upsertOemConnection({
      id: `oem_${provider.id}_${input.deviceId}`,
      providerId: provider.id,
      connector: provider.connector,
      deviceId: input.deviceId,
      email,
      status: "connected",
      externalUserId: tokens.externalUserId,
      scopes: ["native_bridge"],
      connectedAt: new Date().toISOString(),
      sandbox: true,
    });
    window.location.assign(returnTo);
    return;
  }

  const { verifier, challenge } = await createPkcePair();
  const state = randomUrlSafe(32);
  savePendingOAuth({
    state,
    codeVerifier: verifier,
    providerId: provider.id,
    deviceId: input.deviceId,
    email,
    returnTo,
    createdAt: new Date().toISOString(),
    connector: provider.connector,
  });

  if (oemUsesLiveCloud(provider.id) && provider.endpoints) {
    const url = new URL(provider.endpoints.authorizeUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", getOemClientId(provider.id)!);
    url.searchParams.set("redirect_uri", oauthCallbackUrl());
    url.searchParams.set("scope", provider.endpoints.scopes.join(" "));
    url.searchParams.set("state", state);
    if (provider.authMode === "oauth2_pkce") {
      url.searchParams.set("code_challenge", challenge);
      url.searchParams.set("code_challenge_method", "S256");
    }
    window.location.assign(url.toString());
    return;
  }

  const sandbox = new URL(oauthAuthorizePageUrl());
  sandbox.searchParams.set("provider", provider.id);
  sandbox.searchParams.set("device", input.deviceId);
  sandbox.searchParams.set("state", state);
  sandbox.searchParams.set("email", email);
  window.location.assign(sandbox.toString());
}

export function issueSandboxAuthCode(providerId: OemProviderId): string {
  return `sandbox_${providerId}_${randomUrlSafe(24)}`;
}

/** Complete OAuth after callback receives code + state. */
export async function completeOemOAuth(input: {
  code: string;
  state: string;
}): Promise<{ connection: OemConnection; returnTo: string }> {
  const pending = loadPendingOAuth();
  if (!pending || pending.state !== input.state) {
    throw new Error("OAuth state mismatch. Restart device connect.");
  }

  const provider = OEM_PROVIDERS[pending.providerId];
  let tokens: OemTokenSet;
  if (oemUsesLiveCloud(pending.providerId)) {
    tokens = await exchangeToken(input.code, pending.codeVerifier, false, pending.providerId);
  } else {
    tokens = await exchangeSandbox(input.code, pending.codeVerifier, pending.providerId);
  }

  saveOemTokens(pending.email, pending.deviceId, tokens);
  const connection: OemConnection = {
    id: `oem_${pending.providerId}_${pending.deviceId}`,
    providerId: pending.providerId,
    connector: pending.connector,
    deviceId: pending.deviceId,
    email: pending.email,
    status: "connected",
    externalUserId: tokens.externalUserId,
    scopes: provider.endpoints?.scopes || [],
    connectedAt: new Date().toISOString(),
    sandbox: Boolean(tokens.sandbox),
  };
  upsertOemConnection(connection);
  clearPendingOAuth();
  return { connection, returnTo: pending.returnTo };
}

async function exchangeToken(
  code: string,
  codeVerifier: string,
  sandbox: boolean,
  providerId: OemProviderId,
): Promise<OemTokenSet> {
  const res = await fetch(tokenApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: providerId,
      code,
      code_verifier: codeVerifier,
      redirect_uri: oauthCallbackUrl(),
      sandbox,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status})`);
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
    user_id?: string;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type || "Bearer",
    scope: data.scope,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : undefined,
    externalUserId: data.user_id,
    sandbox,
  };
}

async function exchangeSandbox(
  code: string,
  codeVerifier: string,
  providerId: OemProviderId,
): Promise<OemTokenSet> {
  try {
    return await exchangeToken(code, codeVerifier, true, providerId);
  } catch {
    if (!code.startsWith("sandbox_")) throw new Error("Invalid sandbox authorization code.");
    return {
      accessToken: `sandbox_access_${providerId}_${randomUrlSafe(20)}`,
      refreshToken: `sandbox_refresh_${randomUrlSafe(16)}`,
      tokenType: "Bearer",
      scope: OEM_PROVIDERS[providerId].endpoints?.scopes.join(" "),
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      externalUserId: `sandbox_${providerId}_user`,
      sandbox: true,
    };
  }
}

export function disconnectOemCloud(email: string, deviceId: WearableKind) {
  removeOemConnection(email, deviceId);
}

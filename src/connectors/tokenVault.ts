import type { OemConnection, OemProviderId, OemTokenSet, PendingOAuthState } from "./types";

const TOKEN_KEY = "sprymd_oem_tokens_v1";
const PENDING_KEY = "sprymd_oem_oauth_pending_v1";
const CONN_KEY = "sprymd_oem_connections_v1";

type TokenStore = Record<string, OemTokenSet>;
type ConnStore = Record<string, OemConnection[]>;

function keyFor(email: string, deviceId: string) {
  return `${email.trim().toLowerCase()}::${deviceId}`;
}

function readTokens(): TokenStore {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeTokens(store: TokenStore) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(store));
}

function readConns(): ConnStore {
  try {
    return JSON.parse(localStorage.getItem(CONN_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeConns(store: ConnStore) {
  localStorage.setItem(CONN_KEY, JSON.stringify(store));
}

export function saveOemTokens(email: string, deviceId: string, tokens: OemTokenSet) {
  const store = readTokens();
  store[keyFor(email, deviceId)] = tokens;
  writeTokens(store);
}

export function getOemTokens(email: string, deviceId: string): OemTokenSet | null {
  return readTokens()[keyFor(email, deviceId)] || null;
}

export function clearOemTokens(email: string, deviceId: string) {
  const store = readTokens();
  delete store[keyFor(email, deviceId)];
  writeTokens(store);
}

export function upsertOemConnection(conn: OemConnection) {
  const store = readConns();
  const email = conn.email.trim().toLowerCase();
  const list = store[email] || [];
  const idx = list.findIndex((c) => c.deviceId === conn.deviceId);
  if (idx >= 0) list[idx] = conn;
  else list.push(conn);
  store[email] = list;
  writeConns(store);
}

export function listOemConnections(email: string): OemConnection[] {
  return readConns()[email.trim().toLowerCase()] || [];
}

export function getOemConnection(email: string, deviceId: string): OemConnection | null {
  return listOemConnections(email).find((c) => c.deviceId === deviceId) || null;
}

export function removeOemConnection(email: string, deviceId: string) {
  const store = readConns();
  const key = email.trim().toLowerCase();
  store[key] = (store[key] || []).filter((c) => c.deviceId !== deviceId);
  writeConns(store);
  clearOemTokens(email, deviceId);
}

export function savePendingOAuth(pending: PendingOAuthState) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function loadPendingOAuth(): PendingOAuthState | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingOAuthState) : null;
  } catch {
    return null;
  }
}

export function clearPendingOAuth() {
  sessionStorage.removeItem(PENDING_KEY);
}

export function findConnectionByProvider(email: string, providerId: OemProviderId) {
  return listOemConnections(email).find((c) => c.providerId === providerId && c.status === "connected");
}

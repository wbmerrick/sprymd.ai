import { supabase } from "@/integrations/supabase/client";
import { isMasterEmail } from "@/lib/masterAccount";

const ACCOUNTS_KEY = "sprymd_accounts_v1";
const SESSION_KEY = "sprymd_session_email_v1";

const emailKey = (email) => String(email || "").trim().toLowerCase();

async function hashPassword(password, email) {
  const data = new TextEncoder().encode(`${emailKey(email)}:${password}:sprymd-v1`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(store));
}

export function getStoredAccount(email) {
  const key = emailKey(email);
  if (!key) return null;
  return readStore()[key] || null;
}

export function upsertStoredAccount(account) {
  const key = emailKey(account.email);
  if (!key) return null;
  const store = readStore();
  const prev = store[key] || {};
  const next = {
    ...prev,
    ...account,
    email: key,
    updatedAt: new Date().toISOString(),
  };
  store[key] = next;
  writeStore(store);
  return next;
}

export function setSessionEmail(email) {
  if (!email) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, emailKey(email));
}

export function getSessionEmail() {
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Build the in-app user object for a given email (creates shell if missing). */
export function buildCustomerProfile(email, overrides = {}) {
  const key = emailKey(email);
  const stored = getStoredAccount(key) || {};
  const createdAt = stored.createdAt || new Date().toISOString();
  const name =
    overrides.name ||
    stored.name ||
    overrides.user_metadata?.full_name ||
    overrides.user_metadata?.name ||
    key.split("@")[0];

  const profile = {
    id: overrides.id || stored.id || `local_${key.replace(/[^a-z0-9]/g, "_")}`,
    email: key,
    name,
    dob: overrides.dob || stored.dob || overrides.user_metadata?.dob || "",
    phone: overrides.phone || stored.phone || "",
    address: overrides.address || stored.address || {
      line1: "",
      city: "",
      state: "",
      zip: "",
    },
    memberSince: stored.memberSince || createdAt,
    createdAt,
    authProvider: overrides.authProvider || stored.authProvider || "local",
    protocols: overrides.protocols || stored.protocols || [],
    orders: overrides.orders || stored.orders || [],
    // New customers start with an empty Rx list — their own account, not a shared demo bag.
    rxHistory: overrides.rxHistory || stored.rxHistory || [],
  };

  upsertStoredAccount({
    ...profile,
    // never persist password hash via this path unless provided
    passwordHash: stored.passwordHash,
  });

  return profile;
}

export async function registerLocalAccount({ email, password, name, dob }) {
  const key = emailKey(email);
  const existing = getStoredAccount(key);
  if (existing?.passwordHash) {
    const err = new Error("An account already exists for this email. Sign in instead.");
    err.code = "exists";
    throw err;
  }
  const passwordHash = await hashPassword(password, key);
  const profile = buildCustomerProfile(key, {
    name: name.trim(),
    dob,
    authProvider: "local",
    rxHistory: [],
    protocols: [],
    orders: [],
  });
  upsertStoredAccount({ ...profile, passwordHash });
  setSessionEmail(key);
  return profile;
}

export async function signInLocalAccount({ email, password }) {
  const key = emailKey(email);
  const existing = getStoredAccount(key);
  if (!existing) {
    const err = new Error("No account found for that email. Create one to continue.");
    err.code = "missing";
    throw err;
  }
  if (!existing.passwordHash) {
    const err = new Error("This account needs to be re-created on this device. Use Create account with the same email.");
    err.code = "missing_verifier";
    throw err;
  }
  const passwordHash = await hashPassword(password, key);
  if (passwordHash !== existing.passwordHash) {
    const err = new Error("Incorrect email or password.");
    err.code = "invalid";
    throw err;
  }
  const profile = buildCustomerProfile(key);
  setSessionEmail(key);
  return profile;
}

/**
 * Prefer Supabase Auth; fall back to local per-email accounts so every
 * customer still gets an isolated account if Auth is unavailable.
 * Always store a local password hash so customers can re-enter their
 * account even when Supabase email confirmation blocks password login.
 */
export async function signUpCustomer({ email, password, name, dob }) {
  const key = emailKey(email);
  const passwordHash = await hashPassword(password, key);
  const existing = getStoredAccount(key);
  if (existing?.passwordHash && !isMasterEmail(key)) {
    const err = new Error("An account already exists for this email. Sign in instead.");
    err.code = "exists";
    throw err;
  }

  let supabaseUser = null;
  let supabaseSession = null;
  let supabaseError = null;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: key,
      password,
      options: { data: { full_name: name.trim(), dob, role: isMasterEmail(key) ? "master" : "patient" } },
    });
    if (error) throw error;
    supabaseUser = data?.user || null;
    supabaseSession = data?.session || null;
  } catch (e) {
    supabaseError = e;
    const msg = String(e?.message || "").toLowerCase();
    // Hard-fail only on clear password policy rejections; otherwise local account still works.
    if (msg.includes("password") && (msg.includes("weak") || msg.includes("least") || msg.includes("characters"))) {
      throw e;
    }
  }

  const profile = buildCustomerProfile(key, {
    id: supabaseUser?.id || existing?.id,
    name: name.trim() || existing?.name,
    dob: dob || existing?.dob,
    authProvider: supabaseUser ? "supabase" : "local",
    user_metadata: supabaseUser?.user_metadata,
    rxHistory: existing?.rxHistory || [],
    protocols: existing?.protocols || [],
    orders: existing?.orders || [],
  });
  upsertStoredAccount({ ...profile, passwordHash });
  setSessionEmail(key);

  try {
    const { ensureAccountShell } = await import("@/lib/patientCareStore");
    ensureAccountShell(key, profile.name);
  } catch {
    /* ignore care bootstrap errors during auth */
  }

  if (supabaseUser) {
    return {
      profile,
      provider: "supabase",
      needsEmailConfirm: !supabaseSession,
    };
  }

  // If Supabase rejected because the email is already registered, keep local
  // account so this browser can still open a private customer hub.
  if (supabaseError) {
    const msg = String(supabaseError.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      // local account created above — treat as success for this device
    }
  }

  return { profile, provider: "local", needsEmailConfirm: false };
}

export async function signInCustomer({ email, password }) {
  const key = emailKey(email);
  const passwordHash = await hashPassword(password, key);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: key,
      password,
    });
    if (error) throw error;
    if (data?.user) {
      const stored = getStoredAccount(key) || {};
      const profile = buildCustomerProfile(key, {
        id: data.user.id,
        authProvider: "supabase",
        user_metadata: data.user.user_metadata,
      });
      // Keep / refresh local verifier so future sessions work offline of Auth.
      upsertStoredAccount({ ...profile, passwordHash: stored.passwordHash || passwordHash });
      setSessionEmail(key);
      try {
        const { ensureAccountShell } = await import("@/lib/patientCareStore");
        ensureAccountShell(key, profile?.name);
      } catch {
        /* ignore */
      }
      return { profile, provider: "supabase" };
    }
  } catch {
    // Fall through to local per-email account
  }

  const profile = await signInLocalAccount({ email: key, password });
  try {
    const { ensureAccountShell } = await import("@/lib/patientCareStore");
    ensureAccountShell(key, profile?.name);
  } catch {
    /* ignore */
  }
  return { profile, provider: "local" };
}

export async function signOutCustomer() {
  clearSession();
  try {
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
}

export async function restoreCustomerSession() {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      const u = data.session.user;
      const profile = buildCustomerProfile(u.email, {
        id: u.id,
        authProvider: "supabase",
        user_metadata: u.user_metadata,
      });
      setSessionEmail(u.email);
      return profile;
    }
  } catch {
    /* ignore */
  }
  const email = getSessionEmail();
  if (email && getStoredAccount(email)) {
    return buildCustomerProfile(email);
  }
  return null;
}

export function updateCustomerProfile(email, patch) {
  const profile = buildCustomerProfile(email, patch);
  return profile;
}

export function addCustomerOrder(email, order) {
  const stored = getStoredAccount(email) || buildCustomerProfile(email);
  const orders = [{ id: `ord_${Date.now()}`, createdAt: new Date().toISOString(), ...order }, ...(stored.orders || [])];
  return buildCustomerProfile(email, { orders });
}

export function addCustomerProtocol(email, protocol) {
  const stored = getStoredAccount(email) || buildCustomerProfile(email);
  const protocols = [
    { id: `proto_${Date.now()}`, startedAt: new Date().toISOString(), status: "pending_review", ...protocol },
    ...(stored.protocols || []),
  ];
  // Also mirror into a lightweight rx entry once a plan is selected
  const rxHistory = [...(stored.rxHistory || [])];
  if (protocol?.name && !rxHistory.some((r) => r.name === protocol.name)) {
    rxHistory.unshift({
      rxId: `SPRY-${Math.floor(100000 + Math.random() * 900000)}`,
      name: protocol.name,
      strength: protocol.sub || "Clinician-titrated",
      sig: "Follow clinician instructions",
      lastFilled: "Pending review",
      refills: 5,
      refillsUsed: 0,
      price: protocol.price || 0,
      chilled: !!protocol.chilled,
      category: protocol.category || "Protocol",
      color: "hsl(150, 55%, 40%)",
      prescriber: "Merrick, William DO",
      daysSupply: 28,
    });
  }
  return buildCustomerProfile(email, { protocols, rxHistory });
}

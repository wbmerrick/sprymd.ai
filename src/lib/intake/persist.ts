const SESSION_STORAGE_KEY = "spry_session_id";

export const isSupabaseConfigured = (): boolean =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

export const readStoredSessionId = (): string | null => {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const writeStoredSessionId = (sessionId: string): void => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // ignore storage failures in private browsing
  }
};

export const generateSessionId = (): string => crypto.randomUUID();

export const ensureSessionId = (): string => {
  const existing = readStoredSessionId();
  if (existing) return existing;
  const id = generateSessionId();
  writeStoredSessionId(id);
  return id;
};

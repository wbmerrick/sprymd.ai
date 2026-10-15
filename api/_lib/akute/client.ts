/**
 * Akute Health REST client (server-only). Patterns mirrored from wbmerrick/ispry-ai.
 * Auth: X-API-Key. Never expose AKUTE_API_KEY to the browser.
 */

const BASE = () =>
  (process.env.AKUTE_BASE_URL || "https://api.akutehealth.com/v1").replace(
    /\/$/,
    "",
  );

export function akuteConfigured(): boolean {
  return Boolean(process.env.AKUTE_API_KEY);
}

export async function akute(
  path: string,
  opts: RequestInit = {},
): Promise<unknown> {
  const key = process.env.AKUTE_API_KEY;
  if (!key) throw new Error("AKUTE_API_KEY missing");

  const r = await fetch(BASE() + path, {
    ...opts,
    headers: {
      "X-API-Key": key,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const text = await r.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!r.ok) {
    const hint =
      (data &&
        typeof data === "object" &&
        ((data as { message?: string }).message ||
          (data as { error?: string }).error)) ||
      text ||
      "";
    throw new Error(
      `Akute ${opts.method || "GET"} ${path.split("?")[0]} -> ${r.status} ${String(hint).replace(/\s+/g, " ").slice(0, 160)}`,
    );
  }
  return data;
}

export const list = (d: unknown): unknown[] =>
  Array.isArray(d)
    ? d
    : ((d as { data?: unknown[] })?.data ||
        (d as { results?: unknown[] })?.results ||
        (d as { items?: unknown[] })?.items ||
        []) as unknown[];

export const idOf = (o: unknown): string | null => {
  if (!o || typeof o !== "object") return null;
  const rec = o as Record<string, unknown>;
  const nested = rec.data as Record<string, unknown> | undefined;
  const id = rec.id || nested?.id || rec.patient_id;
  return id != null ? String(id) : null;
};

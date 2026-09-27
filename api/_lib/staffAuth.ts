import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabaseAdmin";

const DEFAULT_STAFF_EMAILS = ["wbmerrick@gmail.com"];

function staffEmailAllowlist(): Set<string> {
  const fromEnv = String(process.env.OPS_STAFF_EMAILS || process.env.MASTER_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_STAFF_EMAILS, ...fromEnv]);
}

export type StaffContext = {
  user: User;
  email: string;
  providerId: string | null;
  isAllowlisted: boolean;
};

/**
 * Authorize ops/clinician console callers: Supabase Bearer session must be
 * either on OPS_STAFF_EMAILS / MASTER_EMAILS, or an active `providers` row.
 *
 * Allowlisted staff without a providers row get one auto-created (TN default)
 * so "Assign to me" / Mine queue work on first login after Supabase cutover.
 */
export async function requireStaff(
  authorizationHeader: string | undefined,
): Promise<
  | { ok: true; staff: StaffContext }
  | { ok: false; status: number; error: string }
> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "auth_required" };
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) {
    return { ok: false, status: 401, error: "auth_required" };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) {
      return { ok: false, status: 401, error: "invalid_session" };
    }

    const email = String(data.user.email || "")
      .trim()
      .toLowerCase();
    const isAllowlisted = email ? staffEmailAllowlist().has(email) : false;

    let providerId = await lookupActiveProviderId(admin, data.user.id);

    if (!isAllowlisted && !providerId) {
      return { ok: false, status: 403, error: "staff_required" };
    }

    if (isAllowlisted && !providerId) {
      providerId = await ensureStaffProvider(admin, data.user, email);
    }

    return {
      ok: true,
      staff: {
        user: data.user,
        email,
        providerId,
        isAllowlisted,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 500, error: message };
  }
}

async function lookupActiveProviderId(
  admin: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
): Promise<string | null> {
  const { data: provider } = await admin
    .from("providers")
    .select("id, active")
    .eq("user_id", userId)
    .maybeSingle();

  return provider?.id && provider.active !== false ? String(provider.id) : null;
}

async function ensureStaffProvider(
  admin: ReturnType<typeof getSupabaseAdmin>,
  user: User,
  email: string,
): Promise<string | null> {
  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const fullName =
    String(meta.full_name || meta.name || "").trim() ||
    email.split("@")[0] ||
    "Clinician";

  const { data, error } = await admin
    .from("providers")
    .upsert(
      {
        user_id: user.id,
        email,
        full_name: fullName,
        license_states: ["TN"],
        specialty: "telehealth",
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      JSON.stringify({
        event: "ops_ensure_staff_provider_failed",
        message: error.message,
        email,
      }),
    );
    return null;
  }

  return data?.id ? String(data.id) : null;
}

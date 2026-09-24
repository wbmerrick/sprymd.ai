import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isMasterEmail } from "@/lib/masterAccount";
import { restoreCustomerSession } from "@/lib/customerAccounts";

type OpsSession = {
  accessToken: string;
  email: string;
};

async function resolveOpsSession(): Promise<OpsSession | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (session?.access_token && session.user?.email) {
    return {
      accessToken: session.access_token,
      email: session.user.email,
    };
  }

  // Fall back to local Spry session restore (may establish Supabase session).
  await restoreCustomerSession();
  const again = await supabase.auth.getSession();
  const s2 = again.data.session;
  if (s2?.access_token && s2.user?.email) {
    return { accessToken: s2.access_token, email: s2.user.email };
  }
  return null;
}

export default function OpsLayout() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<OpsSession | null>(null);
  const [staffOk, setStaffOk] = useState(false);

  const refresh = useCallback(async () => {
    const next = await resolveOpsSession();
    setSession(next);
    setStaffOk(!!next && isMasterEmail(next.email));
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b100e] text-[#c8b89a] text-sm tracking-wide">
        Loading ops…
      </div>
    );
  }

  if (!session) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?auth=1&returnTo=${returnTo}`} replace />;
  }

  // Client gate is allowlist-only; API also accepts active providers rows.
  // Non-master signed-in users still reach the page and get a clear API 403.
  return (
    <div className="min-h-screen bg-[#0b100e] text-[#f3efe6]">
      <header className="border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link to="/ops" className="font-display text-lg tracking-tight shrink-0">
            Spry<span className="text-[#9dba8c]">MD</span> Ops
          </Link>
          <span className="text-xs text-white/45 truncate hidden sm:inline">
            Clinician / order console
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/55">
          <span className="hidden md:inline truncate max-w-[220px]">{session.email}</span>
          {!staffOk && (
            <span className="text-amber-200/90">Staff allowlist or provider row required</span>
          )}
          <Link to="/" className="underline underline-offset-4 hover:text-white">
            Site
          </Link>
        </div>
      </header>
      <Outlet context={{ accessToken: session.accessToken, email: session.email }} />
    </div>
  );
}

export type OpsOutletContext = {
  accessToken: string;
  email: string;
};

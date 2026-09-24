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

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#14201a_0%,_#0b100e_55%)] text-[#f3efe6]">
      <header className="border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between gap-4 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-4 min-w-0">
          <Link to="/ops" className="font-display text-lg tracking-tight shrink-0">
            Spry<span className="text-[#9dba8c]">MD</span> Ops
          </Link>
          <nav className="hidden sm:flex items-center gap-3 text-xs text-white/50">
            <Link to="/ops" className="hover:text-white transition-colors">
              Queue
            </Link>
            <span className="text-white/25">|</span>
            <span>Clinician console</span>
          </nav>
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

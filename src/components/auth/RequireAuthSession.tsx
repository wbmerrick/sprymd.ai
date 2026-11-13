import { useEffect, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { resolveClinicalAuthSession } from "@/lib/clinicalSession";
import { isDemoRequest } from "@/pages/ops/opsHelpers";

type RequireAuthSessionProps = {
  /** When true, `?demo=1` bypasses the live session check (ops dress rehearsal). */
  allowDemo?: boolean;
  children?: ReactNode;
};

/**
 * Gate for clinical tooling that must not render for anonymous visitors.
 * Mirrors `/ops`: require a live Supabase session, or allow `?demo=1`.
 * Unauthenticated users are sent to the homepage sign-in modal with returnTo.
 */
export default function RequireAuthSession({
  allowDemo = true,
  children,
}: RequireAuthSessionProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const demo =
    allowDemo &&
    (isDemoRequest(location.search) || searchParams.get("demo") === "1");
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (demo) {
        if (!cancelled) {
          setAuthed(true);
          setReady(true);
        }
        return;
      }
      const session = await resolveClinicalAuthSession();
      if (cancelled) return;
      setAuthed(!!session);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [demo]);

  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0b100e] text-[#c8b89a] text-sm tracking-wide"
        data-testid="auth-session-loading"
      >
        Checking sign-in…
      </div>
    );
  }

  if (!authed) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate to={`/?auth=1&mode=signin&returnTo=${returnTo}`} replace />
    );
  }

  if (children != null) return <>{children}</>;
  return <Outlet />;
}

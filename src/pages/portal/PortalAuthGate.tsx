import { useCallback } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useIdleTimeout, DEFAULT_IDLE_TIMEOUT_MS } from "@/hooks/useIdleTimeout";
import { usePatientAuth } from "@/hooks/usePatientAuth";

const PortalAuthGate = () => {
  const { isAuthenticated, isLoading, signOut } = usePatientAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleTimeout = useCallback(() => {
    void (async () => {
      await signOut();
      navigate("/portal/login", {
        replace: true,
        state: { reason: "inactivity", from: location.pathname },
      });
    })();
  }, [signOut, navigate, location.pathname]);

  useIdleTimeout({
    onTimeout: handleTimeout,
    timeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
    enabled: isAuthenticated && !isLoading,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-off-white flex items-center justify-center pt-16">
        <p className="font-body text-muted-foreground">Loading your portal…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default PortalAuthGate;

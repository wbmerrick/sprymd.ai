import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePatientAuth } from "@/hooks/usePatientAuth";

const PortalAuthGate = () => {
  const { isAuthenticated, isLoading } = usePatientAuth();
  const location = useLocation();

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

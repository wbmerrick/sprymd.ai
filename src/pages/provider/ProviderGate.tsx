import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useIdleTimeout, DEFAULT_IDLE_TIMEOUT_MS } from "@/hooks/useIdleTimeout";
import { logAuditEvent } from "@/lib/audit";
import {
  getProviderAuthMode,
  getProviderIdentity,
  isProviderAuthenticated,
  signOutProvider,
  verifyProviderSession,
} from "@/lib/provider-auth";
import ProviderLogin from "./ProviderLogin";

export interface ProviderOutletContext {
  signOut: () => void;
}

const logProviderLogin = (mode: string) => {
  logAuditEvent("", "provider_login", {
    actor: getProviderIdentity().name,
    actorRole: "provider",
    metadata: { mode },
  });
};

const ProviderGate = () => {
  const mode = getProviderAuthMode();
  const [authenticated, setAuthenticated] = useState(isProviderAuthenticated());
  const [verifying, setVerifying] = useState(mode === "supabase" && !isProviderAuthenticated());
  const [notice, setNotice] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Supabase mode: on magic-link return (or an existing Supabase session),
  // confirm the account has the provider role before opening the gate.
  useEffect(() => {
    if (mode !== "supabase" || authenticated) return;

    let cancelled = false;
    setVerifying(true);
    void verifyProviderSession().then(({ ok, error }) => {
      if (cancelled) return;
      if (ok) {
        logProviderLogin(mode);
        setNotice(null);
        setAuthenticated(true);
      } else if (error) {
        setVerifyError(error);
      }
      setVerifying(false);
    });

    return () => {
      cancelled = true;
    };
  }, [mode, authenticated]);

  const handleTimeout = useCallback(() => {
    signOutProvider();
    setAuthenticated(false);
    setNotice("You were signed out due to inactivity.");
  }, []);

  useIdleTimeout({
    onTimeout: handleTimeout,
    timeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
    enabled: authenticated,
  });

  if (!authenticated) {
    if (verifying) {
      return (
        <main className="min-h-screen bg-off-white flex items-center justify-center pt-16">
          <p className="font-body text-muted-foreground">Verifying provider access…</p>
        </main>
      );
    }

    return (
      <ProviderLogin
        mode={mode}
        notice={notice}
        verifyError={verifyError}
        onAuthenticated={() => {
          // Code mode: the login form validated the access code.
          logProviderLogin(mode);
          setNotice(null);
          setVerifyError(null);
          setAuthenticated(true);
        }}
      />
    );
  }

  return (
    <Outlet
      context={{
        signOut: () => {
          setAuthenticated(false);
        },
      }}
    />
  );
};

export default ProviderGate;

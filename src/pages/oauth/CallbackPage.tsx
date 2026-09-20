import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { completeOemOAuth } from "@/connectors";
import { connectWearableDevice, getSignedInEmail, markWearableOAuthLinked } from "@/lib/patientCareStore";

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finishing OEM cloud link…");

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const err = params.get("error");
    if (err) {
      setMessage(`OEM authorization denied: ${err}`);
      return;
    }
    if (!code || !state) {
      setMessage("Missing OAuth code or state.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { connection, returnTo } = await completeOemOAuth({ code, state });
        const email = connection.email || getSignedInEmail();
        if (email) {
          connectWearableDevice(email, connection.deviceId);
          markWearableOAuthLinked(email, {
            providerId: connection.providerId,
            connector: connection.connector,
            deviceId: connection.deviceId,
            status: "connected",
            sandbox: connection.sandbox,
            connectedAt: connection.connectedAt,
            externalUserId: connection.externalUserId,
          });
        }
        if (!cancelled) navigate(returnTo || "/dashboard?oem=connected", { replace: true });
      } catch (e) {
        if (!cancelled) setMessage(e instanceof Error ? e.message : "OAuth callback failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0C] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121214] p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C89E67]">OAuth callback</p>
        <p className="mt-3 text-sm text-zinc-300">{message}</p>
      </div>
    </div>
  );
}

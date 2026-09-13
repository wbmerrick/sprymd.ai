import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { issueSandboxAuthCode, OEM_PROVIDERS, oauthCallbackUrl, type OemProviderId } from "@/connectors";

export default function OAuthAuthorizePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerId = (params.get("provider") || "generic_oem") as OemProviderId;
  const state = params.get("state") || "";
  const device = params.get("device") || "";
  const email = params.get("email") || "";
  const provider = useMemo(() => OEM_PROVIDERS[providerId], [providerId]);

  const approve = () => {
    if (!state || !provider) {
      setError("Missing OAuth state or provider.");
      return;
    }
    setBusy(true);
    try {
      const code = issueSandboxAuthCode(providerId);
      const cb = new URL(oauthCallbackUrl());
      cb.searchParams.set("code", code);
      cb.searchParams.set("state", state);
      window.location.assign(cb.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authorization failed");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0C] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#E87722]">OEM cloud OAuth</p>
        <h1 className="mt-2 text-2xl font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Connect {provider?.displayName || providerId}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          PeakMD requests access to sync vitals from your {provider?.displayName || "device"} cloud
          {email ? ` (${email})` : ""}.{device ? ` Device: ${device}.` : ""}
        </p>
        <ul className="mt-4 space-y-1 font-mono text-[11px] text-zinc-500">
          {(provider?.endpoints?.scopes || ["read:vitals"]).map((s) => (
            <li key={s}>· {s}</li>
          ))}
        </ul>
        {provider?.requiresNativeBridge ? (
          <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            This OEM normally uses a native mobile bridge. Sandbox consent still issues a cloud link for web sync.
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard?oem=denied", { replace: true })}
            className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:border-white/30"
          >
            Deny
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={approve}
            className="flex-1 rounded-lg bg-[#E87722] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Authorizing…" : "Allow sync"}
          </button>
        </div>
        <p className="mt-4 text-[11px] text-zinc-600">
          Without live OEM client credentials, PeakMD uses a secure sandbox OAuth flow that mirrors production. Set
          VITE_*_CLIENT_ID secrets to authorize against real OEM clouds.
        </p>
      </div>
    </div>
  );
}

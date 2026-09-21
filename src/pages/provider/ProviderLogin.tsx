import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  authenticateProvider,
  sendProviderOtp,
  type ProviderAuthMode,
} from "@/lib/provider-auth";

interface ProviderLoginProps {
  mode: ProviderAuthMode;
  onAuthenticated: () => void;
  /** Informational banner, e.g. after an inactivity sign-out. */
  notice?: string | null;
  /** Error from magic-link verification, e.g. a non-provider account. */
  verifyError?: string | null;
}

const inputClass =
  "w-full rounded-xl border-2 border-gray-light p-3 font-body text-foreground focus:outline-none focus:border-primary transition-colors";

const ProviderLogin = ({ mode, onAuthenticated, notice, verifyError }: ProviderLoginProps) => {
  const [accessCode, setAccessCode] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState("");

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateProvider(accessCode)) {
      onAuthenticated();
      return;
    }
    setError("Invalid access code.");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    setSending(true);
    const result = await sendProviderOtp(trimmed);
    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setLinkSent(true);
  };

  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center px-4 py-24">
      <div className="card-base max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-foreground text-2xl font-bold">Provider Console</h1>
            <p className="font-body text-muted-foreground text-sm">Dr. Merrick — review queue</p>
          </div>
        </div>

        {notice && (
          <p
            className="font-body text-sm text-foreground bg-primary/10 rounded-xl px-4 py-3 mb-6"
            role="status"
          >
            {notice}
          </p>
        )}

        {verifyError && (
          <p
            className="font-body text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3 mb-6"
            role="alert"
          >
            {verifyError}
          </p>
        )}

        {mode === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="access-code"
                className="font-body text-sm font-medium text-foreground block mb-1"
              >
                Access code
              </label>
              <input
                id="access-code"
                type="password"
                autoComplete="current-password"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError("");
                }}
                className={inputClass}
                placeholder="Enter provider access code"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full rounded-full">
              Sign in
            </Button>
          </form>
        )}

        {mode === "supabase" &&
          (linkSent ? (
            <div className="space-y-4">
              <p className="font-body text-sm text-green bg-green/10 rounded-xl px-4 py-3" role="status">
                Check your email for a secure sign-in link. It will bring you back to the
                provider console.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLinkSent(false);
                  setError("");
                }}
                className="font-body text-sm text-primary underline underline-offset-2"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void handleEmailSubmit(e)} className="space-y-4">
              <div>
                <label
                  htmlFor="provider-email"
                  className="font-body text-sm font-medium text-foreground block mb-1"
                >
                  Work email
                </label>
                <input
                  id="provider-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={inputClass}
                  placeholder="you@clinic.com"
                />
              </div>

              {error && (
                <p className="font-body text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full rounded-full" disabled={sending}>
                {sending ? "Sending link…" : "Email me a sign-in link"}
              </Button>

              <p className="font-body text-muted-foreground text-xs">
                Only accounts with the provider role can access the console.
              </p>
            </form>
          ))}

        {mode === "unconfigured" && (
          <div className="space-y-3">
            <h2 className="font-display text-foreground text-lg font-bold">
              Access not configured
            </h2>
            <p className="font-body text-muted-foreground text-sm">
              Provider sign-in is disabled because no authentication method is configured for
              this deployment.
            </p>
            <p className="font-body text-muted-foreground text-sm">
              Set <code className="font-mono text-xs">VITE_PROVIDER_ACCESS_CODE</code> for
              access-code sign-in, or configure Supabase (
              <code className="font-mono text-xs">VITE_SUPABASE_URL</code> and{" "}
              <code className="font-mono text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code>) for
              email sign-in with provider accounts.
            </p>
          </div>
        )}

        <p className="font-body text-muted-foreground text-xs mt-6 text-center">
          Authorized clinical staff only. All access is logged.
        </p>
      </div>
    </main>
  );
};

export default ProviderLogin;

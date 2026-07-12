import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { readStoredSessionId } from "@/lib/intake/persist";

const PatientLogin = () => {
  const { isAuthenticated, isLoading, isDemoMode, signInWithEmail } = usePatientAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/portal";

  if (isLoading) {
    return (
      <main className="min-h-screen bg-off-white flex items-center justify-center pt-16">
        <p className="font-body text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      setSubmitting(false);
      return;
    }

    const result = await signInWithEmail(trimmed);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (isDemoMode) {
      window.location.href = from;
      return;
    }

    setMessage("Check your email for a secure sign-in link.");
  };

  const hasSession = Boolean(readStoredSessionId());

  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center px-4 py-24">
      <AnimatedSection>
        <div className="card-base shadow-xl max-w-[480px] w-full p-8 md:p-10">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-foreground text-2xl md:text-3xl font-bold mb-2">
            Patient Login
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            {isDemoMode
              ? "Enter the email you used at checkout to access your care dashboard."
              : "We'll send a secure magic link to your email — no password needed."}
          </p>

          {isDemoMode && hasSession && (
            <p className="font-body text-sm text-green bg-green/10 rounded-xl px-4 py-3 mb-6">
              Demo mode: your visit session is ready. Sign in to view your care status.
            </p>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label htmlFor="patient-email" className="font-body text-foreground text-sm font-medium mb-1 block">
                Email
              </label>
              <input
                id="patient-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="font-body text-destructive text-sm" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="font-body text-green text-sm" role="status">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-60"
            >
              {submitting ? "Signing in…" : isDemoMode ? "Access My Care →" : "Send Sign-In Link →"}
            </button>
          </form>

          <p className="font-body text-muted-foreground text-xs mt-6 text-center">
            🔒 HIPAA-secure portal. Your health information is encrypted.
          </p>
        </div>
      </AnimatedSection>
    </main>
  );
};

export default PatientLogin;

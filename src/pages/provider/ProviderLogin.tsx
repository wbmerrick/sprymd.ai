import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authenticateProvider } from "@/lib/provider-auth";

interface ProviderLoginProps {
  onAuthenticated: () => void;
}

const ProviderLogin = ({ onAuthenticated }: ProviderLoginProps) => {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateProvider(accessCode)) {
      onAuthenticated();
      return;
    }
    setError("Invalid access code.");
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="access-code" className="font-body text-sm font-medium text-foreground block mb-1">
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
              className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-foreground focus:outline-none focus:border-primary transition-colors"
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

        <p className="font-body text-muted-foreground text-xs mt-6 text-center">
          Authorized clinical staff only. All access is logged.
        </p>
      </div>
    </main>
  );
};

export default ProviderLogin;

import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { trackConversion } from "@/lib/conversionTrack";
import { loadCheckoutSelection } from "@/lib/intakeFlow";
import { ensureAccountShell } from "@/lib/patientCareStore";

type SessionLookup = {
  appointmentId?: string;
  visitPath?: string;
  status?: string;
};

const MAX_LOOKUP_ATTEMPTS = 4;
const LOOKUP_RETRY_MS = 1500;
const GUEST_CHECKOUT_EMAIL_KEY = "sprymd_guest_checkout_email";

async function fetchSessionLookup(input: {
  sessionId?: string | null;
  appointmentId?: string | null;
}): Promise<SessionLookup | null> {
  const qs = new URLSearchParams();
  if (input.sessionId) qs.set("session_id", input.sessionId);
  if (input.appointmentId) qs.set("appointment_id", input.appointmentId);
  if (![...qs.keys()].length) return null;
  const res = await fetch(`/api/checkout/session?${qs.toString()}`);
  if (!res.ok) return null;
  return (await res.json()) as SessionLookup;
}

function rememberGuestCheckoutEmail() {
  try {
    const selection = loadCheckoutSelection();
    const email = selection?.email?.trim().toLowerCase();
    if (!email) return;
    localStorage.setItem(GUEST_CHECKOUT_EMAIL_KEY, email);
    ensureAccountShell(email);
  } catch {
    /* ignore */
  }
}

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const appointmentFromUrl = params.get("appointment_id");
  const [lookup, setLookup] = useState<SessionLookup | null>(
    appointmentFromUrl
      ? { appointmentId: appointmentFromUrl, visitPath: `/visit/${appointmentFromUrl}` }
      : null,
  );
  const [confirming, setConfirming] = useState(Boolean(sessionId || appointmentFromUrl));
  const tracked = useRef(false);

  useEffect(() => {
    if (!sessionId && !appointmentFromUrl) {
      setConfirming(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setConfirming(true);
      try {
        for (let attempt = 0; attempt < MAX_LOOKUP_ATTEMPTS; attempt++) {
          const data = await fetchSessionLookup({
            sessionId,
            appointmentId: appointmentFromUrl,
          });
          if (cancelled) return;
          if (data) {
            setLookup(data);
            if (data.status !== "awaiting_payment") break;
          }
          if (attempt < MAX_LOOKUP_ATTEMPTS - 1) {
            await new Promise((r) => setTimeout(r, LOOKUP_RETRY_MS));
          }
        }
      } catch {
        /* keep fallback CTA */
      } finally {
        if (!cancelled) setConfirming(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, appointmentFromUrl]);

  useEffect(() => {
    if (tracked.current) return;
    if (confirming) return;
    if (lookup?.status === "awaiting_payment") return;
    // Fire once when we believe payment cleared (or URL-only success with no status).
    if (!sessionId && !appointmentFromUrl) return;
    tracked.current = true;
    rememberGuestCheckoutEmail();
    const selection = loadCheckoutSelection();
    trackConversion("checkout_completed", {
      session_id: sessionId,
      appointment_id: lookup?.appointmentId || appointmentFromUrl,
      condition_id: selection?.conditionId,
      treatment_id: selection?.treatmentId,
      status: lookup?.status || "unknown",
    });
  }, [confirming, lookup, sessionId, appointmentFromUrl]);

  const visitPath =
    lookup?.visitPath ||
    (lookup?.appointmentId ? `/visit/${lookup.appointmentId}` : null) ||
    (appointmentFromUrl ? `/visit/${appointmentFromUrl}` : null);
  const stillAwaiting = lookup?.status === "awaiting_payment";
  const paid = lookup?.status === "paid" || (!confirming && !stillAwaiting && Boolean(sessionId || appointmentFromUrl));

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <AnimatedSection>
          <div className="card-base shadow-xl max-w-[560px] w-full p-8 md:p-12 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-green mx-auto flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-navy text-3xl md:text-4xl font-bold mb-2">
              Payment successful
            </h1>
            <p className="font-body text-muted-foreground text-lg mb-6">
              Thank you. Your <strong>visit fee</strong> has been received
              {paid ? " and confirmed" : ""}. A Tennessee-licensed clinician will
              review your intake asynchronously — medication is only prescribed
              (and billed) if clinically appropriate. You will get a confirmation email shortly.
            </p>
            {confirming && (
              <p className="font-body text-sm text-muted-foreground mb-4">
                Confirming payment with Stripe…
              </p>
            )}
            {!confirming && stillAwaiting && (
              <p className="font-body text-sm text-amber-800/90 mb-4">
                Payment is still confirming. Your chart review unlocks as soon as Stripe finishes.
              </p>
            )}
            {sessionId && (
              <p className="font-body text-xs text-muted-foreground mb-8 break-all">
                Session: {sessionId}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/?auth=1" className="btn-primary text-center">
                Create your account
              </Link>
              {visitPath && (
                <Link to={visitPath} className="font-body text-sm text-navy underline underline-offset-4 self-center">
                  Visit room (if scheduled)
                </Link>
              )}
            </div>
            <p className="font-body text-xs text-muted-foreground mt-6">
              Questions? Email{" "}
              <a className="underline" href="mailto:support@sprymd.ai">support@sprymd.ai</a>
            </p>
          </div>
        </AnimatedSection>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;

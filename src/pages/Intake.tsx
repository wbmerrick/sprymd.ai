import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IntakeQuestionnaire from "@/components/intake/IntakeQuestionnaire";
import { saveGuestIntakeDraft } from "@/lib/guestIntakeSubmit";
import type { IntakeDraft, SaveResult } from "@/lib/clinicalDrafts";

const IntakePage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = params.get("appointmentId") || undefined;
  const sessionId = params.get("session_id") || params.get("sessionId") || "";
  const postPay = Boolean(appointmentId && sessionId.startsWith("cs_"));

  async function saveDraft(draft: IntakeDraft): Promise<SaveResult> {
    if (postPay) {
      return saveGuestIntakeDraft(draft, sessionId);
    }
    const { saveIntakeDraft } = await import("@/lib/clinicalDrafts");
    return saveIntakeDraft(draft);
  }

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="section-container max-w-3xl">
          {postPay && (
            <div className="mb-6 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-navy">
              Payment received. Complete this intake so your clinician can review
              your case — answers sync to your chart automatically.
            </div>
          )}
          <IntakeQuestionnaire
            appointmentId={appointmentId}
            saveDraft={saveDraft}
            onSubmitted={() =>
              navigate(
                postPay
                  ? `/checkout/success?session_id=${encodeURIComponent(sessionId)}&appointment_id=${encodeURIComponent(appointmentId!)}&intake=1`
                  : "/checkout",
              )
            }
          />
          <p className="font-body text-sm text-center text-muted-foreground mt-8">
            {postPay ? (
              <Link
                to={`/checkout/success?session_id=${encodeURIComponent(sessionId)}&appointment_id=${encodeURIComponent(appointmentId!)}`}
                className="underline underline-offset-4"
              >
                Back to payment confirmation
              </Link>
            ) : (
              <Link to="/checkout" className="underline underline-offset-4">
                Continue to payment
              </Link>
            )}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IntakePage;

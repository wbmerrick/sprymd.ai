import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IntakeQuestionnaire from "@/components/intake/IntakeQuestionnaire";

const IntakePage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = params.get("appointmentId") || undefined;

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="section-container max-w-3xl">
          <IntakeQuestionnaire
            appointmentId={appointmentId}
            onSubmitted={() => navigate("/checkout")}
          />
          <p className="font-body text-sm text-center text-muted-foreground mt-8">
            <Link to="/checkout" className="underline underline-offset-4">
              Continue to payment
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IntakePage;

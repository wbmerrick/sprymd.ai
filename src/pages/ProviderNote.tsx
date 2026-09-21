import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SoapNoteEditor from "@/components/clinical/SoapNoteEditor";

const ProviderNotePage = () => {
  const [params] = useSearchParams();
  const appointmentId = params.get("appointmentId") || "unassigned";

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="section-container max-w-5xl">
          <SoapNoteEditor appointmentId={appointmentId} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderNotePage;

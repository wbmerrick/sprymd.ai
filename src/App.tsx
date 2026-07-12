import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Quiz from "./pages/Quiz";
import Checkout from "./pages/Checkout";
import Confirmed from "./pages/Confirmed";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Trust from "./pages/Trust";
import NPP from "./pages/NPP";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PortalShell from "@/components/PortalShell";
import PatientLogin from "./pages/portal/PatientLogin";
import PortalAuthGate from "./pages/portal/PortalAuthGate";
import PatientDashboard from "./pages/portal/PatientDashboard";
import Messages from "./pages/portal/Messages";
import RefillRequest from "./pages/portal/RefillRequest";
import ProviderGate from "./pages/provider/ProviderGate";
import ReviewQueue from "./pages/provider/ReviewQueue";
import CaseDetail from "./pages/provider/CaseDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmed" element={<Confirmed />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/npp" element={<NPP />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/portal/login" element={<PatientLogin />} />
          <Route path="/portal" element={<PortalAuthGate />}>
            <Route element={<PortalShell />}>
              <Route index element={<PatientDashboard />} />
              <Route path="messages" element={<Messages />} />
              <Route path="refill" element={<RefillRequest />} />
            </Route>
          </Route>
          <Route path="/provider" element={<ProviderGate />}>
            <Route index element={<ReviewQueue />} />
            <Route path="case/:id" element={<CaseDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// @ts-ignore - JSX single-file marketing app
import SpryApp from "./SpryApp.jsx";
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardHomePage from "@/pages/dashboard/HomePage";
import GoalsPage from "@/pages/dashboard/GoalsPage";
import TreatmentDetailPage from "@/pages/dashboard/TreatmentDetailPage";
import SupportPage from "@/pages/dashboard/SupportPage";
import OrdersPage from "@/pages/dashboard/OrdersPage";
import SubscriptionsPage from "@/pages/dashboard/SubscriptionsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NPP from "@/pages/NPP";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import CashPayCheckout from "@/pages/CashPayCheckout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import IntakePage from "@/pages/Intake";
import ProviderNotePage from "@/pages/ProviderNote";
import VisitRoomPage from "@/pages/VisitRoom";
import OpsLayout from "@/pages/ops/OpsLayout";
import OpsQueuePage from "@/pages/ops/OpsQueuePage";
import OpsAppointmentPage from "@/pages/ops/OpsAppointmentPage";
import OAuthAuthorizePage from "@/pages/oauth/AuthorizePage";
import OAuthCallbackPage from "@/pages/oauth/CallbackPage";
import { FEATURES } from "@/config/features";

const queryClient = new QueryClient();

/** SPA route awareness for Vercel Speed Insights (Vite/React, not Next.js). */
function AppSpeedInsights() {
  const { pathname } = useLocation();
  return <SpeedInsights route={pathname} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppSpeedInsights />
        <Routes>
          <Route path="/" element={<SpryApp />} />
          {/* Legacy CTA target (Navbar/About/FAQ) — opens the care options on the homepage. */}
          <Route path="/quiz" element={<Navigate to="/?view=start" replace />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="goals/:treatmentId" element={<TreatmentDetailPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/npp" element={<NPP />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<CashPayCheckout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/intake" element={<IntakePage />} />
          <Route path="/provider/notes" element={<ProviderNotePage />} />
          <Route path="/visit/:appointmentId" element={<VisitRoomPage />} />
          <Route path="/ops" element={<OpsLayout />}>
            <Route index element={<OpsQueuePage />} />
            <Route path=":appointmentId" element={<OpsAppointmentPage />} />
          </Route>
          {FEATURES.enableDeviceDashboard ? (
            <>
              <Route path="/oauth/authorize" element={<OAuthAuthorizePage />} />
              <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
            </>
          ) : (
            <>
              <Route path="/oauth/authorize" element={<Navigate to="/dashboard" replace />} />
              <Route path="/oauth/callback" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
          <Route path="*" element={<SpryApp />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

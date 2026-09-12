import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import OAuthAuthorizePage from "@/pages/oauth/AuthorizePage";
import OAuthCallbackPage from "@/pages/oauth/CallbackPage";
import { FEATURES } from "@/config/features";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SpryApp />} />
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

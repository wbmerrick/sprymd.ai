import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import RouteSeo from "@/components/RouteSeo";
import RouteFallback from "@/components/RouteFallback";
import SkipToContent from "@/components/SkipToContent";
import SpryApp from "./SpryApp.jsx";
import { FEATURES } from "@/config/features";

// Everything except the landing experience is code-split so the homepage
// only ships what it needs (the dashboard, legal pages, checkout, etc. load on demand).
const DashboardLayout = lazy(() => import("@/pages/dashboard/DashboardLayout"));
const DashboardHomePage = lazy(() => import("@/pages/dashboard/HomePage"));
const GoalsPage = lazy(() => import("@/pages/dashboard/GoalsPage"));
const TreatmentDetailPage = lazy(() => import("@/pages/dashboard/TreatmentDetailPage"));
const SupportPage = lazy(() => import("@/pages/dashboard/SupportPage"));
const OrdersPage = lazy(() => import("@/pages/dashboard/OrdersPage"));
const SubscriptionsPage = lazy(() => import("@/pages/dashboard/SubscriptionsPage"));
const ProfilePage = lazy(() => import("@/pages/dashboard/ProfilePage"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const NPP = lazy(() => import("@/pages/NPP"));
const About = lazy(() => import("@/pages/About"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Contact = lazy(() => import("@/pages/Contact"));
const CashPayCheckout = lazy(() => import("@/pages/CashPayCheckout"));
const CheckoutSuccess = lazy(() => import("@/pages/CheckoutSuccess"));
const IntakePage = lazy(() => import("@/pages/Intake"));
const ProviderNotePage = lazy(() => import("@/pages/ProviderNote"));
const VisitRoomPage = lazy(() => import("@/pages/VisitRoom"));
const OAuthAuthorizePage = lazy(() => import("@/pages/oauth/AuthorizePage"));
const OAuthCallbackPage = lazy(() => import("@/pages/oauth/CallbackPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppSpeedInsights />
        <SkipToContent />
        <RouteSeo />
        <Suspense fallback={<RouteFallback />}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

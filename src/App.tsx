import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="*" element={<SpryApp />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

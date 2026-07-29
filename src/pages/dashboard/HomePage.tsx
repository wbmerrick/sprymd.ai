import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { NotificationsFeed } from "@/components/dashboard/NotificationsFeed";
import { CurrentManagement } from "@/components/dashboard/CurrentManagement";
import { UpcomingShipments } from "@/components/dashboard/UpcomingShipments";
import { WearableReadings } from "@/components/dashboard/WearableReadings";
import { QuickLinksFooter } from "@/components/dashboard/QuickLinksFooter";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";

export default function DashboardHomePage() {
  const {
    user,
    notifications,
    activeTreatments,
    shipments,
    wearableReadings,
    dismissNotification,
    clearAllNotifications,
  } = useDashboard();

  return (
    <div className="space-y-10">
      <GreetingHeader name={user.name} />
      <NotificationsFeed
        items={notifications}
        onClear={clearAllNotifications}
        onDismiss={dismissNotification}
      />
      <CurrentManagement treatments={activeTreatments} />
      <UpcomingShipments shipments={shipments} />
      <WearableReadings readings={wearableReadings || []} />
      <QuickLinksFooter />
    </div>
  );
}

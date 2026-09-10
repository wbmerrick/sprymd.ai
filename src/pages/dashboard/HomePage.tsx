import { NotificationsFeed } from "@/components/dashboard/NotificationsFeed";
import { QuickLinksFooter } from "@/components/dashboard/QuickLinksFooter";
import { ClinicalTerminal } from "@/components/dashboard/pro/ClinicalTerminal";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";

export default function DashboardHomePage() {
  const {
    notifications,
    activeTreatments,
    shipments,
    wearableDevices,
    wearableReadings,
    bodyProfile,
    bodyGoals,
    dismissNotification,
    clearAllNotifications,
    setWearableSyncMode,
    syncWearable,
    saveWearableReading,
    importWearableFile,
    updateBody,
    saveBodyGoal,
    dashboardLayout,
    connectDevice,
    registerCustomDevice,
    saveDashboardLayout,
  } = useDashboard();

  return (
    <div className="space-y-6">
      <ClinicalTerminal
        wearableDevices={wearableDevices || []}
        wearableReadings={wearableReadings || []}
        bodyProfile={bodyProfile}
        bodyGoals={bodyGoals || []}
        activeTreatments={activeTreatments}
        shipments={shipments}
        setWearableSyncMode={setWearableSyncMode}
        syncWearable={syncWearable}
        saveWearableReading={saveWearableReading}
        importWearableFile={importWearableFile}
        updateBody={updateBody}
        saveBodyGoal={saveBodyGoal}
        dashboardLayout={dashboardLayout}
        connectDevice={connectDevice}
        registerCustomDevice={registerCustomDevice}
        saveDashboardLayout={saveDashboardLayout}
      />
      <NotificationsFeed
        items={notifications}
        onClear={clearAllNotifications}
        onDismiss={dismissNotification}
      />
      <QuickLinksFooter />
    </div>
  );
}

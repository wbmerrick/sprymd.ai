import { NotificationsFeed } from "@/components/dashboard/NotificationsFeed";
import { QuickLinksFooter } from "@/components/dashboard/QuickLinksFooter";
import { CurrentManagement } from "@/components/dashboard/CurrentManagement";
import { UpcomingShipments } from "@/components/dashboard/UpcomingShipments";
import { ClinicalTerminal } from "@/components/dashboard/pro/ClinicalTerminal";
import { ClinicalReviewQueue } from "@/components/dashboard/pro/ClinicalReviewQueue";
import { FEATURES } from "@/config/features";
import { useDashboard } from "@/pages/dashboard/DashboardLayout";

function CareHome() {
  const {
    notifications,
    activeTreatments,
    shipments,
    clinicalCases,
    email,
    refresh,
    dismissNotification,
    clearAllNotifications,
  } = useDashboard();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">Care Desk</p>
        <h1 className="text-2xl font-semibold text-white md:text-3xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Your care at a glance
        </h1>
        <p className="text-sm text-zinc-500">
          Treatments, prescriptions, shipments, and clinician review for your SpryMD account.
        </p>
      </header>

      {/* Clinician Review & Intake Queue */}
      <ClinicalReviewQueue
        clinicalCases={clinicalCases || []}
        userEmail={email || undefined}
        onActionComplete={refresh}
      />

      <CurrentManagement treatments={activeTreatments} />
      <UpcomingShipments shipments={shipments} />
      <NotificationsFeed
        items={notifications}
        onClear={clearAllNotifications}
        onDismiss={dismissNotification}
      />
      <QuickLinksFooter />
    </div>
  );
}

function DeviceDashboardHome() {
  const {
    notifications,
    activeTreatments,
    shipments,
    wearableDevices,
    wearableReadings,
    bodyProfile,
    bodyGoals,
    clinicalCases,
    email,
    refresh,
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
      {/* Clinician Review & Intake Queue */}
      <ClinicalReviewQueue
        clinicalCases={clinicalCases || []}
        userEmail={email || undefined}
        onActionComplete={refresh}
      />

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

export default function DashboardHomePage() {
  return FEATURES.enableDeviceDashboard ? <DeviceDashboardHome /> : <CareHome />;
}

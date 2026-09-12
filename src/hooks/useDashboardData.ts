import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BodyGoal,
  BodyGoalMetric,
  BodyProfile,
  DashboardData,
  NotificationItem,
  Subscription,
  Treatment,
  TreatmentStatus,
  WearableKind,
  WearableReading,
  WearableSyncMode,
} from "@/types/dashboard";
import { connectorNeedsOauth, startOemOAuth } from "@/connectors";
import {
  buildDashboardForEmail,
  clearCareNotifications,
  deleteBodyGoal,
  dismissCareNotification,
  emptyBodyProfile,
  getSignedInEmail,
  importWearableUpload,
  recordWearableReading,
  setWearableEnabled,
  setWearableSyncMode,
  syncWearableDevice,
  syncWearableDeviceFromCloud,
  toggleCareAutoship,
  unlockWearableDevice,
  connectWearableDevice,
  registerCustomWearable,
  saveDashboardLayout,
  updateCareProfile,
  updateVitalsProfile,
  upsertBodyGoal,
} from "@/lib/patientCareStore";
import { restoreCustomerSession } from "@/lib/customerAccounts";
import { defaultWearableDevices } from "@/data/wearables";
import { subscribeVitalsEvents } from "@/lib/vitalsBus";
import { useWearableStream } from "@/hooks/useWearableStream";

const STATUS_PRIORITY: Record<TreatmentStatus, number> = {
  expiring_soon: 0,
  pending: 1,
  active: 2,
  inactive: 3,
};

export function sortTreatmentsByStatus(treatments: Treatment[]): Treatment[] {
  return [...treatments].sort(
    (a, b) =>
      STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] ||
      a.medicationName.localeCompare(b.medicationName),
  );
}

const emptyDashboard = (): DashboardData => ({
  user: { id: "", name: "", email: "", avatarInitials: "" },
  treatments: [],
  notifications: [],
  shipments: [],
  subscriptions: [],
  messages: [],
  transactions: [],
  supportTopics: [],
  wearableDevices: defaultWearableDevices(),
  wearableReadings: [],
  bodyProfile: emptyBodyProfile(),
  bodyGoals: [],
});

export function useDashboardData() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await restoreCustomerSession();
      if (cancelled) return;
      setEmail(session?.email || getSignedInEmail());
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const data: DashboardData = useMemo(() => {
    void tick;
    if (!email) return emptyDashboard();
    return buildDashboardForEmail(email) || emptyDashboard();
  }, [email, tick]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(data.notifications);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(data.subscriptions);

  useEffect(() => {
    setNotifications(data.notifications);
    setSubscriptions(data.subscriptions);
  }, [data.notifications, data.subscriptions]);

  useEffect(() => {
    return subscribeVitalsEvents(() => refresh());
  }, [refresh]);

  useWearableStream(email, data.wearableDevices, refresh);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.dismissed).length,
    [notifications],
  );

  const activeTreatments = useMemo(
    () =>
      sortTreatmentsByStatus(
        data.treatments.filter(
          (t) => t.status === "active" || t.status === "expiring_soon" || t.status === "pending",
        ),
      ),
    [data.treatments],
  );

  const dismissNotification = useCallback(
    (id: string) => {
      if (!email) return;
      const care = dismissCareNotification(email, id);
      setNotifications(care.notifications);
      refresh();
    },
    [email, refresh],
  );

  const clearAllNotifications = useCallback(() => {
    if (!email) return;
    const care = clearCareNotifications(email);
    setNotifications(care.notifications);
    refresh();
  }, [email, refresh]);

  const toggleAutoship = useCallback(
    (subscriptionId: string, enabled: boolean) => {
      if (!email) return;
      const care = toggleCareAutoship(email, subscriptionId, enabled);
      setSubscriptions(care.subscriptions);
      refresh();
    },
    [email, refresh],
  );

  const getTreatment = useCallback(
    (treatmentId: string) => data.treatments.find((t) => t.id === treatmentId),
    [data.treatments],
  );

  const updateProfile = useCallback(
    (patch: { name?: string; phone?: string; dob?: string; address?: Record<string, string> }) => {
      if (!email) return null;
      const next = updateCareProfile(email, patch);
      refresh();
      return next;
    },
    [email, refresh],
  );

  const setWearableMode = useCallback(
    (deviceId: WearableKind, syncMode: WearableSyncMode) => {
      if (!email) return;
      setWearableSyncMode(email, deviceId, syncMode);
      refresh();
    },
    [email, refresh],
  );

  const syncWearable = useCallback(
    async (deviceId: WearableKind) => {
      if (!email) return;
      await syncWearableDeviceFromCloud(email, deviceId);
      refresh();
    },
    [email, refresh],
  );

  const saveWearableReading = useCallback(
    (input: {
      deviceId: WearableKind;
      metric: string;
      value: number;
      unit: string;
      secondaryValue?: number;
      secondaryUnit?: string;
      note?: string;
      source?: WearableReading["source"];
      recordedAt?: string;
    }) => {
      if (!email) return;
      recordWearableReading(email, input);
      refresh();
    },
    [email, refresh],
  );

  const importWearableFile = useCallback(
    (deviceId: WearableKind, fileName: string, text: string) => {
      if (!email) return;
      importWearableUpload(email, deviceId, fileName, text);
      refresh();
    },
    [email, refresh],
  );

  const updateBody = useCallback(
    (patch: Partial<Pick<BodyProfile, "heightCm" | "weightLb" | "targetWeightLb">>) => {
      if (!email) return;
      updateVitalsProfile(email, patch);
      refresh();
    },
    [email, refresh],
  );

  const saveBodyGoal = useCallback(
    (input: {
      id?: string;
      title: string;
      metric: BodyGoalMetric;
      targetValue: number;
      unit: string;
      treatmentId?: string;
      deviceId?: WearableKind;
      status?: BodyGoal["status"];
    }) => {
      if (!email) return;
      upsertBodyGoal(email, input);
      refresh();
    },
    [email, refresh],
  );

  const removeBodyGoal = useCallback(
    (goalId: string) => {
      if (!email) return;
      deleteBodyGoal(email, goalId);
      refresh();
    },
    [email, refresh],
  );

  const unlockDevice = useCallback(
    (kind: WearableKind) => {
      if (!email) return;
      unlockWearableDevice(email, kind);
      refresh();
    },
    [email, refresh],
  );

  const toggleDeviceEnabled = useCallback(
    (kind: WearableKind, enabled: boolean) => {
      if (!email) return;
      setWearableEnabled(email, kind, enabled);
      refresh();
    },
    [email, refresh],
  );


  const connectDevice = useCallback(
    async (kind: WearableKind) => {
      if (!email) return;
      const device =
        data.wearableDevices.find((d) => d.id === kind) ||
        (await import("@/data/wearables")).WEARABLE_CATALOG.find((d) => d.id === kind);
      connectWearableDevice(email, kind);
      refresh();
      if (device && connectorNeedsOauth(device.connector)) {
        await startOemOAuth({
          email,
          deviceId: kind,
          connector: device.connector,
          returnTo: "/dashboard?oem=connected",
        });
        return;
      }
    },
    [email, refresh, data.wearableDevices],
  );

  const registerCustomDevice = useCallback(
    (input: { brand: string; name: string; metrics?: string[] }) => {
      if (!email) return;
      registerCustomWearable(email, input);
      refresh();
    },
    [email, refresh],
  );

  const updateDashboardLayout = useCallback(
    (patch: Partial<import("@/types/dashboard").DashboardLayoutConfig>) => {
      if (!email) return;
      saveDashboardLayout(email, patch);
      refresh();
    },
    [email, refresh],
  );

  return {
    ...data,
    notifications,
    subscriptions,
    activeTreatments,
    unreadCount,
    dismissNotification,
    clearAllNotifications,
    toggleAutoship,
    getTreatment,
    updateProfile,
    setWearableSyncMode: setWearableMode,
    syncWearable,
    saveWearableReading,
    importWearableFile,
    updateBody,
    saveBodyGoal,
    removeBodyGoal,
    unlockDevice,
    toggleDeviceEnabled,
    connectDevice,
    registerCustomDevice,
    saveDashboardLayout: updateDashboardLayout,
    ready,
    isAuthenticated: !!email,
    email,
    refresh,
  };
}

export type UseDashboardDataReturn = ReturnType<typeof useDashboardData>;

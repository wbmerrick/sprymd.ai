import { useCallback, useMemo, useState } from "react";
import { mockDashboardData } from "@/data/dashboardMock";
import type {
  DashboardData,
  NotificationItem,
  Subscription,
  Treatment,
  TreatmentStatus,
} from "@/types/dashboard";

const STATUS_PRIORITY: Record<TreatmentStatus, number> = {
  expiring_soon: 0,
  pending: 1,
  active: 2,
  inactive: 3,
};

export function sortTreatmentsByStatus(treatments: Treatment[]): Treatment[] {
  return [...treatments].sort(
    (a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] || a.medicationName.localeCompare(b.medicationName),
  );
}

export function useDashboardData() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockDashboardData.notifications);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockDashboardData.subscriptions);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.dismissed).length,
    [notifications],
  );

  const activeTreatments = useMemo(
    () =>
      sortTreatmentsByStatus(
        mockDashboardData.treatments.filter((t) => t.status === "active" || t.status === "expiring_soon" || t.status === "pending"),
      ),
    [],
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dismissed: true })));
  }, []);

  const toggleAutoship = useCallback((subscriptionId: string, enabled: boolean) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subscriptionId ? { ...s, autoshipEnabled: enabled } : s)),
    );
  }, []);

  const getTreatment = useCallback(
    (treatmentId: string) => mockDashboardData.treatments.find((t) => t.id === treatmentId),
    [],
  );

  const data: DashboardData = useMemo(
    () => ({
      ...mockDashboardData,
      notifications,
      subscriptions,
    }),
    [notifications, subscriptions],
  );

  return {
    ...data,
    activeTreatments,
    unreadCount,
    dismissNotification,
    clearAllNotifications,
    toggleAutoship,
    getTreatment,
  };
}

export type UseDashboardDataReturn = ReturnType<typeof useDashboardData>;

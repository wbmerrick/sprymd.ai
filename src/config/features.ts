/**
 * Product feature gates.
 *
 * Shop (marketplace: supplements, devices, sleep stack) and the patient
 * device/wearables dashboard are built but not ready for launch.
 * Flip these to `true` when product is ready to ship them.
 */
export const FEATURES = {
  /** Marketplace, Shop nav, cart, supplements/devices/sleep stack pages. */
  enableShop: false,
  /** Clinical terminal, wearables toolbar, connect-device OAuth surfaces. */
  enableDeviceDashboard: false,
} as const;

export type FeatureFlags = typeof FEATURES;

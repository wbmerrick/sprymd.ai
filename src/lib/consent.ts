export type ConsentPreferences = {
  essential: true;
  analytics: boolean;
  decided: boolean;
  timestamp: string;
};

export const CONSENT_STORAGE_KEY = "sprymd_cookie_consent";
export const CONSENT_CHANGE_EVENT = "sprymd:consent-change";

const defaultPreferences = (): ConsentPreferences => ({
  essential: true,
  analytics: false,
  decided: false,
  timestamp: new Date().toISOString(),
});

export function getStoredConsent(): ConsentPreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.decided !== "boolean") {
      return null;
    }
    return { ...parsed, essential: true };
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  const stored = getStoredConsent();
  return stored?.decided === true && stored.analytics === true;
}

export function saveConsent(analytics: boolean): ConsentPreferences {
  const preferences: ConsentPreferences = {
    essential: true,
    analytics,
    decided: true,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: preferences }));
  return preferences;
}

export function getConsentOrDefault(): ConsentPreferences {
  return getStoredConsent() ?? defaultPreferences();
}

export function respectsGlobalPrivacyControl(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  );
}

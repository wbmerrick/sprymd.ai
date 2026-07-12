import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import {
  CONSENT_CHANGE_EVENT,
  getConsentOrDefault,
  getStoredConsent,
  respectsGlobalPrivacyControl,
  saveConsent,
  type ConsentPreferences,
} from "@/lib/consent";
import { disableAnalytics, initAnalytics } from "@/lib/analytics";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  const applyConsent = useCallback((analytics: boolean) => {
    saveConsent(analytics);
    if (analytics) {
      initAnalytics();
    } else {
      disableAnalytics();
    }
    setVisible(false);
    setShowSettings(false);
  }, []);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored?.decided) {
      setAnalyticsEnabled(stored.analytics);
      if (stored.analytics) initAnalytics();
      return;
    }

    const gpcOptOut = respectsGlobalPrivacyControl();
    setAnalyticsEnabled(!gpcOptOut);
    setVisible(true);
  }, []);

  useEffect(() => {
    const openSettings = () => {
      const current = getConsentOrDefault();
      setAnalyticsEnabled(current.analytics);
      setShowSettings(true);
      setVisible(true);
    };

    const onHashChange = () => {
      if (window.location.hash === "#cookie-preferences") openSettings();
    };

    const onConsentEvent = (event: Event) => {
      const detail = (event as CustomEvent<ConsentPreferences>).detail;
      setAnalyticsEnabled(detail.analytics);
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentEvent);
    if (window.location.hash === "#cookie-preferences") openSettings();

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentEvent);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
    >
      <div className="section-container max-w-4xl mx-auto rounded-2xl border border-gray-light bg-card shadow-2xl p-6 md:p-8">
        {!showSettings ? (
          <>
            <h2 className="font-display text-foreground text-lg font-semibold mb-2">
              Your privacy choices
            </h2>
            <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">
              We use essential cookies to operate SpryMD.ai. Analytics cookies (Google Tag Manager
              and/or Plausible) help us understand site performance and are only loaded after you
              opt in, as described in our{" "}
              <Link to="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>{" "}
              (Section 8 — Browser or Platform Controls). If your browser sends a Global Privacy
              Control signal, we default analytics to off.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => applyConsent(true)} className="btn-primary">
                Accept analytics
              </button>
              <button
                type="button"
                onClick={() => applyConsent(false)}
                className="btn-secondary"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="font-body text-sm text-primary underline"
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-foreground text-lg font-semibold mb-4">
              Cookie preferences
            </h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-light p-4">
                <div>
                  <p className="font-body text-foreground text-sm font-semibold">Essential</p>
                  <p className="font-body text-muted-foreground text-xs mt-1">
                    Required for security, session management, and consent storage. Always active.
                  </p>
                </div>
                <Switch checked disabled aria-readonly />
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-light p-4">
                <div>
                  <p className="font-body text-foreground text-sm font-semibold">Analytics</p>
                  <p className="font-body text-muted-foreground text-xs mt-1">
                    Optional usage measurement via GTM and/or Plausible. Not loaded until enabled.
                  </p>
                </div>
                <Switch
                  checked={analyticsEnabled}
                  onCheckedChange={setAnalyticsEnabled}
                  aria-label="Enable analytics cookies"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => applyConsent(analyticsEnabled)}
                className="btn-primary"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="font-body text-sm text-muted-foreground underline"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;

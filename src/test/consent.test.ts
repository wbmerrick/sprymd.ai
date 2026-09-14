import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  getConsentOrDefault,
  getStoredConsent,
  hasAnalyticsConsent,
  respectsGlobalPrivacyControl,
  saveConsent,
} from "@/lib/consent";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getStoredConsent", () => {
  it("returns null when nothing is stored", () => {
    expect(getStoredConsent()).toBeNull();
  });

  it("round-trips preferences saved with saveConsent", () => {
    saveConsent(true);
    const stored = getStoredConsent();
    expect(stored).toMatchObject({ essential: true, analytics: true, decided: true });
    expect(typeof stored?.timestamp).toBe("string");
  });

  it("round-trips an analytics opt-out", () => {
    saveConsent(false);
    expect(getStoredConsent()).toMatchObject({ essential: true, analytics: false, decided: true });
  });

  it("returns null for malformed JSON", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "{{{not json");
    expect(getStoredConsent()).toBeNull();
  });

  it("returns null when analytics is not a boolean", () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ essential: true, analytics: "yes", decided: true, timestamp: "t" }),
    );
    expect(getStoredConsent()).toBeNull();
  });

  it("returns null when decided is not a boolean", () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ essential: true, analytics: true, decided: "yep", timestamp: "t" }),
    );
    expect(getStoredConsent()).toBeNull();
  });

  it("forces essential to true even if the stored value tampered with it", () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ essential: false, analytics: true, decided: true, timestamp: "t" }),
    );
    expect(getStoredConsent()?.essential).toBe(true);
  });
});

describe("hasAnalyticsConsent", () => {
  it("is false when no decision has been made", () => {
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("is true after an analytics opt-in", () => {
    saveConsent(true);
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it("is false after a decided opt-out", () => {
    saveConsent(false);
    expect(hasAnalyticsConsent()).toBe(false);
  });
});

describe("saveConsent", () => {
  it("dispatches the consent-change event with the new preferences", () => {
    const listener = vi.fn();
    window.addEventListener(CONSENT_CHANGE_EVENT, listener);
    try {
      const saved = saveConsent(true);
      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toEqual(saved);
      expect(event.detail.analytics).toBe(true);
    } finally {
      window.removeEventListener(CONSENT_CHANGE_EVENT, listener);
    }
  });
});

describe("getConsentOrDefault", () => {
  it("returns an undecided, analytics-off default when nothing is stored", () => {
    expect(getConsentOrDefault()).toMatchObject({
      essential: true,
      analytics: false,
      decided: false,
    });
  });

  it("returns the stored preferences when a decision exists", () => {
    saveConsent(true);
    expect(getConsentOrDefault()).toMatchObject({ analytics: true, decided: true });
  });
});

describe("respectsGlobalPrivacyControl", () => {
  it("is false when the browser exposes no GPC signal", () => {
    expect(respectsGlobalPrivacyControl()).toBe(false);
  });

  it("is true when navigator.globalPrivacyControl is set", () => {
    Object.defineProperty(navigator, "globalPrivacyControl", {
      value: true,
      configurable: true,
    });
    try {
      expect(respectsGlobalPrivacyControl()).toBe(true);
    } finally {
      delete (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
    }
  });
});

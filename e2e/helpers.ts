import type { Page } from "@playwright/test";

/**
 * Pre-decide cookie consent before any page script runs so the consent
 * banner never overlays elements the smoke tests need to click.
 */
export const preDecideConsent = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "sprymd_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: false,
        decided: true,
        timestamp: new Date().toISOString(),
      }),
    );
  });
};

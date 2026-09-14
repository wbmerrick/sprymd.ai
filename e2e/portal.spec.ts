import { expect, test } from "@playwright/test";
import { preDecideConsent } from "./helpers";

test.beforeEach(async ({ page }) => {
  await preDecideConsent(page);
});

test("unauthenticated /portal redirects to the login form", async ({ page }) => {
  await page.goto("/portal");
  await expect(page).toHaveURL(/\/portal\/login/);
  await expect(page.locator('main input[type="email"]')).toBeVisible();
  await expect(page.locator('main button[type="submit"]')).toBeVisible();
});

test("login submit reaches the dashboard (demo) or a magic-link confirmation (live)", async ({
  page,
}) => {
  await page.goto("/portal/login");
  await page.locator('main input[type="email"]').fill("sprymd-e2e@example.com");
  await page.locator('main button[type="submit"]').click();

  // Demo mode signs straight in and lands on /portal; live mode sends a
  // Supabase magic link and shows a confirmation status message. Repeated
  // runs against the live project can hit Supabase's OTP rate limit, which
  // surfaces as an error alert — treat that specific case as a pass too.
  await expect
    .poll(
      async () => {
        const path = new URL(page.url()).pathname;
        if (path.startsWith("/portal") && !path.includes("login")) return "dashboard";
        if ((await page.locator('main [role="status"]').count()) > 0) return "magic-link";
        const alert = page.locator('main [role="alert"]');
        if ((await alert.count()) > 0) {
          const text = (await alert.first().innerText()).toLowerCase();
          if (/rate limit|too many|security purposes|after \d+ seconds/.test(text)) {
            return "rate-limited-by-live-supabase";
          }
        }
        return null;
      },
      {
        timeout: 20_000,
        message: "expected the portal dashboard (demo) or a magic-link confirmation (live)",
      },
    )
    .not.toBeNull();
});

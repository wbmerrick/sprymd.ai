import { expect, test } from "@playwright/test";
import { preDecideConsent } from "./helpers";

test.beforeEach(async ({ page }) => {
  await preDecideConsent(page);
});

test("home renders a top-level heading and a quiz CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('a[href="/quiz"]').first()).toBeVisible();
});

for (const path of ["/about", "/faq", "/contact"]) {
  test(`${path} loads with a visible heading`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
}

test("footer links to the legal pages", async ({ page }) => {
  await page.goto("/");
  for (const href of ["/terms", "/privacy", "/npp", "/trust"]) {
    await expect(page.locator(`footer a[href="${href}"]`).first()).toBeVisible();
  }
});

for (const path of ["/terms", "/privacy", "/npp", "/trust"]) {
  test(`legal page ${path} renders`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
}

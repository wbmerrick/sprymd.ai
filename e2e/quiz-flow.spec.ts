import { expect, test } from "@playwright/test";
import { preDecideConsent } from "./helpers";

/**
 * Smoke test for the intake quiz. Drives the flow structurally (no copy
 * assertions beyond the medically load-bearing "None of the above"):
 * fill any textarea, select "None of the above" on multi-selects, then click
 * the last enabled non-back button. Single-select options auto-advance.
 * Pass = the completion screen (checkout CTA) or the nitrate hard-stop
 * (a return-home link inside the quiz card) is reached.
 */
test("quiz can be driven from the home CTA to completion or a hard stop", async ({ page }) => {
  test.setTimeout(90_000);
  await preDecideConsent(page);
  await page.goto("/");
  await page.locator('a[href="/quiz"]').first().click();
  await expect(page).toHaveURL(/\/quiz/);

  const checkoutLink = page.locator('main a[href="/checkout"]');
  const hardStopLink = page.locator('main a[href="/"]');
  const reachedEnd = async () =>
    (await checkoutLink.count()) > 0 || (await hardStopLink.count()) > 0;

  for (let i = 0; i < 30 && !(await reachedEnd()); i++) {
    const textarea = page.locator("main textarea");
    if ((await textarea.count()) > 0 && !(await textarea.first().inputValue())) {
      await textarea.first().fill("None");
    }

    // Steps that gate Continue behind free-text input (e.g. email capture).
    const inputs = page.locator(
      'main input[type="email"], main input[type="text"], main input[type="tel"]',
    );
    for (let j = 0; j < (await inputs.count()); j++) {
      const input = inputs.nth(j);
      if (!(await input.inputValue())) {
        const type = await input.getAttribute("type");
        await input.fill(type === "email" ? "e2e-quiz@example.com" : "None");
      }
    }

    // Multi-select safety steps: pick "None of the above" to enable Continue.
    const noneOption = page
      .locator("main button:enabled")
      .filter({ hasText: "None of the above" });
    if ((await noneOption.count()) > 0) {
      await noneOption.first().click();
      await page.waitForTimeout(150);
    }

    const actionable = page
      .locator("main button:enabled")
      .filter({ hasNotText: /back/i })
      .filter({ hasNotText: "None of the above" });
    expect(await actionable.count(), `no actionable button on step iteration ${i}`).toBeGreaterThan(0);
    await actionable.last().click();

    // Single-select options auto-advance after 300ms, then the slide
    // animation takes another ~300ms; wait for both to settle so the next
    // iteration never re-clicks the outgoing step mid-animation.
    await page.waitForTimeout(900);
  }

  expect(await reachedEnd(), "expected the completion screen or the nitrate hard-stop").toBe(true);
});

import { chromium } from "@playwright/test";
import fs from "fs";

const out = "/opt/cursor/artifacts";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
await page.waitForSelector("text=Choose your visit");
await page.screenshot({ path: `${out}/cashpay_checkout_tiers.png` });

await page.click("text=Comprehensive Visit");
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/cashpay_checkout_tier_selected.png` });

await page.fill('input[type="email"]', "patient@example.com");
await page.fill('input[autocomplete="name"]', "Test Patient");
await page.screenshot({ path: `${out}/cashpay_checkout_form_filled.png` });

await page.click('button:has-text("Pay")');
await page.waitForTimeout(2000);
const alert = await page.locator('[role="alert"]').textContent().catch(() => null);
fs.writeFileSync(`${out}/cashpay_checkout_api_error.txt`, alert || "(no alert)");
await page.screenshot({ path: `${out}/cashpay_checkout_error_state.png` });

await page.goto(
  "http://localhost:8080/checkout/success?session_id=cs_test_demo123",
  { waitUntil: "networkidle" },
);
await page.waitForSelector("text=Payment successful");
await page.screenshot({ path: `${out}/cashpay_checkout_success.png` });

await browser.close();
console.log("screenshots_ok", JSON.stringify({ alert }));

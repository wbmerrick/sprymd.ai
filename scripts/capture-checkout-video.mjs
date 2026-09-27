import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  recordVideo: {
    dir: "/opt/cursor/artifacts",
    size: { width: 1280, height: 900 },
  },
});
const page = await context.newPage();
await page.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
await page.waitForSelector("text=Choose your visit");
await page.click("text=Protocol Start Visit");
await page.waitForTimeout(600);
await page.fill('input[type="email"]', "patient@example.com");
await page.fill('input[autocomplete="name"]', "Test Patient");
await page.waitForTimeout(400);
await page.click('button:has-text("Pay")');
await page.waitForTimeout(1200);
await page.goto(
  "http://localhost:8080/checkout/success?session_id=cs_test_demo123",
  { waitUntil: "networkidle" },
);
await page.waitForSelector("text=Payment successful");
await page.waitForTimeout(800);
await context.close();
await browser.close();
console.log("video_ok");

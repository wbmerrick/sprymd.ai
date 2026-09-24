import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:8080/visit/demo-visit?role=patient&name=Alex", {
  waitUntil: "networkidle",
});
await page.click('[data-testid="join-visit"]');
await page.waitForSelector('[data-testid="video-transport"]');
const transport = await page.locator('[data-testid="video-transport"]').innerText();
const controls = await page.locator('[data-testid="leave-visit"]').count();
if (!/local preview/i.test(transport) || !/sign in|not configured|preview stays/i.test(transport)) {
  throw new Error(`Unexpected video status: ${transport}`);
}
if (controls !== 1) throw new Error("Leave control missing after join");
await page.screenshot({
  path: "/opt/cursor/artifacts/telehealth_live_video_fallback.png",
  fullPage: true,
});
console.log(transport);
await browser.close();

import { chromium } from "@playwright/test";

const out = "/opt/cursor/artifacts";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
await page.locator("#physician").scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.locator("#physician").screenshot({ path: `${out}/founder_photo_complete.png` });
const img = page.locator('#physician img[alt*="Merrick"]');
const box = await img.boundingBox();
const natural = await img.evaluate((el) => ({
  nw: el.naturalWidth,
  nh: el.naturalHeight,
  cw: el.clientWidth,
  ch: el.clientHeight,
  fit: getComputedStyle(el).objectFit,
  ratio: getComputedStyle(el).aspectRatio,
}));
console.log(JSON.stringify({ box, natural }, null, 2));
await browser.close();

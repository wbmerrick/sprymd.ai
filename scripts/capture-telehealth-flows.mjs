import { chromium } from "@playwright/test";
import fs from "fs";

const out = "/opt/cursor/artifacts";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

async function shot(name) {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
}

await page.goto("http://localhost:8080/intake", { waitUntil: "networkidle" });
await page.waitForSelector("text=Visit intake");
await page.click('button:has-text("Erectile dysfunction")');
await page.waitForSelector("text=nitrates");
await shot("telehealth_intake_ed_followup");

await page.goto("http://localhost:8080/checkout", { waitUntil: "networkidle" });
await page.waitForSelector("text=Before payment");
await shot("telehealth_checkout_consent_blocked");
await page.check('label:has-text("cash-pay") input');
await page.check('label:has-text("clinical limitations") input');
await page.selectOption("#physical-state", "TN");
await page.waitForSelector("text=Licensed state confirmed");
await shot("telehealth_checkout_consent_ready");

await page.goto("http://localhost:8080/provider/notes?appointmentId=demo-visit", {
  waitUntil: "networkidle",
});
await page.waitForSelector("text=SOAP note");
await page.fill('textarea[placeholder*="What the patient reports"]', "Difficulty for six months.");
await page.waitForFunction(() => {
  const el = document.querySelector('[data-testid="soap-save-status"]');
  return el && /saved|chart|device/i.test(el.textContent || "");
});
await shot("telehealth_soap_autosave");

await page.goto("http://localhost:8080/visit/demo-visit?role=patient&name=Alex", {
  waitUntil: "networkidle",
});
await page.waitForSelector("text=SpryMD visit");
await shot("telehealth_visit_room_waiting");
await page.click('[data-testid="join-visit"]');
await page.waitForSelector('[data-testid="leave-visit"]');
await shot("telehealth_visit_room_joined");

await browser.close();
console.log("telehealth screenshots written to", out);

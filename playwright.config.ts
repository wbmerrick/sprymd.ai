import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke-level e2e config. The dev server runs in live-Supabase mode when
 * VITE_SUPABASE_* is set in .env and in localStorage demo mode otherwise;
 * specs are written to tolerate both.
 */
export default defineConfig({
  testDir: "e2e",
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://localhost:8080",
    // Vite cold-compiles pages on first navigation; give it room.
    navigationTimeout: 60_000,
    ...devices["Desktop Chrome"],
  },
  expect: { timeout: 10_000 },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run dev",
    port: 8080,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

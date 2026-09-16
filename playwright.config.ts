import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a production build.
 *
 *   npm run build && npm run test:e2e
 *
 * They write to the database (leads, clients, staff, plans), so they refuse to
 * run unless E2E_ALLOW_DB_WRITES=1 — point DATABASE_URL at a disposable test
 * database, never production. Staff credentials come from the E2E_* variables
 * (the accounts created by `npm run db:seed`).
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1, // shared database and rate limits
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The clinic and its clients are in India; date pickers render in the browser's zone.
    timezoneId: "Asia/Kolkata",
    locale: "en-IN",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

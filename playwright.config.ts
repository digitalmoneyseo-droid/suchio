import { defineConfig, devices } from "@playwright/test";
import { createHash } from "node:crypto";

const baseURL = "http://127.0.0.1:3101";
// Public test credential, passed only to the local Worker process.
const testAdminHash = createHash("sha256").update("e".repeat(64)).digest("hex");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL,
    locale: "de-DE",
    trace: "retain-on-failure",
  },
  webServer: [{
    command: `bunx wrangler d1 migrations apply AUDIT_DB --local --persist-to .wrangler/e2e-state && bunx wrangler dev --local --persist-to .wrangler/e2e-state --config dist/server/wrangler.json --env-file tests/fixtures/worker.vars --var AUDIT_ADMIN_PASSWORD_HASH:${testAdminHash} --port 3101 --inspector-port 9231 --log-level error`,
    env: { RESEND_API_KEY: "", CONTACT_EMAIL_TO: "", CONTACT_EMAIL_FROM: "", WRANGLER_SEND_METRICS: "false", WRANGLER_LOG_PATH: ".wrangler/e2e-worker.log" },
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
    timeout: 120_000,
  }],
  projects: [
    { name: "workers-chromium", use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3101" } },
    { name: "workers-firefox", testMatch: /cross-browser\.spec\.ts/, use: { ...devices["Desktop Firefox"], baseURL: "http://127.0.0.1:3101" } },
    { name: "workers-webkit", testMatch: /cross-browser\.spec\.ts/, use: { ...devices["Desktop Safari"], baseURL: "http://127.0.0.1:3101" } },
  ],
});

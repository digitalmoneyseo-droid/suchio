import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

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
    command: "bun --bun next start --port 3100",
    env: {
      RESEND_API_KEY: "",
      CONTACT_EMAIL_TO: "",
      CONTACT_EMAIL_FROM: "",
    },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  }, {
    command: "bunx wrangler dev --local --config dist/server/wrangler.json --env-file tests/fixtures/worker.vars --port 3101 --inspector-port 9231 --log-level error",
    env: { RESEND_API_KEY: "", CONTACT_EMAIL_TO: "", CONTACT_EMAIL_FROM: "", WRANGLER_SEND_METRICS: "false", WRANGLER_LOG_PATH: ".wrangler/e2e-worker.log" },
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
    timeout: 120_000,
  }],
  projects: [
    { name: "next-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "workers-chromium", use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3101" } },
    { name: "workers-firefox", testMatch: /cross-browser\.spec\.ts/, use: { ...devices["Desktop Firefox"], baseURL: "http://127.0.0.1:3101" } },
    { name: "workers-webkit", testMatch: /cross-browser\.spec\.ts/, use: { ...devices["Desktop Safari"], baseURL: "http://127.0.0.1:3101" } },
  ],
});

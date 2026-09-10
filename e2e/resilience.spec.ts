import { expect, test } from "@playwright/test";

test("failed animation downloads remain isolated from service content and navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const failures: string[] = [];
  page.on("console", message => { if (message.type() === "error") failures.push(message.text()); });
  await page.route("**/*.js", async route => {
    const response = await route.fetch();
    const source = await response.text();
    if (source.includes("M 12 207 C 31 194")) return route.abort("failed");
    return route.fulfill({ response });
  });
  await page.goto("/en/services/ads");
  await expect(page.locator('[data-offer-fallback="campaign"][data-failed="true"]')).toBeVisible();
  await expect(page.locator("main h1")).toBeVisible();
  expect(failures.some(message => message.includes("illustration.failed"))).toBe(true);
  await page.locator("header").getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page.locator("#contact-name")).toBeVisible();
});

test("production security policy enforces object restrictions and accepts sanitized reports", async ({ page, request }) => {
  const response = await request.get("/en");
  expect(response.headers()["content-security-policy"]).toContain("object-src 'none'");
  expect(response.headers()["content-security-policy-report-only"]).toContain("report-uri /api/security-report");
  await page.goto("/en");
  const directive = await page.evaluate(() => new Promise<string>(resolve => {
    document.addEventListener("securitypolicyviolation", event => { if (event.disposition === "enforce") resolve(event.effectiveDirective); });
    document.body.insertAdjacentHTML("beforeend", '<object data="/suchio-favicon.svg"></object>');
  }));
  expect(directive).toBe("object-src");
  expect((await request.post("/api/security-report", { headers: { "Content-Type": "application/csp-report" }, data: { "csp-report": { "effective-directive": "object-src", disposition: "enforce" } } })).status()).toBe(204);
});

import { expect, test } from "@playwright/test";
import audits from "../src/content/audits.json" with { type: "json" };

test("counting requires a choice, survives reload without another count, and supports withdrawal", async ({ page }) => {
  const requests: string[] = [];
  await page.route("**/api/audit-visits", async route => {
    requests.push(route.request().method());
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.goto(`/audit/${audits[0].code}`);
  await expect(page.getByRole("button", { name: "Aufruf zählen erlauben" })).toBeVisible();
  await expect(page.locator("main h1")).toBeVisible();
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("suchio:audit-consent:")))).toEqual([]);
  await page.getByRole("button", { name: "Ohne Zählung weiterlesen" }).click();
  expect(requests).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: "Aufruf zählen erlauben" }).click();
  await expect(page.getByRole("button", { name: "Zustimmung widerrufen und Zählung löschen" })).toBeVisible();
  expect(requests).toEqual(["POST"]);
  await page.reload();
  await page.getByRole("button", { name: "Zustimmung widerrufen und Zählung löschen" }).click();
  await expect(page.getByText("Dieser Aufruf wird nicht gezählt.", { exact: true })).toBeVisible();
  expect(requests).toEqual(["POST", "DELETE"]);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("suchio:audit-consent:")))).toEqual([]);
  await page.goto(`/audit/${audits[0].code}?audit_preview=1`);
  await expect(page.getByText("Vorschau: Dieser Aufruf wird nicht gezählt.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Aufruf zählen erlauben" })).toHaveCount(0);
  expect(requests).toEqual(["POST", "DELETE"]);
});

test("a failed count is not presented as confirmed after reload", async ({ page }) => {
  await page.route("**/api/audit-visits", route => route.fulfill({ status: 503 }));
  await page.goto(`/audit/${audits[0].code}`);
  await page.getByRole("button", { name: "Aufruf zählen erlauben" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Aufruf zählen erlauben" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Zustimmung widerrufen und Zählung löschen" })).toHaveCount(0);
});

test("Worker administration denies forged identity headers, including mutation routes", async ({ request }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("workers-"));
  for (const path of ["/admin/audits", "/admin/audits/check", "/admin/audits/delete"]) {
    const response = await request.get(path, { maxRedirects: 0, headers: { "cf-access-authenticated-user-email": "contact@suchio.net" } });
    expect([303, 403]).toContain(response.status());
    expect(response.headers()["cache-control"]).toContain("no-store");
    const body = await response.text();
    for (const audit of audits) expect(body).not.toContain(audit.code);
  }
});

test("Worker login, link checks and logout work with an actual revocable session", async ({ page, request }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("workers-"));
  await page.goto("/admin/audits");
  await expect(page).toHaveURL(/\/admin\/audits\/login$/);
  await page.getByLabel("E-Mail", { exact: true }).fill("contact@suchio.net");
  await page.getByLabel("Passwort", { exact: true }).fill("e".repeat(64));
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Berichtaufrufe im Blick" })).toBeVisible();
  const cookie = (await page.context().cookies()).find(item => item.name === "__Host-suchio-audit-session")!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.secure).toBe(true);
  expect(cookie.sameSite).toBe("Strict");
  const origin = new URL(page.url()).origin;
  const receipt = crypto.randomUUID().replaceAll("-", "").repeat(2);
  const payload = { code: audits[0].code, receipt, consent: true, version: "2026-09-26-v1" };
  const before = Number(await page.locator("article").first().locator(".number").innerText());
  try {
    const counted = await request.post("/api/audit-visits", { headers: { Origin: origin, "User-Agent": "Mozilla/5.0" }, data: payload });
    expect(counted.status()).toBe(200);
    await page.reload();
    await expect(page.locator("article").first().locator(".number")).toHaveText(String(before + 1));
  } finally {
    const withdrawn = await request.delete("/api/audit-visits", { headers: { Origin: origin }, data: payload });
    expect(withdrawn.status()).toBe(200);
  }
  await page.reload();
  await expect(page.locator("article").first().locator(".number")).toHaveText(String(before));
  await page.locator("article").first().getByRole("button", { name: "Link prüfen" }).click();
  await expect(page.locator("article").first()).toContainText("Linkprüfung bestanden");
  await page.getByRole("button", { name: "Abmelden", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/audits\/login$/);
  const replay = await request.get("/admin/audits", { maxRedirects: 0, headers: { Cookie: `${cookie.name}=${cookie.value}` } });
  expect(replay.status()).toBe(303);
});

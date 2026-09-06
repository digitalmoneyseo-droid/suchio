import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("focuses the service radios when they are the first invalid field", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/en/contact");
  await page.locator("#contact-name").fill("Test visitor");
  await page.locator("#contact-email").fill("test@example.com");
  await page.getByRole("button", { name: "Send project enquiry", exact: true }).click();
  await expect(page.locator('[name="service"]').first()).toBeFocused();
  expect(errors).toEqual([]);
});

test("recovers from a stalled submission and reuses its retry key", async ({ page }) => {
  const ids: string[] = [];
  await page.clock.install();
  await page.route("**/api/contact", async (route) => {
    const body: unknown = route.request().postDataJSON();
    if (!body || typeof body !== "object" || !("submissionId" in body) || typeof body.submissionId !== "string") throw new Error("Missing submission key");
    ids.push(body.submissionId);
    if (ids.length > 1) await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, id: "test" }) });
  });
  await page.goto("/en/contact");
  await page.locator("#contact-name").fill("Retry visitor");
  await page.locator("#contact-email").fill("retry@example.com");
  await page.locator("#contact-message").fill("Retry this enquiry without duplicating the message.");
  await page.getByRole("radio", { name: "Not sure yet", exact: true }).check();
  await page.locator("#contact-budget").click();
  await page.getByRole("option", { name: "Still open", exact: true }).click();
  const submit = page.locator('button[type="submit"]');
  await submit.click();
  await expect.poll(() => ids.length).toBe(1);
  await page.clock.fastForward(15_001);
  await expect(submit).toBeEnabled();
  await expect(page.locator("form").getByRole("alert")).toContainText("contact@suchio.net");
  await submit.click();
  await expect(page.getByRole("heading", { name: "Thanks, your enquiry has arrived." })).toBeVisible();
  expect(ids[1]).toBe(ids[0]);
});

test("keeps draft details and selections during internal navigation", async ({ page }) => {
  await page.goto("/en/contact");
  await page.locator("#contact-name").fill("Draft visitor");
  await page.locator("#contact-email").fill("draft@example.com");
  await page.locator("#contact-message").fill("Keep these details when I look at the services.");
  await page.getByRole("radio", { name: "Not sure yet", exact: true }).check();
  await page.locator("#contact-budget").click();
  await page.getByRole("option", { name: "Still open", exact: true }).click();
  await page.locator("header").getByRole("link", { name: "About us", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/about$/);
  await page.locator("header").getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page.locator("#contact-name")).toHaveValue("Draft visitor");
  await expect(page.locator("#contact-message")).toHaveValue("Keep these details when I look at the services.");
  await expect(page.getByRole("radio", { name: "Not sure yet", exact: true })).toBeChecked();
  await expect(page.locator("#contact-budget")).toContainText("Still open");
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test("does not submit personal details in the URL without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/en/contact");
    await expect(page.locator("form")).toHaveAttribute("method", "post");
    await expect(page.getByRole("button", { name: "Send project enquiry", exact: true })).toBeDisabled();
    await expect(page.locator("noscript").getByRole("link", { name: "contact@suchio.net" })).toBeVisible();
    await page.goto("/en");
    const faq = page.locator("details[id^='home-faq-']").first();
    await faq.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(faq).toHaveAttribute("open", "");
    await expect(faq.locator("p")).toBeVisible();
  } finally { await context.close(); }
});

test("only persists a language after an explicit language selection", async ({ page, context }) => {
  await page.goto("/fr");
  expect((await context.cookies()).some(({ name }) => name === "suchio-locale")).toBe(false);
  await page.locator("header").getByRole("button", { name: /FR$/ }).first().click();
  await page.locator("header").getByRole("link", { name: /English/ }).click();
  await expect(page).toHaveURL(/\/en$/);
  expect((await context.cookies()).find(({ name }) => name === "suchio-locale")?.value).toBe("en");
});

test("unlocks scrolling after resizing an open mobile menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("finishes the automation demonstration in normal and reduced motion", async ({ page }) => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/fr/services/automation");
    const visual = page.locator("[data-automation-flow]");
    await visual.scrollIntoViewIfNeeded();
    await expect(visual).toBeVisible();
    await page.waitForTimeout(reducedMotion === "reduce" ? 300 : 5500);
    const running = await visual.evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length);
    expect(running).toBe(0);
  }
});

test("supports French reflow, text spacing, and accessible expanded controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of ["/fr", "/fr/contact", "/fr/services/websites", "/fr/services/seo", "/fr/services/ads", "/fr/services/automation", "/fr/about", "/fr/privacy"]) {
    await page.goto(path);
    await page.addStyleTag({ content: "p,li,label,summary {line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto("/fr/contact");
  await page.locator("#contact-budget").click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});


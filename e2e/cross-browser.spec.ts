import { expect, test } from "@playwright/test";
import { publicRoutes } from "../src/lib/public-routes";
import { expectContentWithinViewport, fillEnquiry } from "./helpers";

test("language changes keep the regular header without a fallback bar", async ({ page }) => {
  await page.goto("/en");
  for (const [language, path] of [["Français", "/fr"], ["Deutsch", "/"], ["English", "/en"]]) {
    const header = page.locator("header");
    await header.locator('button[aria-controls="desktop-language-menu"]').click();
    await header.getByRole("link", { name: new RegExp(`^${language}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${path === "/" ? "/" : path}$`));
    await expect(header).toBeVisible();
    await expect(page.locator("[data-navigation-fallback]")).toHaveCount(0);
  }
});

test("FAQ and service disclosures animate both ways and honor reduced motion", async ({ page }) => {
  await page.goto("/fr");
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const selector of ["#services details", "#faq details"]) {
      const disclosure = page.locator(selector).nth(1);
      await disclosure.scrollIntoViewIfNeeded();
      // Enhancing the native group indicates that the click controller is ready.
      await expect(disclosure).not.toHaveAttribute("name");
      for (const open of [true, false]) {
        const frames = await disclosure.evaluate(element => {
          element.querySelector("summary")!.click();
          return element.getAnimations().map(animation => (animation.effect as KeyframeEffect).getKeyframes());
        });
        expect(frames.length).toBe(reducedMotion === "reduce" ? 0 : 1);
        if (frames.length) expect(frames[0][0].height).not.toBe(frames[0][1].height);
        await expect.poll(() => disclosure.evaluate(element => element.getAnimations().length)).toBe(0);
        if (open) await expect(disclosure).toHaveAttribute("open", "");
        else await expect(disclosure).not.toHaveAttribute("open");
      }
    }
  }
});

test("French routes reflow at 320px with standard and enlarged text", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of publicRoutes.filter(route => route.locale === "fr")) {
    await page.goto(route.pathname);
    await expect(page.locator("header")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ".deferred-rendering { content-visibility: visible !important; }" });
    for (const size of [16, 32]) {
      await page.evaluate(size => document.documentElement.style.fontSize = `${size}px`, size);
      await expectContentWithinViewport(page);
    }
    if (route.basePath === "/contact") {
      // Overflow alone misses labels squeezed into single-character columns.
      const submit = page.locator('button[type="submit"]');
      expect((await submit.boundingBox())!.height).toBeLessThan(250);
      await testInfo.attach("french-contact-enlarged", { body: await page.screenshot(), contentType: "image/png" });
    }
  }
});

test("budget selection supports selected focus, arrows, type-ahead and leaving the control", async ({ page }) => {
  await page.goto("/en/contact");
  const trigger = page.locator("#contact-budget");
  await trigger.click();
  await page.getByRole("option", { name: "Still open", exact: true }).click();
  await trigger.press("ArrowUp");
  await expect(page.getByRole("option", { name: "Still open", exact: true })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page.getByRole("option", { name: "Under €5,000", exact: true })).toBeFocused();
  await page.keyboard.press("s");
  await expect(page.getByRole("option", { name: "Still open", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Still open", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#contact-message")).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("pending enquiries cannot be edited and recover without losing the draft", async ({ page }) => {
  let release: (() => void) | undefined;
  await page.route("**/api/contact", async route => {
    await new Promise<void>(resolve => { release = resolve; });
    await route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ code: "delivery_failed" }) });
  });
  await page.goto("/en/contact");
  await fillEnquiry(page);
  const original = await page.locator("#contact-message").inputValue();
  await page.locator('button[type="submit"]').click();
  await expect.poll(() => Boolean(release)).toBe(true);
  for (const selector of ["#contact-name", "#contact-email", "#contact-company", "#contact-company-url", "#contact-message", "#contact-budget", '[name="service"]']) {
    await expect(page.locator(selector).first()).toBeDisabled();
  }
  release?.();
  await expect(page.locator("#contact-message")).toBeEnabled();
  await expect(page.locator("#contact-message")).toHaveValue(original);
  await expect(page.locator("form").getByRole("alert")).toBeVisible();
  await page.unroute("**/api/contact");
  await page.route("**/api/contact", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, id: "test" }) }));
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole("heading", { name: "Thanks, your enquiry has arrived." })).toBeFocused();
});

test("rate-limited enquiries honor Retry-After before retrying", async ({ page }) => {
  await page.clock.install();
  let attempts = 0;
  await page.route("**/api/contact", route => {
    attempts++;
    return route.fulfill({ status: 429, headers: { "Retry-After": "2" }, contentType: "application/json", body: JSON.stringify({ code: "rate_limited" }) });
  });
  await page.goto("/en/contact");
  await fillEnquiry(page);
  const submit = page.locator('button[type="submit"]');
  await submit.click();
  await expect(submit).toContainText("2s");
  await expect(submit).toBeDisabled();
  await page.clock.runFor(2100);
  await expect(submit).toBeEnabled();
  expect(attempts).toBe(1);
  await expect(page.locator("#contact-name")).toHaveValue("Local test visitor");
});

test("navigation and illustrations remain available when JavaScript is disabled", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 320, height: 800 } });
  try {
    const page = await context.newPage();
    await page.goto("/fr");
    const navigation = page.locator("[data-navigation-fallback]");
    await navigation.locator("summary").click();
    await navigation.getByRole("link", { name: "English", exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('[data-offer-fallback="web-experience"]')).toBeVisible();
    await navigation.locator("summary").click();
    await navigation.getByRole("link", { name: "Websites & Apps", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/services\/websites$/);
  } finally { await context.close(); }
});

test("mobile navigation and disclosures work in normal and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/fr");
    await page.locator('button[aria-controls="site-menu"]').click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.locator('button[aria-controls="site-menu"]')).toBeFocused();
    const disclosure = page.locator("details[id^='home-faq-']").first();
    await disclosure.scrollIntoViewIfNeeded();
    await disclosure.locator("summary").click();
    await expect(disclosure).toHaveAttribute("open", "");
    await expect(disclosure.locator("p")).toBeVisible();
  }
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const routeSuffixes = [
  "",
  "/about",
  "/contact",
  "/imprint",
  "/privacy",
  "/services/websites",
  "/services/seo",
  "/services/ads",
  "/services/automation",
] as const;

const localePrefixes = ["", "/en", "/fr"] as const;

const legacyServiceRoutes = [
  ["/services/websites-apps", "/services/websites"],
  ["/services/seo-ai-visibility", "/services/seo"],
  ["/services/paid-campaigns", "/services/ads"],
  ["/services/ai-automation", "/services/automation"],
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function completeContactForm(page: Page) {
  await page.getByLabel("Your name").fill("Alex Morgan");
  await page.getByLabel("Work email").fill("alex@example.com");
  await page.getByLabel("Not sure yet").check();
  await page.getByRole("button", { name: "Planned project range" }).click();
  await page.getByRole("option", { name: "Still open" }).click();
  await page.getByLabel("What are you trying to achieve?").fill("We need help deciding which digital project should come first for our team.");
}

test("renders every public route in every locale", async ({ page }) => {
  test.setTimeout(60_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const prefix of localePrefixes) {
    for (const suffix of routeSuffixes) {
      const route = `${prefix}${suffix}` || "/";
      await test.step(route, async () => {
        pageErrors.length = 0;
        const response = await page.goto(route);
        expect(response?.ok()).toBeTruthy();
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toBeVisible();
        expect(pageErrors).toEqual([]);
      });
    }
  }
});

test("returns a localized 404 for unknown routes", async ({ page }) => {
  const cases = [
    { route: "/missing-page", heading: "Seite nicht gefunden." },
    { route: "/en/missing-page", heading: "Page not found." },
    { route: "/fr/missing-page", heading: "Page introuvable." },
  ] as const;

  for (const { route, heading } of cases) {
    await test.step(route, async () => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    });
  }
});

test("permanently redirects legacy service routes in every locale", async ({ request }) => {
  for (const prefix of [...localePrefixes, "/de"] as const) {
    for (const [legacyRoute, currentRoute] of legacyServiceRoutes) {
      const expectedPrefix = prefix === "/de" ? "" : prefix;
      const response = await request.get(`${prefix}${legacyRoute}?source=legacy`, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      expect(response.headers().location).toBe(`${expectedPrefix}${currentRoute}?source=legacy`);
    }
  }
});

test("keeps the canonical homepage stable unless a visitor selected a language", async ({ request }) => {
  const firstVisit = await request.get("/", {
    headers: { "accept-language": "en-US,en;q=0.9" },
    maxRedirects: 0,
  });
  expect(firstVisit.status()).toBe(200);

  const returningVisitor = await request.get("/", {
    headers: { cookie: "suchio-locale=en" },
    maxRedirects: 0,
  });
  expect(returningVisitor.status()).toBe(307);
  expect(returningVisitor.headers().location).toBe("/en");
});

test("sends the site security headers", async ({ request }) => {
  const response = await request.get("/en/about");

  expect(response.headers()["strict-transport-security"]).toBe("max-age=31536000");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=(), browsing-topics=()");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
  expect(response.headers()["content-security-policy-report-only"]).toContain("form-action 'self'");
});

test("reports unavailable email configuration without exposing secrets", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ ok: false });
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(response.headers()["x-robots-tag"]).toBe("noindex");
});

test("keeps mobile navigation keyboard-accessible and within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("[data-reveal]").first()).toHaveClass(/is-visible/);
  await expectNoHorizontalOverflow(page);

  const opener = page.locator('button[aria-controls="site-menu"]');
  await opener.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#site-menu")).toHaveAttribute("aria-hidden", "false");
  await page.keyboard.press("Escape");
  await expect(page.locator("#site-menu")).toHaveAttribute("aria-hidden", "true");
  await expect(opener).toBeFocused();

  await page.keyboard.press("Enter");
  await page.locator('#site-menu a[href="/contact"]').click();
  await expect(page).toHaveURL(/\/contact$/);
  await expectNoHorizontalOverflow(page);
});

test("switches from English back to German and remembers the selection", async ({ page, context }) => {
  await page.goto("/en/about");
  await page.getByRole("button", { name: "Select language" }).first().hover();
  await page.getByRole("link", { name: /Deutsch/ }).first().click();

  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { level: 1, name: "Verschiedene Disziplinen. Eine klare Richtung." })).toBeVisible();
  await expect.poll(async () => (await context.cookies()).find(({ name }) => name === "suchio-locale")?.value).toBe("de");

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
});

test("loads decorative homepage animations only as they approach the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("[data-optimization-animation]")).toHaveCount(0);
  await expect(page.locator("[data-campaign-metric]")).toHaveCount(0);
  await expect(page.locator("[data-automation-flow]")).toHaveCount(0);

  await page.locator('[data-offer-visual="optimization"]').scrollIntoViewIfNeeded();
  await expect(page.locator("[data-optimization-animation]")).toBeAttached();

  await page.locator('[data-offer-visual="campaign"]').scrollIntoViewIfNeeded();
  await expect(page.locator("[data-campaign-metric]")).toBeAttached();

  await page.locator('[data-offer-visual="automation"]').scrollIntoViewIfNeeded();
  await expect(page.locator("[data-automation-flow]")).toBeAttached();
});

test("validates and submits the contact form", async ({ page }) => {
  await page.goto("/en/contact");
  await page.getByRole("button", { name: "Send project enquiry" }).click();
  await expect(page.locator("form [role='alert']")).toHaveCount(5);
  await expect(page.locator("#contact-name")).toBeFocused();

  await page.route("**/api/contact", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true }),
  }));
  await completeContactForm(page);
  await page.getByRole("button", { name: "Send project enquiry" }).click();

  await expect(page.getByRole("heading", { name: "Thanks, your enquiry has arrived." })).toBeVisible();
  await expect(page.getByText("alex@example.com")).toBeVisible();
});

test("keeps the email fallback when contact delivery fails", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ error: "unavailable" }),
  }));
  await page.goto("/en/contact");
  await completeContactForm(page);
  await page.getByRole("button", { name: "Send project enquiry" }).click();

  await expect(page.locator("form").getByRole("alert")).toContainText("contact@suchio.net");
  await expect(page.getByRole("button", { name: "Send project enquiry" })).toBeEnabled();
});

test("returns a controlled error when contact email is not configured", async ({ request }) => {
  const response = await request.post("/api/contact", {
    data: {
      name: "Runtime check",
      submissionId: "d0d5bcd1-e816-42af-894c-3eac734a502d",
      email: "runtime@example.com",
      company: "",
      companyUrl: "",
      message: "This verifies the Bun production contact route without sending email.",
      locale: "en",
      service: "not-sure",
      budget: "budget-5",
      website: "",
    },
  });

  expect(response.status()).toBe(503);
  await expect(response.json()).resolves.toEqual({ error: "Email service unavailable" });
});

test("keeps representative pages accessible with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const route of ["/", "/en/contact"] as const) {
    await test.step(route, async () => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).exclude('[aria-hidden="true"]').analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

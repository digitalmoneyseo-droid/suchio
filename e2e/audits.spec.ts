import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import audits from "../src/content/audits.json" with { type: "json" };

const campaignIds = new Set("mp alles krebs schwenke stueben luepke weber seta ruppert winter och hereth wagner bb geiss gigadent laporta boxen dachbau mas".split(" "));

test("individual audit links resolve in every locale without exposing other recipients", async ({ request }) => {
  for (const locale of ["de", "en", "fr"] as const) {
    const prefix = locale === "de" ? "" : `/${locale}`;
    for (const audit of audits) {
      const response = await request.get(`${prefix}/audit/${audit.code}`);
      expect(response.status()).toBe(200);
      const html = await response.text();
      if (campaignIds.has(audit.id)) {
        expect(html).toContain(audit.company.replaceAll("&", "&amp;"));
      } else {
        expect(html).toContain(audit.content[locale].title.replaceAll("&", "&amp;"));
      }
      expect(html).toMatch(/<meta name="robots" content="noindex,\s*follow"/);
      expect(html).toContain('name="referrer" content="no-referrer"');
      for (const other of audits.filter(other => other.code !== audit.code)) expect(html).not.toContain(other.code);
    }
    for (const route of ["privacy", "datenschutz"]) {
      const response = await request.get(`${prefix}/${route}`);
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain('id="briefwerbung"');
    }
    expect((await request.get(`${prefix}/audit/not-a-real-recipient`)).status()).toBe(404);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/audit/");
  const homepage = await (await request.get("/")).text();
  for (const audit of audits) expect(homepage).not.toContain(audit.code);
});

test("audit page stays readable on narrow screens and links to contact and privacy", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const path = `/fr/audit/${audits[0].code}`;
  await page.goto(path);
  await expect(page.locator("main h1")).toHaveText(audits[0].content.fr.title);
  await expect(page.locator('main a[href="/fr/contact"]')).toBeVisible();
  await expect(page.locator('main a[href="/fr/privacy#briefwerbung"]')).toBeVisible();
  await expect(page.locator('section[aria-labelledby="measurements-title"] dt')).toHaveCount(7);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  // Measure the final text colours, rather than an intermediate fade-in frame.
  await expect(page.locator('.editorial-hero [data-reveal]')).toHaveCSS('opacity', '1');
  const results = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.locator('main a[href="/fr/privacy#briefwerbung"]').click();
  await expect(page.locator("#briefwerbung h2")).toHaveText("Confidentialité du courrier publicitaire");
  await expect(page.locator("#briefwerbung")).toContainText("Le service Codex d’OpenAI");
});

import { expect, test } from "@playwright/test";

declare global {
  interface Window { suchioLab: { lcp: number; cls: number; blocking: number; interaction: number; violations: string[] } }
}

test("mobile performance budgets across locales and page types", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "workers-chromium", "Measure the production runtime.");
  test.setTimeout(240_000);
  const results = [];
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const prefix of ["", "/en", "/fr"]) {
    for (const suffix of ["", "/services/seo", "/contact"]) {
      const path = `${prefix}${suffix}` || "/";
      const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion });
      try {
        const page = await context.newPage();
        page.on("console", (message) => { if (message.text().startsWith("Layout shift")) console.log(message.text()); });
        const cdp = await context.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 100, downloadThroughput: 500_000, uploadThroughput: 250_000 });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await page.addInitScript(() => {
          window.suchioLab = { lcp: 0, cls: 0, blocking: 0, interaction: 0, violations: [] };
          document.addEventListener("securitypolicyviolation", (event) => window.suchioLab.violations.push(event.effectiveDirective));
          for (const type of ["largest-contentful-paint", "layout-shift", "longtask", "event"]) {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.entryType === "largest-contentful-paint") window.suchioLab.lcp = entry.startTime;
                if (entry.entryType === "layout-shift" && "hadRecentInput" in entry && !entry.hadRecentInput && "value" in entry && typeof entry.value === "number") { window.suchioLab.cls += entry.value; if (entry.value > 0.05 && "sources" in entry) console.log("Layout shift", JSON.stringify(entry.sources)); }
                if (entry.entryType === "longtask") window.suchioLab.blocking += Math.max(0, entry.duration - 50);
                // Pointer enter/over events during page load have no interaction
                // ID. Count actual click/keyboard interactions for this budget.
                if (entry.entryType === "event" && "interactionId" in entry && typeof entry.interactionId === "number" && entry.interactionId > 0) window.suchioLab.interaction = Math.max(window.suchioLab.interaction, entry.duration);
              }
            }).observe({ type, buffered: true, ...(type === "event" ? { durationThreshold: 16 } : {}) });
          }
        });
        const failedResources: string[] = [];
        page.on("response", (response) => { if (response.status() >= 400) failedResources.push(new URL(response.url()).pathname); });
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForLoadState("networkidle");
        const opening = await page.evaluate(() => ({ ...window.suchioLab }));
        await page.locator('button[aria-controls="site-menu"]').click();
        await page.keyboard.press("Escape");
        if (suffix === "/contact") {
          await page.locator("#contact-name").fill("Performance test visitor");
          await page.locator("#contact-budget").click();
          await page.keyboard.press("End");
          await page.keyboard.press("Enter");
          await page.locator("#contact-message").fill("Measure a representative form interaction without sending an enquiry.");
        } else {
          const visual = page.locator(suffix ? "main section[aria-hidden]" : '[data-offer-visual="optimization"]');
          if (suffix) await page.locator("[data-optimization-animation]").scrollIntoViewIfNeeded();
          else await visual.scrollIntoViewIfNeeded();
          await page.waitForTimeout(reducedMotion === "reduce" ? 100 : 3500);
        }
        await page.waitForTimeout(100);
        const final = await page.evaluate(() => ({ ...window.suchioLab, transferBytes: performance.getEntriesByType("resource").reduce((sum, entry) => sum + ("transferSize" in entry && typeof entry.transferSize === "number" ? entry.transferSize : 0), 0) }));
        const metrics = { path, reducedMotion, ...opening, interaction: final.interaction, interactionBlocking: final.blocking - opening.blocking, transferBytes: final.transferBytes };
        results.push(metrics);
        console.log(JSON.stringify(metrics));
        expect(failedResources, path).toEqual([]);
        expect(final.violations, path).toEqual([]);
        expect(opening.lcp, path).toBeGreaterThan(0);
        expect(opening.lcp, path).toBeLessThan(2500);
        expect(opening.cls, path).toBeLessThan(0.1);
        expect(opening.blocking, path).toBeLessThan(250);
        expect(final.interaction, path).toBeLessThan(200);
        expect(final.blocking - opening.blocking, path).toBeLessThan(250);
      } finally { await context.close(); }
    }
  }
  }
  await testInfo.attach("mobile-performance", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
});

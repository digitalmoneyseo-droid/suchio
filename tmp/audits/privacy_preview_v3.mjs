import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [locale, width] of [['de',1440],['fr',320]]) {
  await page.setViewportSize({width,height:1000});
  await page.goto(`http://localhost:3121/${locale === 'de' ? 'datenschutz' : 'fr/privacy'}#briefwerbung`);
  await page.locator('#briefwerbung').scrollIntoViewIfNeeded();
  await page.screenshot({path:`tmp/audits/privacy-${locale}-v3.png`});
  if (await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Overflow');
}
await browser.close();

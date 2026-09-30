import { expect, type Page } from "@playwright/test";

export async function expectContentWithinViewport(page: Page) {
  const issues = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.querySelectorAll<HTMLElement>("header a, header button, main h1, main h2, main h3, main p, main a, main button, main input, main textarea, main label, footer a")]
      .filter(element => !element.closest('[aria-hidden="true"], [hidden], [inert]'))
      .filter(element => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > width + 1); })
      .map(element => ({ tag: element.tagName, text: element.textContent?.slice(0, 80), left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right }));
  });
  expect(issues, page.url()).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

export async function fillEnquiry(page: Page) {
  await expect(page.locator('button[type="submit"]')).toBeEnabled();
  await page.locator("#contact-name").fill("Local test visitor");
  await page.locator("#contact-email").fill("test@example.com");
  await page.locator("#contact-message").fill("A synthetic enquiry for browser regression verification.");
  await page.getByRole("radio", { name: "Not sure yet", exact: true }).check();
  const budget = page.locator("#contact-budget");
  // Keyboard selection avoids pointer clicks racing WebKit's smooth scrolling.
  // Pointer selection is covered separately by the budget control test.
  await budget.press("ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(budget).toContainText("Still open");
  await expect(page.locator('input[name="budget"]')).toHaveValue("budget-5");
}

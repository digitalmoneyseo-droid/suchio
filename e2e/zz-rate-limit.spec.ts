import { expect, test } from "@playwright/test";

test("limits bursts against the Workers contact endpoint", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "workers-chromium", "Rate limiting belongs to the production Worker.");
  const statuses: number[] = [];
  for (let attempt = 0; attempt < 11; attempt++) {
    // No body is needed to exercise the pre-validation limiter. Avoid Wrangler's
    // local proxy crash when a rejected POST leaves an unread body (#15203).
    const response = await request.post("/api/contact");
    statuses.push(response.status());
    if (response.status() === 429) expect(response.headers()["retry-after"]).toBe("60");
  }
  expect(statuses).toContain(429);
  expect((await request.get("/fr")).status()).toBe(200);
});

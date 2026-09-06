import { expect, test } from "@playwright/test";

test("limits bursts against the Workers contact endpoint", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "workers-chromium", "Rate limiting belongs to the production Worker.");
  const statuses: number[] = [];
  for (let attempt = 0; attempt < 11; attempt++) {
    const response = await request.post("/api/contact", { data: { website: "automated-probe" } });
    statuses.push(response.status());
    if (response.status() === 429) expect(response.headers()["retry-after"]).toBe("60");
  }
  expect(statuses).toContain(429);
});

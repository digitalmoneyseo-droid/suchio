import { expect, test } from "bun:test";
import robots from "../src/lib/robots";
import { absoluteUrl, siteOrigin } from "../src/lib/site";
import domainRedirect from "../src/domain-redirect-worker";

test("uses the production domain for canonical URLs and the robots sitemap", () => {
  expect(siteOrigin).toBe("https://suchio.net");
  expect(absoluteUrl("/")).toBe("https://suchio.net/");
  expect(robots().sitemap).toBe("https://suchio.net/sitemap.xml");
});

test("disables the alternate workers.dev deployment hostname", async () => {
  const config = await Bun.file("wrangler.jsonc").text();

  expect(config).toContain('"workers_dev": false');
});

test("redirects insecure and www requests to HTTPS without losing the path or query", async () => {
  const config = await Bun.file("wrangler.redirects.jsonc").text();
  expect(config).toContain('"http://suchio.net/*"');
  for (const origin of ["http://suchio.net", "http://www.suchio.net", "https://www.suchio.net"]) {
    const response = domainRedirect.fetch(new Request(`${origin}/fr/contact?service=websites-apps`));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://suchio.net/fr/contact?service=websites-apps");
  }
});

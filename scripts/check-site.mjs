import { siteOrigin } from "../src/lib/site-config.ts";

const origin = process.argv[2] ?? siteOrigin;
for (const path of ["/", "/en", "/fr", "/services/websites", "/en/contact", "/fr/services/seo", "/robots.txt", "/sitemap.xml", "/api/health"]) {
  const response = await fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(15_000) });
  if (response.status !== 200) throw new Error(`${path}: expected 200, received ${response.status}`);
  if (path === "/api/health") {
    const data = await response.json();
    if (data.ok !== true) throw new Error("Contact configuration is not ready.");
  } else if (!path.includes(".")) {
    const html = await response.text();
    if (!html.includes("<h1") || !html.includes("Suchio")) throw new Error(`${path}: expected page content missing`);
  }
  console.log(`${path}: OK`);
}

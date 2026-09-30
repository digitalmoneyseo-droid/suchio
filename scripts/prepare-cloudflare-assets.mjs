import { securityHeaders } from "../src/lib/security-headers.ts";
import robots from "../src/lib/robots.ts";
import sitemap from "../src/lib/sitemap.ts";

const assetDirectory = "dist/client";
const configuration = robots();
await Promise.all([
  Bun.write(`${assetDirectory}/robots.txt`, `User-agent: ${configuration.rules.userAgent}\nAllow: ${configuration.rules.allow}\n\nSitemap: ${configuration.sitemap}\n`),
  Bun.write(`${assetDirectory}/sitemap.xml`, serializeSitemap(sitemap())),
  Bun.write(`${assetDirectory}/_headers`, `/*\n${securityHeaders.map(({ key, value }) => `  ${key}: ${value}`).join("\n")}\n\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n`),
]);

const htmlRouteCount = Array.from(new Bun.Glob("**/*.html").scanSync({ cwd: assetDirectory, onlyFiles: true })).length;
console.log(`Prepared ${htmlRouteCount} static HTML routes, robots.txt, sitemap.xml, and security headers for Cloudflare Assets.`);

function serializeSitemap(entries) {
  const urls = entries.map(entry => {
    const fields = [`<loc>${escapeXml(entry.url)}</loc>`];
    for (const [language, href] of Object.entries(entry.alternates.languages)) {
      fields.push(`<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(href)}"/>`);
    }
    return `  <url>${fields.join("")}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

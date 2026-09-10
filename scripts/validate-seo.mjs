import { readFile } from "node:fs/promises";
import { join } from "node:path";

const outputDirectory = join(process.cwd(), "dist", "client");
import { siteOrigin } from "../src/lib/site-config.ts";
import { localeDefinitions, indexableBasePaths, legalBasePaths } from "../src/lib/public-routes.ts";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function localizePath(pathname, prefix) {
  if (!prefix) return pathname;
  return pathname === "/" ? prefix : `${prefix}${pathname}`;
}

function routeRecords(basePaths) {
  return localeDefinitions.flatMap(({ locale, prefix }) => basePaths.map((basePath) => ({
    basePath,
    locale,
    pathname: localizePath(basePath, prefix),
  })));
}

const indexableRoutes = routeRecords(indexableBasePaths);
const legalRoutes = routeRecords(legalBasePaths);
const publicRoutes = [...indexableRoutes, ...legalRoutes];
const indexableUrls = new Set(indexableRoutes.map(({ pathname }) => new URL(pathname, siteOrigin).toString()));
const publicPaths = new Set(publicRoutes.map(({ pathname }) => pathname));

function generatedHtmlPath(pathname) {
  return join(outputDirectory, pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`);
}

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/\s([:\w-]+)=(?:"([^"]*)"|'([^']*)')/g)].map((match) => [
    match[1].toLowerCase(),
    decodeEntities(match[2] ?? match[3] ?? ""),
  ]));
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => attributes(match[0]));
}

function metadataContent(html, attribute, value) {
  return tags(html, "meta").find((entry) => entry[attribute] === value)?.content;
}

function linkHref(html, relation) {
  return tags(html, "link").find((entry) => entry.rel === relation)?.href;
}

function sameUrl(left, right) {
  if (!left || !right) return false;
  return new URL(left).toString() === new URL(right).toString();
}

function assertAlternateUrls(actual, expected, label) {
  assert(JSON.stringify(Object.keys(actual)) === JSON.stringify(Object.keys(expected)), `${label} has incomplete hreflang languages`);
  for (const [language, href] of Object.entries(expected)) {
    assert(sameUrl(actual[language], href), `${label} has an incorrect ${language} hreflang URL`);
  }
}

function localizedAlternates(basePath) {
  return {
    de: new URL(localizePath(basePath, ""), siteOrigin).toString(),
    en: new URL(localizePath(basePath, "/en"), siteOrigin).toString(),
    fr: new URL(localizePath(basePath, "/fr"), siteOrigin).toString(),
    "x-default": new URL(localizePath(basePath, ""), siteOrigin).toString(),
  };
}

function structuredData(html, pathname) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((match, index) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error(`${pathname} has invalid JSON-LD block ${index + 1}: ${error.message}`);
    }
  });
}

function schemaNodes(schemas) {
  return schemas.flatMap((schema) => Array.isArray(schema["@graph"]) ? schema["@graph"] : [schema]);
}

function hasSchemaType(nodes, type) {
  return nodes.some((node) => node["@type"] === type || (Array.isArray(node["@type"]) && node["@type"].includes(type)));
}

function assertCanonicalSchemaUrls(value, pathname, key = "") {
  if (Array.isArray(value)) {
    for (const item of value) assertCanonicalSchemaUrls(item, pathname, key);
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [childKey, childValue] of Object.entries(value)) {
    if ((childKey === "url" || childKey === "@id") && typeof childValue === "string" && childValue.startsWith("http")) {
      assert(childValue.startsWith(`${siteOrigin}/`), `${pathname} JSON-LD contains a non-canonical ${childKey}: ${childValue}`);
    }
    if (childKey !== "@context") assertCanonicalSchemaUrls(childValue, pathname, childKey);
  }
}

function normalizeInternalPath(pathname) {
  let normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (normalized === "/de") return "/";
  if (normalized.startsWith("/de/")) normalized = normalized.slice(3) || "/";
  return normalized;
}

function internalLinks(html, pathname) {
  const links = [];
  for (const anchor of tags(html, "a")) {
    const href = anchor.href;
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const destination = new URL(href, new URL(pathname, siteOrigin));
    if (destination.origin !== siteOrigin) continue;
    links.push(normalizeInternalPath(destination.pathname));
  }
  return links;
}

const htmlByPath = new Map();
for (const { pathname } of publicRoutes) {
  htmlByPath.set(pathname, await readFile(generatedHtmlPath(pathname), "utf8"));
}

const titleSets = new Map(localeDefinitions.map(({ locale }) => [locale, new Set()]));
const descriptionSets = new Map(localeDefinitions.map(({ locale }) => [locale, new Set()]));

for (const route of publicRoutes) {
  const { basePath, locale, pathname } = route;
  const html = htmlByPath.get(pathname);
  const canonicalUrl = new URL(pathname, siteOrigin).toString();
  assert(!html.includes("workers.dev") && !html.includes("suchio.info"), `${pathname} contains a removed hostname`);
  assert(new RegExp(`<html\\b[^>]*lang="${locale}"`, "i").test(html), `${pathname} has the wrong document language`);
  assert((html.match(/<h1\b/gi) ?? []).length === 1, `${pathname} must contain exactly one H1`);

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : "";
  const description = metadataContent(html, "name", "description")?.trim() ?? "";
  assert(title.length >= 10 && title.length <= 70, `${pathname} has an invalid title length (${title.length})`);
  assert(description.length >= 50 && description.length <= 200, `${pathname} has an invalid description length (${description.length})`);
  assert(sameUrl(linkHref(html, "canonical"), canonicalUrl), `${pathname} does not have a self-referencing canonical`);
  assert(sameUrl(metadataContent(html, "property", "og:url"), canonicalUrl), `${pathname} has an incorrect Open Graph URL`);
  assert(metadataContent(html, "property", "og:title") === title, `${pathname} has mismatched Open Graph title text`);
  assert(metadataContent(html, "property", "og:description") === description, `${pathname} has mismatched Open Graph description text`);
  assert(metadataContent(html, "property", "og:image") === `${siteOrigin}/suchio-social-card.png`, `${pathname} has an incorrect Open Graph image`);
  assert(metadataContent(html, "property", "og:image:width") === "1200", `${pathname} is missing Open Graph image width`);
  assert(metadataContent(html, "property", "og:image:height") === "630", `${pathname} is missing Open Graph image height`);
  assert(metadataContent(html, "name", "twitter:card") === "summary", `${pathname} has an incorrect Twitter card`);
  assert(metadataContent(html, "name", "twitter:image") === `${siteOrigin}/suchio-twitter-card.png`, `${pathname} has an incorrect Twitter image`);
  assert(metadataContent(html, "name", "twitter:image:width") === "400", `${pathname} is missing Twitter image width`);
  assert(metadataContent(html, "name", "twitter:image:height") === "400", `${pathname} is missing Twitter image height`);
  assert(metadataContent(html, "name", "google-site-verification"), `${pathname} is missing Google verification metadata`);

  const alternates = Object.fromEntries(tags(html, "link")
    .filter((entry) => entry.rel === "alternate" && entry.hreflang)
    .map((entry) => [entry.hreflang, entry.href]));
  assertAlternateUrls(alternates, localizedAlternates(basePath), pathname);

  const robots = metadataContent(html, "name", "robots") ?? "";
  const googleBot = metadataContent(html, "name", "googlebot") ?? "";
  const indexable = indexableUrls.has(canonicalUrl);
  if (indexable) {
    assert(robots.includes("index") && robots.includes("follow") && !robots.includes("noindex"), `${pathname} is not indexable`);
    assert(googleBot.includes("index") && googleBot.includes("follow") && googleBot.includes("max-image-preview:large") && googleBot.includes("max-snippet:-1"), `${pathname} has incomplete Googlebot preview directives`);
    const titles = titleSets.get(locale);
    const descriptions = descriptionSets.get(locale);
    assert(!titles.has(title), `${locale} has a duplicate title: ${title}`);
    assert(!descriptions.has(description), `${locale} has a duplicate description: ${description}`);
    titles.add(title);
    descriptions.add(description);
  } else {
    assert(robots.includes("noindex") && robots.includes("follow"), `${pathname} must be noindex, follow`);
    assert(googleBot.includes("noindex") && googleBot.includes("follow"), `${pathname} must give Googlebot the same legal-page policy`);
  }

  const schemas = structuredData(html, pathname);
  const nodes = schemaNodes(schemas);
  for (const schema of schemas) assertCanonicalSchemaUrls(schema, pathname);
  if (basePath === "/") {
    assert(hasSchemaType(nodes, "FAQPage"), `${pathname} is missing FAQ structured data`);
    assert(hasSchemaType(nodes, "Organization"), `${pathname} is missing Organization structured data`);
    assert(hasSchemaType(nodes, "WebSite"), `${pathname} is missing WebSite structured data`);
  }
  if (basePath.startsWith("/services/")) {
    assert(hasSchemaType(nodes, "FAQPage"), `${pathname} is missing service FAQ structured data`);
  }
}

const sitemapXml = await readFile(join(outputDirectory, "sitemap.xml"), "utf8");
const sitemapBlocks = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
assert(sitemapBlocks.length === indexableRoutes.length, `Sitemap contains ${sitemapBlocks.length} URLs instead of ${indexableRoutes.length}`);

const sitemapUrls = new Set();
for (const block of sitemapBlocks) {
  const location = decodeEntities(block.match(/<loc>(.*?)<\/loc>/)?.[1] ?? "");
  assert(indexableUrls.has(location), `Sitemap contains an unexpected URL: ${location}`);
  assert(!sitemapUrls.has(location), `Sitemap contains a duplicate URL: ${location}`);
  sitemapUrls.add(location);

  const pathname = new URL(location).pathname;
  const route = indexableRoutes.find((entry) => entry.pathname === normalizeInternalPath(pathname));
  assert(route, `Could not resolve sitemap route ${location}`);
  const alternates = Object.fromEntries([...block.matchAll(/<xhtml:link\b[^>]*\/>/g)].map((match) => {
    const entry = attributes(match[0]);
    return [entry.hreflang, entry.href];
  }));
  assertAlternateUrls(alternates, localizedAlternates(route.basePath), location);
}
assert(sitemapUrls.size === indexableUrls.size, "Sitemap does not contain every indexable URL exactly once");

const robotsText = await readFile(join(outputDirectory, "robots.txt"), "utf8");
assert(/User-Agent: \*\s+Allow: \//i.test(robotsText), "robots.txt does not allow crawling");
assert(robotsText.includes(`Sitemap: ${siteOrigin}/sitemap.xml`), "robots.txt does not point to the canonical sitemap");
assert(!robotsText.includes("workers.dev") && !robotsText.includes("suchio.info"), "robots.txt contains a removed hostname");

const edges = new Map();
const inbound = new Map(indexableRoutes.map(({ pathname }) => [pathname, 0]));
for (const { pathname } of publicRoutes) {
  const destinations = new Set(internalLinks(htmlByPath.get(pathname), pathname));
  edges.set(pathname, destinations);
  for (const destination of destinations) {
    assert(publicPaths.has(destination), `${pathname} links to a missing internal page: ${destination}`);
    if (inbound.has(destination)) inbound.set(destination, inbound.get(destination) + 1);
  }
}
for (const [pathname, count] of inbound) assert(count > 0, `${pathname} has no crawlable internal links pointing to it`);

const reachable = new Set(["/"]);
const queue = ["/"];
while (queue.length) {
  const current = queue.shift();
  for (const destination of edges.get(current) ?? []) {
    if (reachable.has(destination)) continue;
    reachable.add(destination);
    queue.push(destination);
  }
}
for (const { pathname } of indexableRoutes) assert(reachable.has(pathname), `${pathname} is not reachable from the homepage link graph`);

console.log(`SEO validation passed for ${indexableRoutes.length} indexable pages and ${legalRoutes.length} noindex legal pages.`);

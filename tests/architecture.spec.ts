import { expect, test } from "bun:test";
import { locales } from "../src/i18n/config";
import { servicesContent } from "../src/i18n/services";
import { legalContent, type LegalPageKind } from "../src/i18n/legal-content";
import { budgetOptions } from "../src/lib/contact-options";
import { getLegacyServiceRedirectPath, getServicePath, serviceOrder, serviceRouteSlugs } from "../src/lib/service-routes";
import { dictionaries } from "../src/i18n/translations";
import { publicRoutes, legacyServiceRoutes } from "../src/lib/public-routes";
import { publicBusinessAddress, publicContactEmail, publicContactPhone } from "../src/lib/contact";
import ts from "typescript";

function placeholders(value: string) { return [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g)].map((match) => match[1]).sort(); }
function contentShape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(contentShape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, key === "id" || key === "href" ? entry : contentShape(entry)]));
  return typeof value === "string" ? placeholders(value) : typeof value;
}

test("static public pages bypass the Worker while preference, API, admin, and legacy routes reach it", async () => {
  const parsed = ts.parseConfigFileTextToJson("wrangler.jsonc", await Bun.file("wrangler.jsonc").text());
  expect(parsed.error).toBeUndefined();
  const configured: unknown = parsed.config.assets.run_worker_first;
  expect(Array.isArray(configured)).toBeTrue();
  if (!Array.isArray(configured)) throw new Error("Missing Worker routes");
  const workerFirst = (path: string) => configured.some(pattern => typeof pattern === "string" && new RegExp(`^${pattern.split("*").map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`).test(path));
  for (const route of publicRoutes) expect(workerFirst(route.pathname)).toBe(route.pathname === "/");
  for (const route of legacyServiceRoutes) expect(workerFirst(route.from)).toBeTrue();
  for (const path of ["/de", "/de/contact", "/api/contact", "/api/health", "/api/security-report", "/api/audit-visits", "/admin/audits", "/admin/audits/login"]) expect(workerFirst(path)).toBeTrue();
  for (const path of ["/_astro/example.js", "/fonts/example.woff2", "/suchio-favicon.svg", "/robots.txt", "/sitemap.xml"]) expect(workerFirst(path)).toBeFalse();
  expect(parsed.config.assets.not_found_handling).toBe("none");
});

test("public contact facts remain consistent with every legal locale", () => {
  for (const locale of locales) {
    for (const kind of ["imprint", "privacy"] as const) {
      const serialized = JSON.stringify(legalContent[locale][kind]);
      for (const value of [publicContactEmail, publicContactPhone, publicBusinessAddress.streetAddress, publicBusinessAddress.postalCode, publicBusinessAddress.addressLocality]) expect(serialized).toContain(value);
    }
  }
});

test("preserves service sections, item order, and placeholders in every locale", () => {
  for (const locale of locales) {
    expect(contentShape(servicesContent[locale])).toEqual(contentShape(servicesContent.de));
    for (const service of servicesContent[locale].services) {
      for (const items of [service.page.outcomes, service.page.scopeGroups, service.page.process, service.page.faqs]) {
        expect(new Set(items.map(({ id }) => id)).size).toBe(items.length);
      }
    }
    for (const key of Object.keys(dictionaries.de) as (keyof typeof dictionaries.de)[]) {
      expect(placeholders(dictionaries[locale][key])).toEqual(placeholders(dictionaries.de[key]));
    }
  }
});

test("keeps public service slugs unique and redirects every legacy slug", () => {
  expect(new Set(Object.values(serviceRouteSlugs)).size).toBe(serviceOrder.length);

  for (const serviceId of serviceOrder) {
    expect(getLegacyServiceRedirectPath(`/services/${serviceId}`)).toBe(getServicePath(serviceId, "de"));
    expect(getLegacyServiceRedirectPath(`/en/services/${serviceId}`)).toBe(getServicePath(serviceId, "en"));
    expect(getLegacyServiceRedirectPath(`/fr/services/${serviceId}`)).toBe(getServicePath(serviceId, "fr"));
    expect(getLegacyServiceRedirectPath(`/de/services/${serviceId}`)).toBe(getServicePath(serviceId, "de"));
  }
});

test("keeps contact budget IDs unique", () => {
  expect(new Set(budgetOptions.map(({ id }) => id)).size).toBe(budgetOptions.length);
});

test("keeps legal disclosures and links equivalent across locales with nonempty headings", () => {
  const pageKinds = ["imprint", "privacy"] as const satisfies readonly LegalPageKind[];

  for (const locale of locales) expect(contentShape(legalContent[locale])).toEqual(contentShape(legalContent.de));
  for (const kind of pageKinds) {
    for (const locale of locales) {
      const page = legalContent[locale][kind];
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.intro.length).toBeGreaterThan(0);
      expect(page.sections.every(({ title }) => title.length > 0)).toBeTrue();
    }
  }
});

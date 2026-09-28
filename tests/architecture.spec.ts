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

test("every public and legacy route reaches the production Worker for RSC or redirects", async () => {
  const parsed = ts.parseConfigFileTextToJson("wrangler.jsonc", await Bun.file("wrangler.jsonc").text());
  expect(parsed.error).toBeUndefined();
  const configured: unknown = parsed.config.assets.run_worker_first;
  expect(Array.isArray(configured)).toBeTrue();
  if (!Array.isArray(configured)) throw new Error("Missing Worker routes");
  const expected = [...publicRoutes.map(route => route.pathname), ...legacyServiceRoutes.map(route => route.from), "/de", "/de/*", "/api/contact", "/api/health", "/api/security-report", "/audit/*", "/en/audit/*", "/fr/audit/*", "/datenschutz", "/en/datenschutz", "/fr/datenschutz"];
  expect([...configured].sort()).toEqual([...new Set([...expected, "/api/audit-visits", "/admin/audits", "/admin/audits/*"])].sort());
  const proxy = await Bun.file("src/proxy.ts").text();
  const matcher = proxy.match(/matcher:\s*(\[[\s\S]*?\])/);
  expect(matcher).not.toBeNull();
  const paths: unknown = ts.parseConfigFileTextToJson("matcher.json", `{"matcher": ${matcher![1]}}`).config.matcher;
  expect(paths).toEqual(["/", "/de", "/de/:path*", ...legacyServiceRoutes.map(route => route.from)]);
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

test("preserves legal disclosures, links, and dates without changing localized wording", () => {
  for (const locale of locales) expect(contentShape(legalContent[locale])).toEqual(contentShape(legalContent.de));
  expect(legalContent.de.privacy.updated).toBe("Stand: 26. September 2026");
  expect(legalContent.en.privacy.updated).toBe("Last updated: 26 September 2026");
  expect(legalContent.fr.privacy.updated).toBe("Mise à jour : 26 septembre 2026");
});

test("keeps service identities equivalent across locales", () => {
  const expectedIds = servicesContent.de.services.map(({ id }) => id);

  for (const locale of locales) {
    expect(servicesContent[locale].services.map(({ id }) => id)).toEqual(expectedIds);
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

test("keeps contact budget IDs unique and complete", () => {
  expect(new Set(budgetOptions.map(({ id }) => id)).size).toBe(budgetOptions.length);
  expect(budgetOptions).toHaveLength(5);
});

test("keeps legal page structure equivalent across locales", () => {
  const pageKinds = ["imprint", "privacy"] as const satisfies readonly LegalPageKind[];

  for (const kind of pageKinds) {
    const expectedSectionCount = legalContent.de[kind].sections.length;
    for (const locale of locales) {
      const page = legalContent[locale][kind];
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.intro.length).toBeGreaterThan(0);
      expect(page.sections).toHaveLength(expectedSectionCount);
      expect(page.sections.every(({ title }) => title.length > 0)).toBeTrue();
    }
  }
});

test("keeps localization dictionaries behind server-owned component boundaries", async () => {
  const clientFiles = [
    "src/components/site-header.tsx",
    "src/components/offer-overview.tsx",
    "src/components/contact-form.tsx",
  ] as const;
  const forbiddenRuntimeImports = ["@/lib/i18n", "@/lib/service-catalog", "@/i18n/translations", "@/i18n/services"];

  for (const path of clientFiles) {
    const source = await Bun.file(path).text();
    for (const moduleName of forbiddenRuntimeImports) {
      const runtimeImport = new RegExp(`import\\s+(?!type\\s).*from\\s+[\"']${moduleName.replaceAll("/", "\\/")}[\"']`);
      expect(runtimeImport.test(source), `${path} imports ${moduleName} at runtime`).toBeFalse();
    }
  }
});

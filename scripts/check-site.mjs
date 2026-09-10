import { siteOrigin } from "../src/lib/site-config.ts";
import { defaultLocale, locales } from "../src/i18n/config.ts";
import { publicRoutes, legacyServiceRoutes } from "../src/lib/public-routes.ts";

export async function checkSite(origin = siteOrigin, transport = fetch) {
  const checks = [
    ...publicRoutes.map(route => ({ path: route.pathname, status: 200, locale: route.locale, canonical: route.pathname })),
    ...locales.map(locale => ({ path: `${locale === defaultLocale ? "" : `/${locale}`}/__availability-missing-page`, status: 404, locale })),
    ...legacyServiceRoutes.map(route => ({ path: route.from, status: 308, destination: route.to })),
    { path: "/de/about", status: 307, destination: "/about" },
    { path: "/robots.txt", status: 200 },
    { path: "/sitemap.xml", status: 200 },
    { path: "/api/health", status: 200 },
    ...(origin === siteOrigin ? [
      { path: "http://suchio.net/en/contact?check=canonical", status: 308, destination: `${siteOrigin}/en/contact?check=canonical` },
      { path: "https://www.suchio.net/fr/about", status: 308, destination: `${siteOrigin}/fr/about` },
    ] : []),
  ];
  const failures = [];
  // Bound parallelism and check all routes even when an earlier check fails.
  for (let offset = 0; offset < checks.length; offset += 4) {
    await Promise.all(checks.slice(offset, offset + 4).map(async check => {
      try {
        const url = new URL(check.path, origin);
        const response = await transport(url, { redirect: "manual", signal: AbortSignal.timeout(10_000) });
        if (response.status !== check.status) throw new Error(`expected ${check.status}, received ${response.status}`);
        if (check.destination) {
          const destination = response.headers.get("location");
          if (!destination || new URL(destination, url).href !== new URL(check.destination, origin).href) throw new Error("incorrect redirect destination");
          await response.body?.cancel();
        } else if (check.path === "/api/health") {
          if ((await response.json()).ok !== true) throw new Error("contact configuration is not ready");
        } else {
          const body = await response.text();
          if (check.locale && (!body.includes(`lang="${check.locale}"`) || (body.match(/<h1\b/g) ?? []).length !== 1)) throw new Error("missing localized page content");
          if (check.canonical) {
            const canonical = body.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
            if (!canonical || new URL(canonical).href !== new URL(check.canonical, siteOrigin).href) throw new Error("missing canonical URL");
          }
          if (check.path === "/robots.txt" && !body.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)) throw new Error("missing sitemap directive");
          if (check.path === "/sitemap.xml" && !body.includes(`<loc>${siteOrigin}/fr/contact</loc>`)) throw new Error("missing localized sitemap entry");
        }
        console.log(`${check.path}: OK`);
      } catch (error) {
        failures.push(`${check.path}: ${error instanceof Error ? error.message : "check failed"}`);
      }
    }));
  }
  if (failures.length) throw new Error(failures.join("\n"));
}

if (import.meta.main) await checkSite(process.argv[2] ?? siteOrigin);

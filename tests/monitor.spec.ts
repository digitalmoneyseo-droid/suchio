import { expect, spyOn, test } from "bun:test";
import { legacyServiceRoutes, publicRoutes } from "../src/lib/public-routes";
import { siteOrigin } from "../src/lib/site-config";

type Transport = (...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>;
const { checkSite }: { checkSite: (origin: string, transport: Transport) => Promise<void> } = await import(new URL("../scripts/check-site.mjs", import.meta.url).href);

test("availability monitoring rejects delivery-readiness and redirect failures while finishing other checks", async () => {
  const paths: string[] = [];
  const log = spyOn(console, "log").mockImplementation(() => {});
  let healthy = true;
  const transport: Transport = async input => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    paths.push(url.pathname);
    const route = publicRoutes.find(route => route.pathname === url.pathname);
    if (route) return new Response(`<html lang="${route.locale}"><link rel="canonical" href="${route.pathname === "/" ? siteOrigin : siteOrigin + route.pathname}"><h1>Suchio</h1></html>`);
    if (url.pathname.endsWith("/__availability-missing-page")) return new Response(`<html lang="${url.pathname.startsWith("/en/") ? "en" : url.pathname.startsWith("/fr/") ? "fr" : "de"}"><h1>404</h1></html>`, { status: 404 });
    const redirect = legacyServiceRoutes.find(route => route.from === url.pathname);
    if (redirect) return new Response(null, { status: 308, headers: { Location: healthy ? redirect.to : "/wrong-page" } });
    if (url.pathname === "/de/about") return new Response(null, { status: 307, headers: { Location: "/about" } });
    if (url.pathname === "/robots.txt") return new Response(`Sitemap: ${siteOrigin}/sitemap.xml`);
    if (url.pathname === "/sitemap.xml") return new Response(`<loc>${siteOrigin}/fr/contact</loc>`);
    if (url.pathname === "/api/health") return Response.json({ ok: healthy });
    throw new Error("Unexpected check");
  };
  try {
    await checkSite("https://preview.example", transport);
    expect(paths).toContain("/fr/__availability-missing-page");
    expect(publicRoutes.every(route => paths.includes(route.pathname))).toBeTrue();
    healthy = false;
    paths.length = 0;
    await expect(checkSite("https://preview.example", transport)).rejects.toThrow("contact configuration is not ready");
    expect(paths).toContain("/sitemap.xml");
    expect(paths).toContain("/fr/services/ai-automation");
    await expect(checkSite("https://preview.example", transport)).rejects.toThrow("incorrect redirect destination");
  } finally { log.mockRestore(); }
});

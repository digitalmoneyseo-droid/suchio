import { contactError } from "./lib/contact-response";
import vinextHandler from "vinext/server/fetch-handler";
import { defaultLocale, hasLocale, localeCookie, type Locale } from "./i18n/config";
import { handleContactRequest } from "./lib/contact-handler";
import { securityHeaders } from "./lib/security-headers";
import { getLegacyServiceRedirectPath } from "./lib/service-routes";
import { healthResponse } from "./lib/health";
import { handleSecurityReport } from "./lib/security-report";

type CloudflareEnv = Pick<CloudflareBindings, "ASSETS" | "CONTACT_RATE_LIMITER"> & Partial<Pick<CloudflareBindings, "RESEND_API_KEY" | "CONTACT_EMAIL_FROM" | "CONTACT_EMAIL_TO">>;

interface CloudflareContext {
  passThroughOnException(): void;
  waitUntil(promise: Promise<unknown>): void;
}

function cookieLocale(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return undefined;

  const prefix = `${localeCookie}=`;
  const value = cookie.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
  return value && hasLocale(value) ? value : undefined;
}

function preferredLocale(request: Request): Locale {
  return cookieLocale(request) ?? defaultLocale;
}

function redirect(location: string, locale?: Locale, status = 307) {
  const headers = new Headers({ location });
  if (locale) {
    headers.set("set-cookie", `${localeCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
  }
  for (const { key, value } of securityHeaders) headers.set(key, value);
  return new Response(null, { headers, status });
}

function withSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  for (const { key, value } of securityHeaders) headers.set(key, value);
  return new Response(response.body, { headers, status: response.status, statusText: response.statusText });
}

async function handleContactRoute(request: Request, env: CloudflareEnv) {
  if (request.method !== "POST") {
    return withSecurityHeaders(new Response(null, { headers: { allow: "POST" }, status: 405 }));
  }

  try {
    // Anonymous form: a generous per-IP burst limit also permits shared networks.
    const ip = request.headers.get("cf-connecting-ip") ?? "local";
    const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: `suchio:contact:${ip}` });
    if (!success) return withSecurityHeaders(contactError("rate_limited", 60));
  } catch {
    console.error(JSON.stringify({ event: "contact.rate_limit_unavailable" }));
    return withSecurityHeaders(contactError("unavailable"));
  }

  const response = await handleContactRequest(request, {
    apiKey: env.RESEND_API_KEY,
    to: env.CONTACT_EMAIL_TO,
    from: env.CONTACT_EMAIL_FROM,
  });
  return withSecurityHeaders(response);
}

function isRscRequest(request: Request, url: URL) {
  return request.headers.get("rsc") === "1"
    || request.headers.get("accept")?.includes("text/x-component")
    || url.searchParams.has("_rsc");
}


const worker = {
  async fetch(request: Request, env: CloudflareEnv | undefined, context: CloudflareContext) {
    if (!env?.ASSETS) return vinextHandler.fetch(request, env, context);

    const url = new URL(request.url);

    const legacyServiceRedirect = getLegacyServiceRedirectPath(url.pathname);
    if (legacyServiceRedirect) {
      const locale = url.pathname.startsWith(`/${defaultLocale}/`) ? defaultLocale : undefined;
      return redirect(`${legacyServiceRedirect}${url.search}`, locale, 308);
    }

    if (url.pathname === "/" && (request.method === "GET" || request.method === "HEAD")) {
      const locale = preferredLocale(request);
      if (locale !== defaultLocale) return redirect(`/${locale}${url.search}`);
      return isRscRequest(request, url)
        ? withSecurityHeaders(await vinextHandler.fetch(request, env, context))
        : withSecurityHeaders(await env.ASSETS.fetch(request));
    }

    if (url.pathname === "/de" || url.pathname.startsWith("/de/")) {
      return redirect(`${url.pathname.slice(defaultLocale.length + 1) || "/"}${url.search}`, defaultLocale);
    }

    if (url.pathname === "/api/contact") return handleContactRoute(request, env);
    if (url.pathname === "/api/security-report") {
      if (request.method !== "POST") return withSecurityHeaders(await handleSecurityReport(request));
      try {
        const ip = request.headers.get("cf-connecting-ip") ?? "local";
        const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: `suchio:security-report:${ip}` });
        if (!success) return withSecurityHeaders(new Response(null, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } }));
      } catch {
        return withSecurityHeaders(new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } }));
      }
      return withSecurityHeaders(await handleSecurityReport(request));
    }
    if (url.pathname === "/api/health") {
      if (request.method !== "GET" && request.method !== "HEAD") return withSecurityHeaders(new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } }));
      return withSecurityHeaders(healthResponse({ apiKey: env.RESEND_API_KEY, to: env.CONTACT_EMAIL_TO, from: env.CONTACT_EMAIL_FROM }));
    }

    if (request.method === "GET" || request.method === "HEAD") return isRscRequest(request, url)
      ? withSecurityHeaders(await vinextHandler.fetch(request, env, context))
      : withSecurityHeaders(await env.ASSETS.fetch(request));
    return vinextHandler.fetch(request, env, context);
  },
};

export default worker;

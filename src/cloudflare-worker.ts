import { contactError } from "./lib/contact-response";
import { handle } from "@astrojs/cloudflare/handler";
import { defaultLocale, hasLocale, localeCookie, type Locale } from "./i18n/config";
import { handleContactRequest } from "./lib/contact-handler";
import { securityHeaders } from "./lib/security-headers";
import { getLegacyServiceRedirectPath } from "./lib/service-routes";
import { handleSecurityReport } from "./lib/security-report";
import { handleAuditVisit, purgeAuditVisits } from "./lib/audit-measurement";
import { handleAuditAdmin } from "./lib/audit-admin";
import { purgeAdminSessions } from "./lib/audit-admin-auth";

type CloudflareEnv = Pick<CloudflareBindings, "ASSETS" | "CONTACT_RATE_LIMITER" | "AUDIT_DB" | "AUDIT_ADMIN_EMAIL" | "AUDIT_ADMIN_PASSWORD_HASH"> & Partial<Pick<CloudflareBindings, "RESEND_API_KEY" | "CONTACT_EMAIL_FROM" | "CONTACT_EMAIL_TO">>;

function cookieLocale(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return undefined;

  const prefix = `${localeCookie}=`;
  const value = cookie.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
  return value && hasLocale(value) ? value : undefined;
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

const worker = {
  async scheduled(_controller: ScheduledController, env: CloudflareEnv) {
    await purgeAuditVisits(env.AUDIT_DB);
    await purgeAdminSessions(env.AUDIT_DB);
  },
  async fetch(request: Request, env: CloudflareEnv, context: ExecutionContext) {

    const url = new URL(request.url);
    if (url.pathname === "/admin/audits" || url.pathname.startsWith("/admin/audits/")) {
      try { return await handleAuditAdmin(request, env); }
      catch { return new Response("Auswertung vorübergehend nicht verfügbar.", { status: 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } }); }
    }
    if (url.pathname === "/api/audit-visits") {
      try {
        if (request.method === "POST") {
          const ip = request.headers.get("cf-connecting-ip") ?? "local";
          const limit = await env.CONTACT_RATE_LIMITER.limit({ key: `suchio:audit-consent:${ip}` });
          if (!limit.success) return new Response(null, { status: 429, headers: { "Cache-Control": "no-store" } });
        }
        return withSecurityHeaders(await handleAuditVisit(request, env.AUDIT_DB));
      } catch { return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } }); }
    }

    const legacyServiceRedirect = getLegacyServiceRedirectPath(url.pathname);
    if (legacyServiceRedirect) {
      const locale = url.pathname.startsWith(`/${defaultLocale}/`) ? defaultLocale : undefined;
      return redirect(`${legacyServiceRedirect}${url.search}`, locale, 308);
    }

    if (url.pathname === "/" && (request.method === "GET" || request.method === "HEAD")) {
      const locale = cookieLocale(request) ?? defaultLocale;
      if (locale !== defaultLocale) return redirect(`/${locale}${url.search}`);
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

    if (request.method === "GET" || request.method === "HEAD") {
      const response = await handle(request, env, context);
      if (response.status !== 404) return withSecurityHeaders(response);
      const locale = url.pathname.split("/")[1];
      const notFoundPath = hasLocale(locale) && locale !== defaultLocale ? `/${locale}/404` : "/404";
      const missing = await env.ASSETS.fetch(new Request(new URL(notFoundPath, url), { method: request.method }));
      return withSecurityHeaders(new Response(missing.body, { status: 404, headers: missing.headers }));
    }
    return withSecurityHeaders(await handle(request, env, context));
  },
} satisfies ExportedHandler<CloudflareEnv>;

export default worker;

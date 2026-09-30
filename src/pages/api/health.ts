import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { healthResponse } from "@/lib/health";

export const prerender = false;
export const ALL: APIRoute = ({ request }) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  return healthResponse({ apiKey: env.RESEND_API_KEY, to: env.CONTACT_EMAIL_TO, from: env.CONTACT_EMAIL_FROM });
};

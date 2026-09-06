import type { ContactEmailConfig } from "@/lib/contact-handler";

export function healthResponse(config: ContactEmailConfig) {
  const ok = Boolean(config.apiKey && config.to && config.from);
  return Response.json({ ok }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}

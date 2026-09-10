import { readLimitedJson } from "./request-body";

const directives = new Set(["default-src", "script-src", "script-src-elem", "script-src-attr", "style-src", "style-src-elem", "style-src-attr", "img-src", "font-src", "connect-src", "object-src", "base-uri", "form-action", "frame-ancestors", "frame-src", "worker-src", "media-src", "manifest-src"]);
function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

export async function handleSecurityReport(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { ...headers, Allow: "POST" } });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403, headers });
  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  if (contentType !== "application/csp-report" && contentType !== "application/reports+json") return new Response(null, { status: 415, headers });
  const parsed = await readLimitedJson(request, 16_000);
  if (!parsed.ok) return new Response(null, { status: parsed.status, headers });
  const envelope = record(parsed.value);
  const reports = Array.isArray(parsed.value) ? parsed.value.slice(0, 10).filter(item => record(item)?.type === "csp-violation").map(item => record(item)?.body) : [envelope?.["csp-report"]];
  const logged = new Set<string>();
  for (const value of reports) {
    const report = record(value);
    const directive = report?.["effective-directive"] ?? report?.effectiveDirective;
    if (typeof directive !== "string" || !directives.has(directive) || logged.has(directive)) continue;
    logged.add(directive);
    // Report bodies are untrusted and may contain URLs, query strings or inline personal data.
    // Only a finite directive name and policy disposition reach logs.
    console.warn(JSON.stringify({ event: "security.csp_violation", directive, disposition: report?.disposition === "enforce" ? "enforce" : "report" }));
  }
  return new Response(null, { status: 204, headers });
}

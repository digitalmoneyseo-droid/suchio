import reports from "../content/audits.json";
import { readLimitedBytes } from "./request-body";

export const consentVersion = "2026-09-26-v1";
export const retentionSeconds = 30 * 24 * 60 * 60;
export const auditReports = reports.map(({ code, company }) => ({ code, company }));
export const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
};

export function measurementResponse(value: unknown, status = 200) {
  return Response.json(value, { status, headers: privateHeaders });
}

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin
    && request.headers.get("sec-fetch-site") !== "cross-site";
}

export async function receiptHash(receipt: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(receipt));
  return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
}

export async function boundedText(body: ReadableStream<Uint8Array> | null, limit: number): Promise<string | null> {
  if (!body) return null;
  const bytes = await readLimitedBytes(body, limit);
  return bytes === null ? null : new TextDecoder().decode(bytes);
}

async function boundedJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return null;
  const text = await boundedText(request.body, 2048);
  if (text === null) return null;
  try {
    const body: unknown = JSON.parse(text);
    return body !== null && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch { return null; }
}

export async function purgeAuditVisits(db: D1Database, now = Date.now()) {
  await db.prepare("DELETE FROM audit_visits WHERE expires_at <= ?").bind(Math.floor(now / 1000)).run();
}

export async function handleAuditVisit(request: Request, db: D1Database | undefined, now = Date.now()) {
  if (request.method !== "POST" && request.method !== "DELETE") return measurementResponse({ error: "method" }, 405);
  if (!sameOrigin(request)) return measurementResponse({ error: "origin" }, 403);
  if (!db) return measurementResponse({ error: "unavailable" }, 503);
  const body = await boundedJson(request);
  if (!body || typeof body.code !== "string" || !auditReports.some(report => report.code === body.code)
    || typeof body.receipt !== "string" || !/^[a-f0-9]{64}$/.test(body.receipt)) return measurementResponse({ error: "invalid" }, 400);
  const hash = await receiptHash(body.receipt);
  if (request.method === "DELETE") {
    await db.prepare("DELETE FROM audit_visits WHERE receipt_hash = ? AND report_code = ?").bind(hash, body.code).run();
    return measurementResponse({ ok: true });
  }
  if (body.consent !== true || body.version !== consentVersion) return measurementResponse({ error: "consent_required" }, 400);
  // This endpoint is called only after a voluntary click. No passive page-view counting.
  if (/bot|crawler|spider|headless|preview/i.test(request.headers.get("user-agent") ?? "")
    || /prefetch|prerender/i.test(`${request.headers.get("purpose")} ${request.headers.get("sec-purpose")}`)) {
    return measurementResponse({ error: "not_counted" }, 400);
  }
  const seconds = Math.floor(now / 1000);
  const day = new Date(now).toISOString().slice(0, 10);
  await db.prepare("INSERT OR IGNORE INTO audit_visits (receipt_hash, report_code, day, consent_version, expires_at) VALUES (?, ?, ?, ?, ?)")
    .bind(hash, body.code, day, consentVersion, seconds + retentionSeconds).run();
  return measurementResponse({ ok: true });
}

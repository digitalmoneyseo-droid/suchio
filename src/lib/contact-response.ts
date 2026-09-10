export type ContactErrorCode = "forbidden" | "unsupported_content" | "too_large" | "invalid_request" | "invalid_fields" | "unavailable" | "delivery_failed" | "rate_limited";

const failures: Record<ContactErrorCode, readonly [status: number, message: string]> = {
  forbidden: [403, "Forbidden"],
  unsupported_content: [415, "Unsupported content type"],
  too_large: [413, "Request too large"],
  invalid_request: [400, "Invalid request"],
  invalid_fields: [400, "Invalid form data"],
  unavailable: [503, "Email service unavailable"],
  delivery_failed: [502, "Email delivery failed"],
  rate_limited: [429, "Too many requests"],
};

export function contactError(code: ContactErrorCode, retryAfter?: number) {
  const [status, error] = failures[code];
  return Response.json({ error, code }, { status, headers: { "Cache-Control": "no-store", ...(retryAfter === undefined ? {} : { "Retry-After": String(retryAfter) }) } });
}

export function retryAfterSeconds(value: string | null, now = Date.now()): number {
  const seconds = value && /^\d+$/.test(value.trim()) ? Number(value) : value ? (Date.parse(value) - now) / 1000 : 60;
  return Number.isFinite(seconds) ? Math.min(3600, Math.max(1, Math.ceil(seconds))) : 60;
}

import { expect, spyOn, test } from "bun:test";
import { buildContactEmail, handleContactRequest } from "../src/lib/contact-handler";
import { retryAfterSeconds } from "../src/lib/contact-response";

const validEnquiry = {
  name: "Audit example", email: "audit@example.com", company: "", companyUrl: "",
  service: "not-sure", budget: "budget-5", message: "A synthetic enquiry for automated verification.",
  locale: "en", website: "", submissionId: "d0d5bcd1-e816-42af-894c-3eac734a502d",
};
function enquiryRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://suchio.net/api/contact", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
}

test("rejects oversized actual bodies regardless of the declared length", async () => {
  const variants: Record<string, string>[] = [{}, { "content-length": "1" }];
  for (const headers of variants) {
    const response = await handleContactRequest(enquiryRequest({ ...validEnquiry, padding: "é".repeat(12_000) }, headers), {});
    expect(response.status).toBe(413);
  }
});

test("rejects malformed JSON, spoofed forwarded hosts, and invalid fields before delivery", async () => {
  const malformed = new Request("https://suchio.net/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
  expect((await handleContactRequest(malformed, {})).status).toBe(400);
  expect((await handleContactRequest(enquiryRequest(validEnquiry, { origin: "https://attacker.example", "x-forwarded-host": "attacker.example" }), {})).status).toBe(403);
  for (const changes of [{ service: "" }, { budget: "invalid" }, { locale: "xx" }, { submissionId: "invalid" }, { companyUrl: "javascript:alert(1)" }]) {
    expect((await handleContactRequest(enquiryRequest({ ...validEnquiry, ...changes }), {})).status).toBe(400);
  }
});

test("sends the same provider idempotency key on retries", async () => {
  const keys: (string | null)[] = [];
  const transport = async (url: string, init: RequestInit) => {
    expect(url).toBe("https://api.resend.com/emails");
    keys.push(new Headers(init.headers).get("idempotency-key"));
    expect(init.signal).toBeDefined();
    const body = JSON.parse(String(init.body));
    expect(body.reply_to).toBe(validEnquiry.email);
    return Response.json({ id: "test-email" });
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await handleContactRequest(enquiryRequest(validEnquiry), { apiKey: "test", from: "test@example.com", to: "test@example.com" }, transport);
    expect(response.status).toBe(200);
  }
  expect(keys).toEqual([`contact/${validEnquiry.submissionId}`, `contact/${validEnquiry.submissionId}`]);
});

test("logs operational events without enquiry contents or credentials", async () => {
  const info = spyOn(console, "info").mockImplementation(() => {});
  const error = spyOn(console, "error").mockImplementation(() => {});
  try {
    const config = { apiKey: "private-test-key", from: "sender@example.com", to: "recipient@example.com" };
    for (const transport of [async () => Response.json({ id: "provider-id" }), async () => new Response(null, { status: 403 }), async () => { throw new Error(validEnquiry.email); }]) {
      await handleContactRequest(enquiryRequest(validEnquiry), config, transport);
    }
    await handleContactRequest(enquiryRequest(validEnquiry), {});
    const logs = [...info.mock.calls, ...error.mock.calls].map(call => JSON.parse(String(call[0])));
    expect(logs.map(log => log.event).sort()).toEqual(["contact.accepted", "contact.failed", "contact.rejected", "contact.unconfigured"]);
    for (const value of [validEnquiry.name, validEnquiry.email, validEnquiry.message, ...Object.values(config)]) expect(JSON.stringify(logs)).not.toContain(value);
    for (const log of logs) expect(Object.keys(log).every(key => ["event", "submissionId", "emailId", "status"].includes(key))).toBeTrue();
  } finally {
    info.mockRestore();
    error.mockRestore();
  }
});

test("returns stable error codes and interprets retry delays safely", async () => {
  const response = await handleContactRequest(enquiryRequest({ ...validEnquiry, service: "unknown" }), {});
  expect(await response.json()).toMatchObject({ code: "invalid_fields" });
  expect(response.headers.get("cache-control")).toBe("no-store");
  const now = Date.parse("2026-09-07T12:00:00Z");
  expect(retryAfterSeconds("120", now)).toBe(120);
  expect(retryAfterSeconds("Mon, 07 Sep 2026 12:00:30 GMT", now)).toBe(30);
  expect(retryAfterSeconds("not-a-date", now)).toBe(60);
  expect(retryAfterSeconds(null, now)).toBe(60);
  expect(retryAfterSeconds("99999999", now)).toBe(3600);
});

test("returns a controlled failure for provider rejection, malformed success, and network failure", async () => {
  const config = { apiKey: "test", from: "test@example.com", to: "test@example.com" };
  for (const transport of [async () => new Response(null, { status: 429 }), async () => Response.json({}), async () => { throw new Error("offline"); }]) {
    expect((await handleContactRequest(enquiryRequest(validEnquiry), config, transport)).status).toBe(502);
  }
});

test("formats every contact email in German and states the visitor language", () => {
  const email = buildContactEmail({
    name: "Alex Example",
    email: "alex@example.com",
    company: "Example Ltd.",
    companyUrl: "https://example.com",
    serviceId: "seo-ai-visibility",
    budgetId: "budget-2",
    message: "We need more visibility in search.",
    locale: "en",
  });

  expect(email.subject).toBe("Projektanfrage: Alex Example");
  expect(email.text).toContain("Sprache: Englisch (en)");
  expect(email.text).toContain("Unternehmensname: Example Ltd.");
  expect(email.text).toContain("Wobei können wir helfen?: SEO & KI-Sichtbarkeit");
  expect(email.text).toContain("Geplanter Projektrahmen: 5.000 € bis 15.000 €");
  expect(email.text).toContain("Projekt und Ziel:\nWe need more visibility in search.");
  expect(email.text).not.toContain("Project inquiry");
  expect(email.text).not.toContain("Company name");
  expect(email.html).toContain("Neue Projektanfrage");
  expect(email.html).toContain("Kontaktdaten und Rahmen");
  expect(email.html).toContain('<th scope="row"');
  expect(email.html).toContain('href="mailto:alex@example.com"');
  expect(email.html).toContain("We need more visibility in search.");
});

test("escapes submitted values in the HTML contact email", () => {
  const email = buildContactEmail({
    name: "Alex <script>alert(1)</script>",
    email: "alex@example.com",
    company: "Example & Partners",
    companyUrl: "https://example.com/?a=1&b=2",
    serviceId: "not-sure",
    budgetId: "budget-5",
    message: "First line\n<img src=x onerror=alert(1)>",
    locale: "de",
  });

  expect(email.html).not.toContain("<script>");
  expect(email.html).not.toContain("<img");
  expect(email.html).toContain("Alex &lt;script&gt;alert(1)&lt;/script&gt;");
  expect(email.html).toContain("Example &amp; Partners");
  expect(email.html).toContain("First line<br>&lt;img src=x onerror=alert(1)&gt;");
});

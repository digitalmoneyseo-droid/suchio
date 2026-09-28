import { expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { auditReports, consentVersion, handleAuditVisit, purgeAuditVisits, receiptHash, retentionSeconds } from "../src/lib/audit-measurement";
import { createAdminSession, deleteAdminSession, isAuditAdmin, purgeAdminSessions, validAdminPassword } from "../src/lib/audit-admin-auth";
import { handleAuditAdmin, renderAuditDashboard } from "../src/lib/audit-admin";
import { measurementConsentVersion, measurementCopy } from "../src/i18n/audit-measurement";

const awaitedSessionSchema = await Bun.file("migrations/audit-visits/0002_admin_sessions.sql").text();
const schema = await Bun.file("migrations/audit-visits/0001_visits.sql").text();
function database() {
  const sqlite = new Database(":memory:");
  sqlite.exec(schema);
  sqlite.exec(awaitedSessionSchema);
  const db = {
    prepare(sql: string) {
      function statement(values: (string | number)[] = []) {
        return {
          bind(...next: (string | number)[]) { return statement(next); },
          async run() { return sqlite.query(sql).run(...values); },
          async first() { return sqlite.query(sql).get(...values); },
          async all() { return { results: sqlite.query(sql).all(...values), success: true }; },
        };
      }
      return statement();
    },
  } as unknown as D1Database;
  return { db, sqlite };
}
const code = auditReports[0].code;
const body = { code, receipt: "a".repeat(64), consent: true, version: consentVersion };
function request(value: unknown = body, method = "POST", origin = "https://suchio.net") {
  return new Request("https://suchio.net/api/audit-visits", { method, headers: { Origin: origin, "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" }, ...(method === "GET" ? {} : { body: JSON.stringify(value) }) });
}

test("no consent, cross-origin, unknown codes and passive GET cannot create statistics", async () => {
  const { db, sqlite } = database();
  for (const req of [request(body, "GET"), request({ ...body, consent: false }), request({ ...body, version: "old" }), request({ ...body, code: "unknown" }), request(body, "POST", "https://evil.example")]) {
    expect((await handleAuditVisit(req, db)).status).toBeGreaterThanOrEqual(400);
  }
  expect(sqlite.query("SELECT COUNT(*) AS n FROM audit_visits").get()).toEqual({ n: 0 });
  sqlite.close();
});

test("one consent is idempotent, has no stored IP or raw receipt, and can be withdrawn", async () => {
  const { db, sqlite } = database();
  const now = Date.parse("2026-09-26T12:00:00Z");
  for (let i = 0; i < 2; i++) expect((await handleAuditVisit(request(), db, now)).status).toBe(200);
  const rows = sqlite.query("SELECT * FROM audit_visits").all();
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ report_code: code, day: "2026-09-26", consent_version: consentVersion, expires_at: now / 1000 + retentionSeconds });
  expect(JSON.stringify(rows)).not.toContain(body.receipt);
  expect(Object.keys(rows[0] as object).sort()).toEqual(["consent_version", "day", "expires_at", "receipt_hash", "report_code"]);
  await handleAuditVisit(request({ ...body, receipt: "b".repeat(64) }, "DELETE"), db, now);
  expect(sqlite.query("SELECT COUNT(*) AS n FROM audit_visits").get()).toEqual({ n: 1 });
  expect((await handleAuditVisit(request(body, "DELETE"), db, now)).status).toBe(200);
  expect(sqlite.query("SELECT COUNT(*) AS n FROM audit_visits").get()).toEqual({ n: 0 });
  sqlite.close();
});

test("retention expires at 30 days and cleanup removes only expired receipts", async () => {
  const { db, sqlite } = database();
  const now = Date.parse("2026-09-26T12:00:00Z");
  await handleAuditVisit(request(), db, now);
  await handleAuditVisit(request({ ...body, receipt: "b".repeat(64) }), db, now + 86400000);
  await purgeAuditVisits(db, now + retentionSeconds * 1000);
  expect(sqlite.query("SELECT COUNT(*) AS n FROM audit_visits").get()).toEqual({ n: 1 });
  sqlite.close();
});

test("oversized bodies and previews are not counted; responses cannot be cached", async () => {
  const { db, sqlite } = database();
  expect((await handleAuditVisit(request({ ...body, padding: "x".repeat(3000) }), db)).status).toBe(400);
  const preview = request(); preview.headers.set("sec-purpose", "prefetch");
  expect((await handleAuditVisit(preview, db)).status).toBe(400);
  const response = await handleAuditVisit(request(), undefined);
  expect(response.status).toBe(503);
  expect(response.headers.get("cache-control")).toContain("no-store");
  sqlite.close();
});

test("only the generated credential authenticates; sessions expire, revoke and resist forgery", async () => {
  const { db, sqlite } = database();
  const password = "c".repeat(64);
  const config = { AUDIT_ADMIN_EMAIL: "contact@suchio.net", AUDIT_ADMIN_PASSWORD_HASH: await receiptHash(password) };
  expect(await validAdminPassword(config.AUDIT_ADMIN_EMAIL, password, config)).toBeTrue();
  expect(await validAdminPassword("other@example.com", password, config)).toBeFalse();
  expect(await validAdminPassword(config.AUDIT_ADMIN_EMAIL, "wrong", config)).toBeFalse();
  const now = Date.now();
  const cookie = await createAdminSession(db, config, now);
  expect(cookie).toContain("Secure; HttpOnly; SameSite=Strict; Max-Age=3600");
  const req = new Request("https://suchio.net/admin/audits", { headers: { cookie } });
  expect(await isAuditAdmin(req, config, db, now)).toBeTrue();
  expect(await isAuditAdmin(req, { ...config, AUDIT_ADMIN_PASSWORD_HASH: "f".repeat(64) }, db, now)).toBeFalse();
  expect(await isAuditAdmin(req, config, db, now + 3600000)).toBeFalse();
  expect(await isAuditAdmin(new Request(req.url, { headers: { "cf-access-authenticated-user-email": config.AUDIT_ADMIN_EMAIL, cookie: "__Host-suchio-audit-session=" + "a".repeat(64) } }), config, db)).toBeFalse();
  await deleteAdminSession(req, db);
  expect(await isAuditAdmin(req, config, db, now)).toBeFalse();
  await createAdminSession(db, config, now);
  await purgeAdminSessions(db, now + 3600000);
  expect(sqlite.query("SELECT COUNT(*) AS n FROM audit_admin_sessions").get()).toEqual({ n: 0 });
  sqlite.close();
});

test("admin login enforces origin, size and rate limit before issuing a session", async () => {
  const { db, sqlite } = database();
  const password = "d".repeat(64);
  const env = {
    AUDIT_ADMIN_EMAIL: "contact@suchio.net", AUDIT_ADMIN_PASSWORD_HASH: await receiptHash(password), AUDIT_DB: db,
    ASSETS: { fetch: async () => new Response("unavailable", { status: 404 }), connect: () => { throw new Error("Not used"); } } satisfies Fetcher,
    CONTACT_RATE_LIMITER: { limit: async () => ({ success: true }) },
  };
  const login = (origin = "https://suchio.net", value = password) => new Request("https://suchio.net/admin/audits/login", { method: "POST", headers: { Origin: origin, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ email: env.AUDIT_ADMIN_EMAIL, password: value }) });
  expect((await handleAuditAdmin(login("https://evil.example"), env)).status).toBe(403);
  expect((await handleAuditAdmin(login(undefined, "x".repeat(2000)), env)).status).toBe(413);
  expect((await handleAuditAdmin(login(undefined, "wrong"), env)).status).toBe(401);
  expect((await handleAuditAdmin(login(), { ...env, CONTACT_RATE_LIMITER: { limit: async () => ({ success: false }) } })).status).toBe(429);
  expect(sqlite.query("SELECT COUNT(*) AS n FROM audit_admin_sessions").get()).toEqual({ n: 0 });
  const accepted = await handleAuditAdmin(login(), env);
  expect(accepted.status).toBe(303);
  const cookie = accepted.headers.get("set-cookie")!;
  const dashboard = await handleAuditAdmin(new Request("https://suchio.net/admin/audits", { headers: { cookie } }), env);
  expect(dashboard.status).toBe(200);
  expect(await dashboard.text()).toContain("Berichtaufrufe im Blick");
  const forbidden = await handleAuditAdmin(new Request("https://suchio.net/admin/audits/delete", { method: "POST", headers: { Origin: "https://evil.example", cookie } }), env);
  expect(forbidden.status).toBe(403);
  const loggedOut = await handleAuditAdmin(new Request("https://suchio.net/admin/audits/logout", { method: "POST", headers: { Origin: "https://suchio.net", cookie } }), env);
  expect(loggedOut.status).toBe(303);
  expect(await isAuditAdmin(new Request("https://suchio.net/admin/audits", { headers: { cookie } }), env, db)).toBeFalse();
  sqlite.close();
});

test("dashboard distinguishes empty statistics from untested links and escapes notices", () => {
  const html = renderAuditDashboard([], [], "<script>bad()</script>");
  expect(html).toContain("Link noch nicht geprüft");
  expect(html).toContain("keine Zustimmung erfasst");
  expect(html).toContain("audit_preview=1");
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;");
});

test("client and server consent version match, with an explicit decline in every locale", () => {
  expect(measurementConsentVersion).toBe(consentVersion);
  for (const copy of Object.values(measurementCopy)) {
    expect(copy.accept.length).toBeGreaterThan(0);
    expect(copy.decline.length).toBeGreaterThan(0);
    expect(copy.withdraw.length).toBeGreaterThan(0);
  }
});

import { receiptHash } from "./audit-measurement";

export type AuditAdminConfig = { [K in keyof Pick<CloudflareBindings, "AUDIT_ADMIN_EMAIL" | "AUDIT_ADMIN_PASSWORD_HASH">]: string };
const cookieName = "__Host-suchio-audit-session";
const sessionSeconds = 3600;

export function adminConfigured(config: AuditAdminConfig) {
  return !!config.AUDIT_ADMIN_EMAIL && /^[a-f0-9]{64}$/.test(config.AUDIT_ADMIN_PASSWORD_HASH ?? "");
}

// Setup generates 256 random bits. Do not substitute a human password:
// SHA-256 is appropriate here only because the credential is a high-entropy secret.
export async function validAdminPassword(email: string, password: string, config: AuditAdminConfig) {
  if (!adminConfigured(config)) return false;
  const actual = await receiptHash(password);
  let difference = 0;
  for (let i = 0; i < 64; i++) difference |= actual.charCodeAt(i) ^ config.AUDIT_ADMIN_PASSWORD_HASH.charCodeAt(i);
  return difference === 0 && email.toLowerCase() === config.AUDIT_ADMIN_EMAIL.toLowerCase();
}

function sessionToken(request: Request) {
  const prefix = `${cookieName}=`;
  const token = request.headers.get("cookie")?.split(";").map(item => item.trim()).find(item => item.startsWith(prefix))?.slice(prefix.length);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function sessionCookie(token: string, maxAge = sessionSeconds) {
  return `${cookieName}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

export async function createAdminSession(db: D1Database, config: AuditAdminConfig, now = Date.now()) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, "0")).join("");
  await db.prepare("INSERT INTO audit_admin_sessions (token_hash, email, credential_version, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await receiptHash(token), config.AUDIT_ADMIN_EMAIL.toLowerCase(), config.AUDIT_ADMIN_PASSWORD_HASH, Math.floor(now / 1000) + sessionSeconds).run();
  return sessionCookie(token);
}

export async function isAuditAdmin(request: Request, config: AuditAdminConfig, db: D1Database, now = Date.now()) {
  const token = sessionToken(request);
  if (!token || !adminConfigured(config)) return false;
  const result = await db.prepare("SELECT email, credential_version FROM audit_admin_sessions WHERE token_hash = ? AND expires_at > ?")
    .bind(await receiptHash(token), Math.floor(now / 1000)).first<{ email: string; credential_version: string }>();
  return result?.email === config.AUDIT_ADMIN_EMAIL.toLowerCase() && result.credential_version === config.AUDIT_ADMIN_PASSWORD_HASH;
}

export async function deleteAdminSession(request: Request, db: D1Database) {
  const token = sessionToken(request);
  if (token) await db.prepare("DELETE FROM audit_admin_sessions WHERE token_hash = ?").bind(await receiptHash(token)).run();
  return sessionCookie("", 0);
}

export async function purgeAdminSessions(db: D1Database, now = Date.now()) {
  await db.prepare("DELETE FROM audit_admin_sessions WHERE expires_at <= ?").bind(Math.floor(now / 1000)).run();
}

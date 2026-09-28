import { adminConfigured, createAdminSession, deleteAdminSession, isAuditAdmin, validAdminPassword, type AuditAdminConfig } from "./audit-admin-auth";
import { auditReports, boundedText, measurementResponse, privateHeaders, purgeAuditVisits, sameOrigin } from "./audit-measurement";

type Env = AuditAdminConfig & Pick<CloudflareBindings, "AUDIT_DB" | "ASSETS" | "CONTACT_RATE_LIMITER">;
// Preserve same-origin form Origin headers; no-referrer can turn them into "null".
const adminHeaders = { ...privateHeaders, "Referrer-Policy": "same-origin", "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'", "X-Content-Type-Options": "nosniff", "Strict-Transport-Security": "max-age=31536000" };

function loginPage(error = "", status = 200) {
  return new Response(`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anmelden · Suchio</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f7fa;color:#172130;font:16px/1.6 system-ui,sans-serif}main{max-width:480px;margin:8vh auto;padding:28px}h1{font-size:32px;line-height:1.2}label{display:block;margin-top:20px}input,button{width:100%;min-height:48px;font:inherit;border:1px solid #aab4c2;border-radius:6px;padding:10px;background:white;color:#172130}input:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #0064d1;outline-offset:3px}button{margin-top:24px;background:#005bbe;color:white;border-color:#005bbe;cursor:pointer}a{color:#005bbe}.error{color:#a11224}p{color:#475569}</style></head><body><main><strong>Suchio · Interner Bereich</strong><h1>Audit-Auswertung</h1><p>Melde dich mit deinem Suchio-Zugang an. Die Sitzung endet nach einer Stunde.</p>${error ? `<p role="alert" class="error">${html(error)}</p>` : ""}<form method="post" action="/admin/audits/login"><label for="email">E-Mail</label><input id="email" name="email" type="email" autocomplete="username" required maxlength="254"><label for="password">Passwort</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="128"><button>Anmelden</button></form><p><a href="/datenschutz#audit-auswertung">Datenschutz</a></p></main></body></html>`, { status, headers: adminHeaders });
}
function html(value: string) { return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!); }
type DayCount = { report_code: string; day: string; count: number };
type LinkCheck = { report_code: string; checked_at: string; ok: number };

export function renderAuditDashboard(rows: DayCount[], checks: LinkCheck[], notice = "") {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Audit-Auswertung · Suchio</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f5f7fa;color:#172130;font:16px/1.6 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:40px 24px}h1{font-size:clamp(28px,5vw,44px);line-height:1.2}a{color:#005bbe}button{font:inherit;cursor:pointer;border:1px solid #aab4c2;border-radius:6px;background:white;color:#172130;padding:10px 14px;min-height:44px}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid #0064d1;outline-offset:3px}.lead{max-width:780px;color:#475569}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:20px}.card{background:white;border:1px solid #dce2e9;border-radius:12px;padding:24px;min-width:0}.card h2{margin-top:0;font-size:22px;overflow-wrap:anywhere}.number{font-size:32px;font-weight:700}.muted{font-size:14px;color:#475569}.actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center}.actions a{padding:10px 0}details{margin-top:18px}summary{cursor:pointer;min-height:40px}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:6px;border-bottom:1px solid #e2e8f0}.notice{padding:16px;background:#e8f1fc;border-left:4px solid #0064d1}header{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px}</style></head><body><main>
  <header><strong>Suchio · Interner Bereich</strong><form method="post" action="/admin/audits/logout"><button>Abmelden</button></form></header>
  <h1>Berichtaufrufe im Blick</h1><p class="lead">${total} bestätigte Aufrufe in den letzten 30 Tagen. Gezählt wird nur nach freiwilliger Zustimmung. Das sind keine eindeutigen Personen, vollständigen Besucherzahlen oder bestätigten Anfragen. Tage werden in UTC angegeben.</p>
  <p class="muted">Vorschaulinks zählen nicht. Die technische Prüfung kontrolliert die veröffentlichte Datei unabhängig von Besucherzustimmungen. Ohne Prüfung erscheint kein grüner Status.</p>
  ${notice ? `<p class="notice" role="status">${html(notice)}</p>` : ""}<div class="cards">${auditReports.map(report => {
    const days = rows.filter(row => row.report_code === report.code).sort((a, b) => b.day.localeCompare(a.day));
    const count = days.reduce((sum, row) => sum + row.count, 0);
    const check = checks.find(item => item.report_code === report.code);
    return `<article class="card"><h2>${html(report.company)}</h2><div class="number">${count}</div><p class="muted">Bestätigte Aufrufe · zuletzt: ${html(days[0]?.day ?? "keine Zustimmung erfasst")}</p><p>${check ? `${check.ok ? "Linkprüfung bestanden" : "Linkprüfung fehlgeschlagen"} · ${html(check.checked_at)}` : "Link noch nicht geprüft"}</p>
    <div class="actions"><a href="/audit/${encodeURIComponent(report.code)}?audit_preview=1" target="_blank" rel="noreferrer">Bericht ansehen</a><form method="post" action="/admin/audits/check"><input type="hidden" name="code" value="${html(report.code)}"><button>Link prüfen</button></form></div>
    <details><summary>Verlauf pro Tag</summary>${days.length ? `<table><thead><tr><th>Tag (UTC)</th><th>Bestätigte Aufrufe</th></tr></thead><tbody>${days.map(day => `<tr><td>${html(day.day)}</td><td>${day.count}</td></tr>`).join("")}</tbody></table>` : "<p>Noch keine bestätigten Aufrufe.</p>"}</details>
    <details><summary>Messdaten löschen</summary><p class="muted">Entfernt alle gespeicherten Aufrufe dieses Berichts, zum Beispiel bei Widerruf oder Kampagnenende. Der Bericht bleibt erreichbar.</p><form method="post" action="/admin/audits/delete"><input type="hidden" name="code" value="${html(report.code)}"><label><input type="checkbox" name="confirm" value="yes" required> Messdaten dieses Berichts endgültig löschen</label><p><button>Messdaten löschen</button></p></form></details></article>`;
  }).join("")}</div><p class="muted">Messdaten verlassen die Auswertung nach 30 Tagen; die automatische Bereinigung läuft stündlich. <a href="/datenschutz#audit-auswertung">Datenschutz</a></p></main></body></html>`;
}

export async function handleAuditAdmin(request: Request, env: Env) {
  const path = new URL(request.url).pathname;
  if (!adminConfigured(env)) return measurementResponse({ error: "Admin-Zugang noch nicht eingerichtet." }, 503);
  if (!env.AUDIT_DB) return measurementResponse({ error: "Auswertung nicht verfügbar." }, 503);
  if (request.method === "POST" && !sameOrigin(request)) return measurementResponse({ error: "origin" }, 403);
  if (path === "/admin/audits/login") {
    if (request.method === "GET") return loginPage();
    if (request.method !== "POST") return measurementResponse({ error: "method" }, 405);
    const ip = request.headers.get("cf-connecting-ip") ?? "local";
    const limit = await env.CONTACT_RATE_LIMITER.limit({ key: `suchio:audit-login:${ip}` });
    if (!limit.success) return loginPage("Zu viele Versuche. Bitte in einer Minute erneut versuchen.", 429);
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return measurementResponse({ error: "content_type" }, 400);
    const text = await boundedText(request.body, 1024);
    if (text === null) return measurementResponse({ error: "size" }, 413);
    const form = new URLSearchParams(text);
    if (!await validAdminPassword(form.get("email")?.trim() ?? "", form.get("password") ?? "", env)) return loginPage("E-Mail oder Passwort stimmt nicht.", 401);
    const cookie = await createAdminSession(env.AUDIT_DB, env);
    return new Response(null, { status: 303, headers: { ...privateHeaders, "Set-Cookie": cookie, location: "/admin/audits" } });
  }
  if (path === "/admin/audits/logout") {
    if (request.method !== "POST") return measurementResponse({ error: "method" }, 405);
    return new Response(null, { status: 303, headers: { ...privateHeaders, "Set-Cookie": await deleteAdminSession(request, env.AUDIT_DB), location: "/admin/audits/login" } });
  }
  if (!await isAuditAdmin(request, env, env.AUDIT_DB)) {
    if (request.method === "GET" && path === "/admin/audits") return new Response(null, { status: 303, headers: { ...privateHeaders, location: "/admin/audits/login" } });
    return measurementResponse({ error: "Nicht autorisiert." }, 403);
  }
  if (request.method === "POST" && (path === "/admin/audits/check" || path === "/admin/audits/delete")) {
    if (!sameOrigin(request)) return measurementResponse({ error: "origin" }, 403);
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return measurementResponse({ error: "content_type" }, 400);
    const text = await boundedText(request.body, 1024);
    if (text === null) return measurementResponse({ error: "size" }, 413);
    const form = new URLSearchParams(text);
    const report = auditReports.find(item => item.code === form.get("code"));
    if (!report) return measurementResponse({ error: "unknown_report" }, 400);
    if (path.endsWith("/delete")) {
      if (form.get("confirm") !== "yes") return measurementResponse({ error: "confirmation" }, 400);
      await env.AUDIT_DB.prepare("DELETE FROM audit_visits WHERE report_code = ?").bind(report.code).run();
    } else {
      const response = await env.ASSETS.fetch(new Request(new URL(`/audit/${report.code}`, request.url), { headers: { accept: "text/html" } }));
      const content = await boundedText(response.body, 2 * 1024 * 1024);
      const ok = response.status === 200 && response.headers.get("content-type")?.includes("text/html") && !!content?.includes(`data-audit-code="${report.code}"`);
      await env.AUDIT_DB.prepare("INSERT INTO audit_link_checks (report_code, checked_at, ok) VALUES (?, ?, ?) ON CONFLICT(report_code) DO UPDATE SET checked_at=excluded.checked_at, ok=excluded.ok")
        .bind(report.code, new Date().toISOString(), ok ? 1 : 0).run();
    }
    return new Response(null, { status: 303, headers: { ...privateHeaders, location: `/admin/audits?done=${path.endsWith("/delete") ? "deleted" : "checked"}` } });
  }
  if (request.method !== "GET" || path !== "/admin/audits") return measurementResponse({ error: "not_found" }, 404);
  await purgeAuditVisits(env.AUDIT_DB);
  const seconds = Math.floor(Date.now() / 1000);
  const rows = await env.AUDIT_DB.prepare("SELECT report_code, day, COUNT(*) AS count FROM audit_visits WHERE expires_at > ? GROUP BY report_code, day ORDER BY day DESC").bind(seconds).all<DayCount>();
  const checks = await env.AUDIT_DB.prepare("SELECT report_code, checked_at, ok FROM audit_link_checks").all<LinkCheck>();
  const done = new URL(request.url).searchParams.get("done");
  return new Response(renderAuditDashboard(rows.results, checks.results, done === "deleted" ? "Die Messdaten wurden gelöscht." : done === "checked" ? "Die technische Linkprüfung wurde ausgeführt." : ""), {
    headers: adminHeaders,
  });
}

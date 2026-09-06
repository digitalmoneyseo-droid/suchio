import { readLimitedJson } from "@/lib/request-body";
import { getServiceCopy } from "@/i18n/services";
import { hasLocale, t, type Locale } from "@/lib/i18n";
import { isServiceId } from "@/lib/service-catalog";
import { budgetOptions, isBudgetId, type BudgetId } from "@/lib/contact-options";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactEmailLocale = "de" satisfies Locale;
const languageLabels = {
  de: "Deutsch",
  en: "Englisch",
  fr: "Französisch",
} satisfies Record<Locale, string>;

export interface ContactEmailConfig {
  apiKey?: string;
  from?: string;
  to?: string;
}

export async function handleContactRequest(request: Request, emailConfig: ContactEmailConfig, transport: (url: string, init: RequestInit) => Promise<Response> = fetch) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Unsupported content type" }, { status: 415 });
  const parsed = await readLimitedJson(request);
  if (!parsed.ok) return Response.json({ error: parsed.status === 413 ? "Request too large" : "Invalid request" }, { status: parsed.status });
  const { value } = parsed;
  if (!value || typeof value !== "object" || Array.isArray(value)) return Response.json({ error: "Invalid request" }, { status: 400 });

  const body = value as Record<string, unknown>;
  if (typeof body.website === "string" && body.website) return Response.json({ ok: true });

  const name = cleanString(body.name);
  const email = cleanString(body.email);
  const company = cleanString(body.company);
  const companyUrl = cleanString(body.companyUrl);
  const message = cleanString(body.message);
  const locale = typeof body.locale === "string" && hasLocale(body.locale) ? body.locale : null;
  const serviceId = typeof body.service === "string" ? body.service : "";
  const budgetId = typeof body.budget === "string" ? body.budget : "";
  const submissionId = cleanString(body.submissionId);

  if (
    !name || name.length > 100 ||
    !emailPattern.test(email) || email.length > 254 ||
    company.length > 120 ||
    companyUrl.length > 2048 || (companyUrl && !isHttpUrl(companyUrl)) ||
    !locale || !message || message.length < 20 || message.length > 5000 ||
    (!isServiceId(serviceId) && serviceId !== "not-sure") ||
    !isBudgetId(budgetId) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)
  ) {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const { apiKey, to, from } = emailConfig;
  if (!apiKey || !to || !from) {
    console.error(JSON.stringify({ event: "contact.unconfigured", submissionId }));
    return Response.json({ error: "Email service unavailable" }, { status: 503 });
  }

  const emailContent = buildContactEmail({
    name,
    email,
    company,
    companyUrl,
    serviceId,
    budgetId,
    message,
    locale,
  });

  try {
    const response = await transport("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `contact/${submissionId}` },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ from, to: [to], reply_to: email, subject: emailContent.subject, text: emailContent.text, html: emailContent.html }),
    });
    if (!response.ok) {
      console.error(JSON.stringify({ event: "contact.rejected", submissionId, status: response.status }));
      return Response.json({ error: "Email delivery failed" }, { status: 502 });
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("id" in data) || typeof data.id !== "string" || !data.id) throw new Error("Invalid provider response");
    console.info(JSON.stringify({ event: "contact.accepted", submissionId, emailId: data.id }));
    return Response.json({ ok: true, id: data.id }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error(JSON.stringify({ event: "contact.failed", submissionId }));
    return Response.json({ error: "Email delivery failed" }, { status: 502 });
  }
}

export function buildContactEmail({
  name,
  email,
  company,
  companyUrl,
  serviceId,
  budgetId,
  message,
  locale,
}: {
  name: string;
  email: string;
  company: string;
  companyUrl: string;
  serviceId: string;
  budgetId: BudgetId;
  message: string;
  locale: Locale;
}) {
  const service = isServiceId(serviceId)
    ? getServiceCopy(contactEmailLocale, serviceId).name
    : t(contactEmailLocale, "contact.formServiceUnsure");
  const budget = budgetLabel(contactEmailLocale, budgetId);
  const notProvided = t(contactEmailLocale, "contact.formNotProvided");
  const text = [
    `${t(contactEmailLocale, "contact.formBodyName")}: ${name}`,
    `${t(contactEmailLocale, "contact.formBodyEmail")}: ${email}`,
    `Sprache: ${languageLabels[locale]} (${locale})`,
    `${t(contactEmailLocale, "contact.formCompany")}: ${company || notProvided}`,
    `${t(contactEmailLocale, "contact.formCompanyUrl")}: ${companyUrl || notProvided}`,
    `${t(contactEmailLocale, "contact.formService")}: ${service}`,
    `${t(contactEmailLocale, "contact.formBudget")}: ${budget}`,
    "",
    `${t(contactEmailLocale, "contact.formBodyMessage")}:`,
    message,
  ].join("\n");
  const details = [
    { label: t(contactEmailLocale, "contact.formBodyName"), value: name },
    { label: t(contactEmailLocale, "contact.formBodyEmail"), value: email, href: `mailto:${email}` },
    { label: "Sprache", value: `${languageLabels[locale]} (${locale})` },
    { label: t(contactEmailLocale, "contact.formCompany"), value: company || notProvided },
    {
      label: t(contactEmailLocale, "contact.formCompanyUrl"),
      value: companyUrl || notProvided,
      href: companyUrl || undefined,
    },
    { label: t(contactEmailLocale, "contact.formService"), value: service },
    { label: t(contactEmailLocale, "contact.formBudget"), value: budget },
  ];
  const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Neue Projektanfrage von ${escapeHtml(name)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f2;color:#171717;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Neue Projektanfrage von ${escapeHtml(name)}</div>
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;background-color:#f4f4f2;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:16px;">
            <tr>
              <td style="padding:28px 36px 24px;border-top:4px solid #0075e8;border-radius:16px 16px 0 0;">
                <p style="margin:0 0 20px;color:#0075e8;font-size:15px;font-weight:700;letter-spacing:-0.01em;">suchio.</p>
                <h1 style="margin:0;color:#171717;font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;">Neue Projektanfrage</h1>
                <p style="margin:8px 0 0;color:#666666;font-size:14px;line-height:1.5;">Eingegangen über das Kontaktformular auf suchio.net</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 32px;">
                <h2 style="margin:0 0 12px;color:#171717;font-size:16px;line-height:1.4;font-weight:600;">Kontaktdaten und Rahmen</h2>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-top:1px solid #e5e5e5;">
                  ${details.map(renderEmailDetailRow).join("")}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 36px;">
                <h2 style="margin:0 0 12px;color:#171717;font-size:16px;line-height:1.4;font-weight:600;">${escapeHtml(t(contactEmailLocale, "contact.formBodyMessage"))}</h2>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;background-color:#f2f7ff;border:1px solid #d7e7ff;border-radius:12px;">
                  <tr>
                    <td style="padding:20px 22px;color:#171717;font-size:16px;line-height:1.6;">${escapeHtml(message).replaceAll("\n", "<br>")}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;color:#777777;font-size:12px;line-height:1.5;">Diese Nachricht wurde über das Suchio-Kontaktformular gesendet.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject: `${t(contactEmailLocale, "contact.formSubject")}: ${name}`,
    text,
    html,
  };
}

function renderEmailDetailRow({ label, value, href }: { label: string; value: string; href?: string }): string {
  const content = href
    ? `<a href="${escapeHtml(href)}" style="color:#005fbd;text-decoration:underline;text-underline-offset:2px;">${escapeHtml(value)}</a>`
    : escapeHtml(value);

  return `<tr>
    <th scope="row" align="left" valign="top" style="width:38%;padding:12px 12px 12px 0;border-bottom:1px solid #e5e5e5;color:#666666;font-size:13px;line-height:1.5;font-weight:400;">${escapeHtml(label)}</th>
    <td valign="top" style="padding:12px 0;border-bottom:1px solid #e5e5e5;color:#171717;font-size:14px;line-height:1.5;font-weight:600;overflow-wrap:anywhere;">${content}</td>
  </tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function budgetLabel(locale: Locale, budgetId: BudgetId): string {
  const option = budgetOptions.find(({ id }) => id === budgetId);
  if (!option) throw new Error(`Missing contact budget option ${budgetId}.`);
  return t(locale, option.messageKey);
}

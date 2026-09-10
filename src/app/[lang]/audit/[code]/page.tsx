import { notFound } from "next/navigation";
import { AuditPage } from "@/components/pages/audit-page";
import { audits, getAudit } from "@/lib/audits";
import { getRouteLocale } from "@/lib/locale-route";
import { noIndexPageMetadata } from "@/lib/site";
import { auditUi } from "@/i18n/audit-ui";

type Params = Promise<{ lang: string; code: string }>;
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return audits.map(({ code }) => ({ code })); }
export async function generateMetadata({ params }: { params: Params }) {
  const locale = await getRouteLocale(params);
  const { code } = await params;
  if (!getAudit(code)) notFound();
  return { ...noIndexPageMetadata({ locale, pathname: `/${locale}/audit/${code}`, title: auditUi[locale].label, description: auditUi[locale].linkNote }), referrer: "no-referrer" as const };
}
export default async function Page({ params }: { params: Params }) {
  const locale = await getRouteLocale(params);
  const audit = getAudit((await params).code);
  if (!audit) notFound();
  return <AuditPage audit={audit} locale={locale}/>;
}

import { LegalPage } from "@/components/pages/legal-page";
import { getRouteLocale, type LocaleRouteParams } from "@/lib/locale-route";
import { noIndexPageMetadata } from "@/lib/site";
import { prefixedLocales, t } from "@/lib/i18n";
export const dynamic = "force-static";
export function generateStaticParams() { return prefixedLocales.map(lang => ({ lang })); }
export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  const locale = await getRouteLocale(params);
  return noIndexPageMetadata({ locale, pathname: `/${locale}/privacy`, title: t(locale, "privacy.title"), description: t(locale, "meta.privacyDescription") });
}
export default async function Page({ params }: { params: LocaleRouteParams }) { return <LegalPage locale={await getRouteLocale(params)} kind="privacy"/>; }

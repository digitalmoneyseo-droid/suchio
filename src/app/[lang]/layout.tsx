import "../globals.css";
import { LocaleDocument } from "@/components/locale-document";
import { defaultLocale, hasLocale, prefixedLocales } from "@/lib/i18n";
import type { LocaleRouteParams } from "@/lib/locale-route";
import { rootMetadata, rootViewport } from "@/lib/site";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export function generateStaticParams() {
  return prefixedLocales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: LocaleRouteParams }) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  return <LocaleDocument locale={locale}>{children}</LocaleDocument>;
}

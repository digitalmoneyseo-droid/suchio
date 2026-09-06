import type { Metadata } from "next";
import { NotFoundPage } from "@/components/pages/not-found-page";
import { notFoundMessages } from "@/i18n/not-found";
import { localizePath, prefixedLocales } from "@/lib/i18n";
import { getRouteLocale, type LocaleRouteParams } from "@/lib/locale-route";

// Cloudflare serves the nearest static 404.html for unmatched URLs.
export const dynamic = "force-static";
export function generateStaticParams() { return prefixedLocales.map((lang) => ({ lang })); }
export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  return { title: notFoundMessages[locale].title, robots: { index: false, follow: true } };
}
export default async function Page({ params }: { params: LocaleRouteParams }) {
  const locale = await getRouteLocale(params);
  return <NotFoundPage copy={notFoundMessages[locale]} homeHref={localizePath("/", locale)} />;
}

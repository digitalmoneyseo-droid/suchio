import "../globals.css";
import { LocaleDocument } from "@/components/locale-document";
import { defaultLocale } from "@/lib/i18n";
import { rootMetadata, rootViewport } from "@/lib/site";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function DefaultLocaleLayout({ children }: { children: React.ReactNode }) {
  return <LocaleDocument locale={defaultLocale}>{children}</LocaleDocument>;
}

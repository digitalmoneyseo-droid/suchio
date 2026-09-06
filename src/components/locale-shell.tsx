import { ClientEffects } from "@/components/client-effects";
import { ScrollProgress } from "@/components/scroll-progress";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeaderShell } from "@/components/site-header-shell";
import { t, type Locale } from "@/lib/i18n";

export function LocaleShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <nav aria-label={t(locale, "a11y.skip")}><a className="fixed top-3 left-4 z-[1000] -translate-y-[160%] rounded-full bg-inverse-surface px-3.5 py-2.5 text-white focus-visible:translate-y-0" href="#main-content">{t(locale, "a11y.skip")}</a></nav>
      <ClientEffects />
      <SiteHeaderShell locale={locale} />
      {children}
      <SiteFooter locale={locale} />
    </>
  );
}

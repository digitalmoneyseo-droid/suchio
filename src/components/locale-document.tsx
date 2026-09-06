import { LocaleShell } from "@/components/locale-shell";
import type { Locale } from "@/lib/i18n";

export function LocaleDocument({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      {/* eslint-disable-next-line @next/next/no-head-element -- Shared App Router root document; next/head is a Pages Router API. */}
      <head><link rel="preload" href="/fonts/dm-sans-latin-standard-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-canvas font-sans text-ink antialiased">
        <LocaleShell locale={locale}>{children}</LocaleShell>
      </body>
    </html>
  );
}

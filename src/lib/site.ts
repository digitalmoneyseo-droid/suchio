import type { Metadata, Viewport } from "next";
import { alternatePath, defaultLocale, localeConfig, locales, t, type Locale } from "@/lib/i18n";
import { siteOrigin } from "@/lib/site-config";

export const googleSiteVerification = "ttGSsltDw6LeGrJfs_anOu-yBfO_hJ6rXYidUt_S0xI";
export { siteOrigin } from "@/lib/site-config";

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  icons: {
    icon: [
      { url: "/suchio-favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/suchio-favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/suchio-favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  verification: { google: googleSiteVerification },
};
export const rootViewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FAF9F6" };

type PageMetadataInput = {
  locale: Locale;
  pathname: string;
  title?: string;
  description: string;
};

export function absoluteUrl(path: string): string {
  return new URL(path, siteOrigin).toString();
}

export function pageMetadata({
  locale,
  pathname,
  title,
  description,
}: PageMetadataInput): Metadata {
  const pageTitle = title ? `${title} | Suchio` : t(locale, "meta.siteTitle");
  const openGraphImage = absoluteUrl("/suchio-social-card.png");
  const twitterImage = absoluteUrl("/suchio-twitter-card.png");
  const languageAlternates = Object.fromEntries(locales.map((candidate) => [candidate, absoluteUrl(alternatePath(pathname, candidate))]));
  return {
    title: pageTitle,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: absoluteUrl(pathname),
      languages: {
        ...languageAlternates,
        "x-default": absoluteUrl(alternatePath(pathname, defaultLocale)),
      },
    },
    openGraph: {
      type: "website",
      siteName: "Suchio",
      locale: localeConfig[locale].openGraphLocale,
      alternateLocale: locales.filter((candidate) => candidate !== locale).map((candidate) => localeConfig[candidate].openGraphLocale),
      title: pageTitle,
      description,
      url: absoluteUrl(pathname),
      images: [{ url: openGraphImage, width: 1200, height: 630, alt: "Suchio" }],
    },
    twitter: { card: "summary", title: pageTitle, description, images: [{ url: twitterImage, width: 400, height: 400, alt: "Suchio" }] },
  };
}

export function noIndexPageMetadata(input: PageMetadataInput): Metadata {
  return {
    ...pageMetadata(input),
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
  };
}

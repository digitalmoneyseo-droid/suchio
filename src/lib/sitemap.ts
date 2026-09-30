import { absoluteUrl } from "@/lib/site";
import { indexableBasePaths } from "@/lib/public-routes";
import { defaultLocale, locales } from "@/i18n/config";
import { localizePath } from "@/lib/locale-path";

function languageAlternates(basePath: string): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, absoluteUrl(localizePath(basePath, locale))])),
    "x-default": absoluteUrl(localizePath(basePath, defaultLocale)),
  };
}

export default function sitemap() {
  return indexableBasePaths
    .flatMap((basePath) => locales.map((locale) => ({
      url: absoluteUrl(localizePath(basePath, locale)),
      alternates: { languages: languageAlternates(basePath) },
    })))
    .sort((left, right) => left.url.localeCompare(right.url));
}

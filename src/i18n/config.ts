import config from "./config.json" with { type: "json" };

export type Locale = keyof typeof config.locales;

export const localeConfig = config.locales;
export const locales = Object.keys(localeConfig) as Locale[];
export const defaultLocale = config.defaultLocale as Locale;
export const prefixedLocales = locales.filter((locale) => locale !== defaultLocale);
export const localeCookie = "suchio-locale";

export function hasLocale(value: string): value is Locale {
  return Object.hasOwn(localeConfig, value);
}

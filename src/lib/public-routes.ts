import { defaultLocale, locales } from "../i18n/config";
import { localizePath } from "./locale-path";
import { serviceOrder, serviceRouteSlugs } from "./service-routes";

export const localeDefinitions = locales.map(locale => ({ locale, prefix: locale === defaultLocale ? "" : `/${locale}` }));
export const indexableBasePaths = ["/", "/about", "/contact", ...serviceOrder.map(id => `/services/${serviceRouteSlugs[id]}`)] as const;
export const legalBasePaths = ["/imprint", "/privacy"] as const;
export const publicRoutes = locales.flatMap(locale => [...indexableBasePaths, ...legalBasePaths].map(basePath => ({ locale, basePath, pathname: localizePath(basePath, locale) })));
export const legacyServiceRoutes = locales.flatMap(locale => serviceOrder.map(id => ({ from: localizePath(`/services/${id}`, locale), to: localizePath(`/services/${serviceRouteSlugs[id]}`, locale) })));

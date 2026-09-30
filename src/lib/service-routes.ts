import type { ServiceId } from "@/i18n/services";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { localizePath } from "@/lib/locale-path";

export const serviceOrder: readonly ServiceId[] = [
  "websites-apps",
  "seo-ai-visibility",
  "paid-campaigns",
  "ai-automation",
];

export const serviceRouteSlugs = {
  "websites-apps": "websites",
  "seo-ai-visibility": "seo",
  "paid-campaigns": "ads",
  "ai-automation": "automation",
} as const satisfies Record<ServiceId, string>;

type ServiceRouteResolution =
  | { kind: "current"; serviceId: ServiceId }
  | { kind: "legacy"; serviceId: ServiceId }
  | { kind: "missing" };

export function isServiceId(value: string | undefined): value is ServiceId {
  return serviceOrder.some((serviceId) => serviceId === value);
}

export function getServicePath(serviceId: ServiceId, locale: Locale): string {
  return localizePath(`/services/${serviceRouteSlugs[serviceId]}`, locale);
}

export function resolveServiceRouteSlug(value: string): ServiceRouteResolution {
  const currentServiceId = serviceOrder.find((serviceId) => serviceRouteSlugs[serviceId] === value);
  if (currentServiceId) return { kind: "current", serviceId: currentServiceId };
  if (isServiceId(value)) return { kind: "legacy", serviceId: value };
  return { kind: "missing" };
}

export function getLegacyServiceRedirectPath(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  let locale = defaultLocale;
  let routeSlug: string | undefined;

  if (segments.length === 2 && segments[0] === "services") {
    routeSlug = segments[1];
  } else if (segments.length === 3 && hasLocale(segments[0]) && segments[1] === "services") {
    locale = segments[0];
    routeSlug = segments[2];
  }

  if (!routeSlug) return undefined;
  const resolution = resolveServiceRouteSlug(routeSlug);
  return resolution.kind === "legacy" ? getServicePath(resolution.serviceId, locale) : undefined;
}

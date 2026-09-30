import {
  servicesContent,
  type AutomationAnimationCopy,
  type CampaignAnimationCopy,
  type OptimizationAnimationCopy,
  type ServiceCopy,
  type ServiceId,
  type WebExperienceAnimationCopy,
} from "@/i18n/services";
import type { Locale } from "@/lib/i18n";
import { getServicePath, serviceOrder } from "@/lib/service-routes";

export type ServiceAnimation =
  | { type: "web-experience"; copy: WebExperienceAnimationCopy }
  | { type: "optimization"; copy: OptimizationAnimationCopy }
  | { type: "campaign"; copy: CampaignAnimationCopy }
  | { type: "automation"; copy: AutomationAnimationCopy };

export type ServiceCatalogEntry = {
  id: ServiceId;
  copy: ServiceCopy;
  animation: ServiceAnimation;
  href: string;
  reverse: boolean;
  theme: string;
};

export function getServiceCatalog(locale: Locale): ServiceCatalogEntry[] {
  const content = servicesContent[locale];
  const copyById = new Map(content.services.map((service) => [service.id, service]));
  if (content.services.length !== serviceOrder.length || copyById.size !== serviceOrder.length) {
    throw new Error(`Service identities must be unique and complete for ${locale}.`);
  }

  const animationById: Record<ServiceId, ServiceAnimation> = {
    "websites-apps": { type: "web-experience", copy: content.webExperienceAnimation },
    "seo-ai-visibility": { type: "optimization", copy: content.optimizationAnimation },
    "paid-campaigns": { type: "campaign", copy: content.campaignAnimation },
    "ai-automation": { type: "automation", copy: content.automationAnimation },
  };

  return serviceOrder.map((id) => {
    const copy = copyById.get(id);
    if (!copy) throw new Error(`Missing ${id} service copy for ${locale}.`);
    return {
      id,
      copy,
      animation: animationById[id],
      href: getServicePath(id, locale),
      reverse: id === "seo-ai-visibility" || id === "ai-automation",
      theme: "bg-white text-ink",
    };
  });
}

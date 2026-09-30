import type { ServiceId } from "@/i18n/services";

export const serviceStyles = {
  "websites-apps": {
    background: "bg-service-websites-bg",
    icon: "bg-service-websites-bg text-service-websites-fg",
    activeIcon: "bg-white text-service-websites-fg",
    selected: "peer-checked:bg-service-websites-bg peer-checked:text-service-websites-fg",
  },
  "seo-ai-visibility": {
    background: "bg-service-search-bg",
    icon: "bg-service-search-bg text-service-search-fg",
    activeIcon: "bg-white text-service-search-fg",
    selected: "peer-checked:bg-service-search-bg peer-checked:text-service-search-fg",
  },
  "paid-campaigns": {
    background: "bg-service-campaigns-bg",
    icon: "bg-service-campaigns-bg text-service-campaigns-fg",
    activeIcon: "bg-white text-service-campaigns-fg",
    selected: "peer-checked:bg-service-campaigns-bg peer-checked:text-service-campaigns-fg",
  },
  "ai-automation": {
    background: "bg-service-automation-bg",
    icon: "bg-service-automation-bg text-service-automation-fg",
    activeIcon: "bg-white text-service-automation-fg",
    selected: "peer-checked:bg-service-automation-bg peer-checked:text-service-automation-fg",
  },
} satisfies Record<ServiceId, { background: string; icon: string; activeIcon: string; selected: string }>;

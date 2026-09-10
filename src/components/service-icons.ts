import { MonitorSmartphone, RadioTower, Search, Workflow, type LucideIcon } from "lucide-react";
import type { ServiceId } from "@/i18n/services";

export const serviceIcons: Record<ServiceId, LucideIcon> = {
  "websites-apps": MonitorSmartphone,
  "seo-ai-visibility": Search,
  "paid-campaigns": RadioTower,
  "ai-automation": Workflow,
};

import {
  AppWindow,
  Bot,
  CalendarCheck,
  ChartNoAxesCombined,
  Check,
  Contact,
  FileText,
  Files,
  Layers3,
  LayoutTemplate,
  MapPin,
  Megaphone,
  MousePointerClick,
  Palette,
  PlugZap,
  Route,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { ScopeGroup, ServiceId } from "@/i18n/services";

const scopeIcons: Record<ServiceId, readonly LucideIcon[]> = {
  "websites-apps": [LayoutTemplate, MousePointerClick, ShoppingCart, AppWindow, FileText, CalendarCheck],
  "seo-ai-visibility": [Settings2, Search, FileText, MapPin, Sparkles, ChartNoAxesCombined],
  "paid-campaigns": [Target, Search, Megaphone, Palette, TrendingUp, Route],
  "ai-automation": [Workflow, Contact, Files, Bot, Sparkles, PlugZap],
};

const scopeIconStyles = [
  "bg-[#eaf2ff] text-[#245bb8]",
  "bg-[#e9f7ef] text-[#26734d]",
  "bg-[#fff3dd] text-[#91600a]",
  "bg-[#f2edff] text-[#6650a6]",
  "bg-[#fff0f3] text-[#a2435a]",
  "bg-[#e6f6f7] text-[#24717a]",
] as const;

const scopeMotionStyles = [
  "[--scope-x:-24px]",
  "[--scope-x:24px]",
  "[--scope-x:-24px]",
  "[--scope-x:24px]",
  "[--scope-x:-24px]",
  "[--scope-x:24px]",
] as const;

export function ServiceScopeGrid({ groups, serviceId }: { groups: readonly ScopeGroup[]; serviceId: ServiceId }) {
  return (
    <div
      className="grid grid-cols-12 gap-px overflow-hidden rounded-card border border-line-strong bg-line-strong"
      data-scope-grid
    >
      {groups.map((group, index) => {
        const Icon = scopeIcons[serviceId][index] ?? Layers3;
        return (
          <article
            className={`col-span-6 flex min-w-0 flex-col bg-white p-card-fluid max-compact:col-span-12 ${scopeMotionStyles[index] ?? scopeMotionStyles[0]}`}
            data-reveal
            data-reveal-threshold="half"
            data-scope-item
            key={group.id}
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <span className={`grid size-10 shrink-0 place-items-center rounded-control ${scopeIconStyles[index] ?? "bg-brand-50 text-brand-600"}`} data-scope-icon>
                <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h3 className="m-0 min-w-0 text-heading-sm">{group.title}</h3>
            </div>
            <p className="mt-4 max-w-[46ch] text-base/6 text-muted">{group.copy}</p>
            <ul className="mt-6 grid list-none gap-3 p-0">
              {group.items.map((item) => <li className="flex gap-2.5 text-ui text-muted" key={item}><Check className="mt-0.5 size-4.5 shrink-0 text-brand-500" strokeWidth={2} aria-hidden="true" /><span>{item}</span></li>)}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

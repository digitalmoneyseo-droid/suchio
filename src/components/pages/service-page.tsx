import { serviceIcons } from "@/components/service-icons";
import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  CircleGauge,
  Compass,
  Crosshair,
  FlaskConical,
  Layers3,
  ListTodo,
  PanelsTopLeft,
  Rocket,
  ScanSearch,
  ShieldCheck,
  Telescope,
  TestTubeDiagonal,
  TrendingUp,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { CtaButton } from "@/components/cta-button";
import { Faq } from "@/components/faq";
import { FaqStructuredData } from "@/components/faq-structured-data";
import { OfferAnimation } from "@/components/offer-animations/offer-animation";
import { ServiceScopeGrid } from "@/components/pages/service-scope-grid";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { getServiceCopy, type ServiceId } from "@/i18n/services";
import { localizePath, t, type Locale } from "@/lib/i18n";
import { getServiceCatalog } from "@/lib/service-catalog";

const outcomeIcons = [Compass, Layers3, CircleGauge] as const;
const processIcons: Record<ServiceId, readonly [LucideIcon, LucideIcon, LucideIcon]> = {
  "websites-apps": [Telescope, PanelsTopLeft, Rocket],
  "seo-ai-visibility": [ScanSearch, ListTodo, ChartNoAxesCombined],
  "paid-campaigns": [Crosshair, FlaskConical, TrendingUp],
  "ai-automation": [Waypoints, TestTubeDiagonal, ShieldCheck],
};


const relatedServiceIconStyles: Record<ServiceId, string> = {
  "websites-apps": "bg-service-websites-bg text-service-websites-fg",
  "seo-ai-visibility": "bg-service-search-bg text-service-search-fg",
  "paid-campaigns": "bg-service-campaigns-bg text-service-campaigns-fg",
  "ai-automation": "bg-service-automation-bg text-service-automation-fg",
};

export function ServicePage({ locale, serviceId }: { locale: Locale; serviceId: ServiceId }) {
  const services = getServiceCatalog(locale);
  const service = services.find((entry) => entry.id === serviceId);
  if (!service) throw new Error(`Missing ${serviceId} service for ${locale}.`);

  const { copy } = service;
  const contact = `${localizePath("/contact", locale)}?service=${serviceId}`;
  const related = services.filter((entry) => entry.id !== serviceId);
  const faqItems = copy.page.faqs.map((faq) => ({ id: `${serviceId}-${faq.id}`, data: faq }));

  return (
    <main id="main-content">
      <section className="px-page pt-page-title pb-section">
        <div className="mx-auto grid max-w-[75rem] grid-cols-[minmax(0,1fr)_34rem] items-center gap-x-8 max-wide:grid-cols-1 max-wide:gap-10">
          <Reveal className="min-w-0 max-w-[39rem]">
            <h1 className="m-0 text-display-service text-balance">{copy.page.title}</h1>
            <p className="mt-6 max-w-[38rem] text-lead text-muted text-balance">{copy.page.intro}</p>
            <CtaButton href={contact} className="mt-8">{copy.page.finalCta}</CtaButton>
          </Reveal>
          <Reveal className="min-w-0" delay={70}>
            <div className={`relative grid aspect-[1.1/1] min-h-[24rem] overflow-hidden rounded-card p-10 shadow-surface [&>*]:relative ${service.theme} max-wide:mx-auto max-wide:aspect-[4/3] max-wide:min-h-0 max-wide:w-full max-wide:max-w-[44rem] max-narrow:h-[clamp(19rem,68vw,25rem)] max-narrow:aspect-auto max-narrow:p-4`} aria-hidden="true">
              <OfferAnimation animation={service.animation} locale={locale} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-canvas px-page py-section">
        <div className="mx-auto max-w-[70rem]">
          <SectionHeading title={copy.page.outcomesHeading} copy={copy.page.outcomesIntro} />
          <div className="grid grid-cols-[1.08fr_.92fr] gap-4 max-compact:grid-cols-1">
            <Reveal className="row-span-2 flex min-h-[20rem] flex-col justify-between rounded-card bg-brand-50 p-card-fluid shadow-accent-surface max-compact:min-h-0">
              {(() => {
                const Icon = outcomeIcons[0];
                const item = copy.page.outcomes[0]!;
                return <><Icon className="size-10 text-brand-600" strokeWidth={1.7} aria-hidden="true" /><div className="mt-16 max-compact:mt-10"><h3 className="m-0 text-heading-md">{item.title}</h3><p className="mt-3 max-w-[42ch] text-lg/7 text-muted">{item.copy}</p></div></>;
              })()}
            </Reveal>
            {copy.page.outcomes.slice(1).map((item, index) => {
              const Icon = outcomeIcons[index + 1]!;
              return <Reveal className="flex min-h-[9.5rem] items-start gap-5 rounded-card bg-white p-card-padding shadow-surface" delay={(index + 1) * 50} key={item.id}><Icon className="mt-1 size-7 shrink-0" strokeWidth={1.7} aria-hidden="true" /><div className="min-w-0"><h3 className="m-0 text-heading-sm">{item.title}</h3><p className="mt-2 text-base/6 text-muted">{item.copy}</p></div></Reveal>;
            })}
          </div>
        </div>
      </section>

      <section className="px-page py-section" data-service-scope>
        <div className="mx-auto max-w-[70rem]">
          <SectionHeading title={copy.page.scopeHeading} copy={copy.page.scopeIntro} />
          <ServiceScopeGrid groups={copy.page.scopeGroups} serviceId={serviceId} />
        </div>
      </section>

      <section className="bg-canvas px-page py-section" data-service-process>
        <div className="mx-auto max-w-[70rem]">
          <SectionHeading title={copy.page.processHeading} copy={copy.page.processIntro} align="center" />
          <ol className="process-list m-0 mx-auto grid max-w-[62rem] list-none grid-cols-3 gap-4 p-0 pt-13 max-nav:grid-cols-1 max-nav:pt-0">
            {copy.page.process.map((item, index) => {
              const Icon = processIcons[serviceId][index]!;
              return (
                <li
                  className="process-step relative rounded-card bg-white p-card-padding shadow-surface max-nav:ml-12"
                  style={{ "--process-delay": `${index * 160}ms` } as React.CSSProperties}
                  data-reveal
                  data-reveal-threshold="half"
                  key={item.id}
                >
                  <span className="process-node absolute -top-13 left-[calc(50%_-_19px)] z-[1] grid size-[38px] place-items-center rounded-full bg-ink font-mono text-meta text-white tabular-nums max-nav:top-6 max-nav:-left-12" aria-hidden="true">{index + 1}</span>
                  <Icon className="block size-8" strokeWidth={1.7} aria-hidden="true" />
                  <div className="pt-4">
                    <h3 className="mt-0 mb-2 text-heading-sm">{item.title}</h3>
                    <p className="text-base/6 text-muted">{item.copy}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="px-page py-section">
        <SectionHeading title={copy.page.faqHeading} align="center" />
        <div className="mx-auto max-w-[820px]"><Faq items={faqItems} id={`service-${serviceId}-${locale}`} /></div>
      </section>
      <FaqStructuredData items={copy.page.faqs} />

      <section className="bg-canvas px-page py-section-compact">
        <div className="mx-auto max-w-[70rem]">
          <h2 className="m-0 text-heading-md">{t(locale, "service.otherServices")}</h2>
          <nav className="mt-6 grid grid-cols-3 gap-3 max-nav:grid-cols-1" aria-label={t(locale, "service.otherServices")} data-other-services>
            {related.map((entry) => {
              const Icon = serviceIcons[entry.id];
              return (
                <Link className="pill-button flex min-w-0 items-center gap-3 rounded-card bg-white p-5 shadow-surface transition-[background-color,box-shadow,transform] duration-150 hover:bg-interaction hover:shadow-surface-hover motion-reduce:transition-none" href={entry.href} key={entry.id}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-inset ${relatedServiceIconStyles[entry.id]}`} data-related-service-icon>
                    <Icon className="size-4.5" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm font-semibold text-ink">{entry.copy.name}</strong>
                    <span className="mt-1 block text-meta leading-snug text-muted">{entry.copy.navDescription}</span>
                  </span>
                  <span className="pill-button__icon relative size-8 flex-none overflow-hidden rounded-pill bg-inverse-surface text-white" aria-hidden="true">
                    <ArrowRight className="pill-button__arrow pill-button__arrow--right absolute inset-[7px] size-[18px]" strokeWidth={1.7} />
                    <ArrowUpRight className="pill-button__arrow pill-button__arrow--up-right absolute inset-[7px] size-[18px] opacity-0 [transform:translate(-6px,6px)_scale(.8)]" strokeWidth={1.7} />
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="flex min-h-[28rem] flex-col items-center justify-center bg-black px-page py-section text-center text-inverse">
        <Reveal className="min-w-0 w-full">
          <h2 className="mx-auto max-w-[18ch] text-display-sm text-white">{copy.page.finalTitle}</h2>
          <p className="mx-auto mt-6 mb-7 max-w-[35rem] text-lg/7 text-inverse-muted">{copy.page.finalCopy}</p>
          <CtaButton href={contact} light>{copy.page.finalCta}</CtaButton>
        </Reveal>
      </section>
    </main>
  );
}

export function getServiceDescription(locale: Locale, serviceId: ServiceId): string {
  return getServiceCopy(locale, serviceId).page.metaDescription;
}

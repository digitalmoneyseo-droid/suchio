import { Disclosure } from "@/components/disclosure";
import { CtaButton } from "@/components/cta-button";
import { OfferAnimation } from "@/components/offer-animations/offer-animation";
import type { ServiceCatalogEntry } from "@/lib/service-catalog";
import type { Locale } from "@/lib/i18n";

export type OfferOverviewService = Pick<ServiceCatalogEntry, "id" | "animation" | "href" | "reverse" | "theme"> & {
  copy: Pick<ServiceCatalogEntry["copy"], "name" | "summary" | "rows" | "cta">;
};

export function OfferOverview({ locale, services }: { locale: Locale; services: readonly OfferOverviewService[] }) {
  return <div className="mx-auto max-w-[70rem]">{services.map((service, index) => <Service deferRendering={index > 0} key={service.id} locale={locale} service={service} revealDelay={index * 50} />)}</div>;
}

function Service({ deferRendering, locale, service, revealDelay }: { deferRendering: boolean; locale: Locale; service: OfferOverviewService; revealDelay: number }) {
  const { copy } = service;

  return <div className={`reveal mb-content-stack last:mb-0 ${deferRendering ? "deferred-rendering" : ""}`} data-reveal style={{ "--reveal-delay": `${revealDelay}ms` } as React.CSSProperties}>
    <article className="grid grid-cols-2 items-center gap-x-8 max-nav:grid-cols-1 max-nav:gap-10">
      <div className={`min-w-0 max-w-[31rem] ${service.reverse ? "nav:order-2 nav:justify-self-end" : ""}`}>
        <h3 className="m-0 text-heading-md">{copy.name}</h3>
        <p className="mt-4 max-w-[46ch] text-lg/7 text-muted">{copy.summary}</p>
        <div className="relative mt-8">{copy.rows.map(([label, detail], row) => (
          <Disclosure key={label} id={`service-${service.id}-${row}`} group={`service-${service.id}`} title={label} compact defaultOpen={row === 0}>
            <p className="m-0 max-w-[44ch]">{detail}</p>
          </Disclosure>
        ))}</div>
        <CtaButton href={service.href} className="mt-6">{copy.cta}</CtaButton>
      </div>
      <div data-offer-visual={service.animation.type} className={`relative grid min-w-0 aspect-[1.1/1] min-h-[24rem] overflow-hidden rounded-card p-10 shadow-surface [&>*]:relative ${service.theme} ${service.reverse ? "nav:order-1" : ""} max-nav:mx-auto max-nav:aspect-[4/3] max-nav:min-h-0 max-nav:w-full max-nav:max-w-[44rem] max-narrow:h-[clamp(19rem,68vw,25rem)] max-narrow:aspect-auto max-narrow:p-4`} aria-hidden="true">
        <OfferAnimation animation={service.animation} locale={locale} />
      </div>
    </article>
  </div>;
}

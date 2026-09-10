import { ChartNoAxesCombined, Handshake, ListOrdered, PackageCheck, SlidersHorizontal, Target } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { Faq } from "@/components/faq";
import { FaqStructuredData } from "@/components/faq-structured-data";
import { FinalCta } from "@/components/final-cta";
import { OfferOverviewShell } from "@/components/offer-overview-shell";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SiteStructuredData } from "@/components/site-structured-data";
import { getFaqs } from "@/lib/content";
import { localizePath, t, type Locale } from "@/lib/i18n";

export function getHomeDescription(locale: Locale): string {
  return t(locale, "home.heroDescription");
}

export async function HomePage({ locale }: { locale: Locale }) {
  const faqs = await getFaqs(locale);
  const benefits = [
    [Handshake, "home.benefit1Title", "home.benefit1Copy"],
    [SlidersHorizontal, "home.benefit2Title", "home.benefit2Copy"],
    [ChartNoAxesCombined, "home.benefit3Title", "home.benefit3Copy"],
  ] as const;
  const steps = [
    [Target, "home.step1Title", "home.step1Copy"],
    [ListOrdered, "home.step2Title", "home.step2Copy"],
    [PackageCheck, "home.step3Title", "home.step3Copy"],
  ] as const;
  const title = <>{t(locale, "home.heroLine1")} <br /><em className="hero-accent">{t(locale, "home.heroAccent")}</em> {t(locale, "home.heroLine2")}</>;
  return <main id="main-content">
    <section id="intro" className="hero--home relative isolate grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] bg-canvas [place-items:start_center] px-page pt-page-title pb-12"><div className="flex min-w-0 w-full max-w-[62rem] flex-col items-center text-center"><h1 className="shiny-text mt-6 mb-6 w-full max-w-[18ch] text-display-lg text-ink">{title}</h1><p className="hero-copy m-0 max-w-narrow text-lead text-muted">{getHomeDescription(locale)}</p><div className="hero-actions mt-8 flex gap-3 max-narrow:w-[min(20rem,100%)] max-narrow:flex-col max-narrow:[&_a]:w-full"><CtaButton href={localizePath("/contact", locale)}>{t(locale, "home.ctaContact")}</CtaButton></div></div></section>
    <section id="services" className="bg-canvas px-page py-section"><SectionHeading title={t(locale, "home.section1Title")} align="center" /><OfferOverviewShell locale={locale} /></section>
    <section id="why" className="deferred-rendering px-page py-section"><SectionHeading title={t(locale, "home.whyTitle")} align="center" /><div className="grid grid-cols-6 gap-0 max-nav:grid-cols-1">{benefits.map(([Icon, headingKey, copyKey], index) => <Reveal className="col-span-2 min-w-0 max-nav:col-span-1 px-8 py-10 text-center" delay={index * 50} key={headingKey}><div className="grid min-h-22 place-items-center text-ink"><Icon className="size-[42px]" strokeWidth={1.7} aria-hidden="true" /></div><h3 className="mt-6 mb-2 text-heading-sm">{t(locale, headingKey)}</h3><p className="m-0 text-base/6 text-muted">{t(locale, copyKey)}</p></Reveal>)}</div></section>
    <section id="process" className="deferred-rendering bg-canvas px-page py-section"><SectionHeading title={t(locale, "home.processTitle")} copy={t(locale, "home.processCopy")} align="center" /><ol className="process-list m-0 mx-auto grid max-w-[62rem] list-none grid-cols-3 gap-4 p-0 pt-[52px] max-nav:grid-cols-1 max-nav:pt-0">{steps.map(([Icon, headingKey, copyKey], index) => <li className="process-step relative rounded-card bg-white p-card-padding shadow-surface max-nav:ml-12" style={{ "--process-delay": `${index * 160}ms` } as React.CSSProperties} data-reveal data-reveal-threshold="half" key={headingKey}><span className="process-node absolute -top-[52px] left-[calc(50%_-_19px)] z-[1] grid size-[38px] place-items-center rounded-full bg-ink font-mono text-meta text-white tabular-nums max-nav:top-6 max-nav:-left-12" aria-hidden="true">{index + 1}</span><Icon className="block size-8" strokeWidth={1.7} aria-hidden="true" /><div className="pt-4"><h3 className="mt-0 mb-2 text-heading-sm">{t(locale, headingKey)}</h3><p className="text-base/6 text-muted">{t(locale, copyKey)}</p></div></li>)}</ol></section>
    <section id="faq" className="bg-canvas px-page py-section"><SectionHeading title={t(locale, "home.faqHeading")} align="center" /><div className="mx-auto max-w-[820px]"><Faq items={faqs} id={`home-faq-${locale}`} /></div></section><FaqStructuredData items={faqs.map((faq) => faq.data)} /><SiteStructuredData /><FinalCta locale={locale} singleLine />
  </main>;
}

import { CtaButton } from "@/components/cta-button";
import { AuditVisitChoice } from "@/components/audit-visit-choice";
import { EditorialHero } from "@/components/editorial-hero";
import { CampaignAuditPage } from "@/components/pages/campaign-audit-page";
import { auditUi } from "@/i18n/audit-ui";
import { getCampaignReview } from "@/lib/audit-campaign-review";
import { localizePath } from "@/lib/locale-path";
import type { Locale } from "@/i18n/config";
import type { Audit } from "@/lib/audits";

export function AuditPage({ audit, locale }: { audit: Audit; locale: Locale }) {
  const campaignReview = getCampaignReview(audit.id);
  if (campaignReview) return <CampaignAuditPage audit={audit} review={campaignReview} locale={locale} />;
  const copy = audit.content[locale];
  const ui = auditUi[locale];
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return <main id="main-content" data-audit-code={audit.code}>
    <EditorialHero title={copy.title} copy={copy.summary}>
      <p className="m-0 text-meta text-muted">{ui.label} · {audit.company} · <time dateTime={audit.measuredAt}>{new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${audit.measuredAt}T00:00:00Z`))}</time></p>
      <a href="#findings" className="text-ui font-medium text-accent underline underline-offset-4">{ui.findings}</a>
    </EditorialHero>
    <div className="px-page pb-section">
      <AuditVisitChoice code={audit.code} locale={locale} />
      <div className="mx-auto max-w-layout">
        <section id="findings" className="scroll-mt-32 border-t border-line py-section-compact" aria-labelledby="findings-title">
          <h2 id="findings-title" className="m-0 mb-heading-gap text-heading-lg">{ui.findings}</h2>
          <div className="grid gap-10">
            {copy.findings.map(([title, observation, action], index) => <article key={title} className="grid min-w-0 grid-cols-[3rem_1fr] gap-4 border-b border-line pb-10 max-narrow:grid-cols-1">
              <span className="font-mono text-heading-md text-accent" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0 max-w-reading">
                <h3 className="m-0 text-heading-md">{title}</h3>
                <p className="mt-4 mb-0 text-base/7 text-muted">{observation}</p>
                <p className="mt-4 mb-0 text-base/7"><strong className="font-medium">{ui.action}. </strong>{action}</p>
              </div>
            </article>)}
          </div>
        </section>
        <section className="pb-section-compact" aria-labelledby="priority-title">
          <h2 id="priority-title" className="m-0 mb-heading-gap text-heading-lg">{ui.priorities}</h2>
          <ol className="m-0 grid list-none grid-cols-3 gap-6 p-0 max-compact:grid-cols-1">
            {copy.steps.map(([priority, title, body], index) => <li key={title} className="min-w-0 rounded-card bg-surface p-card-padding shadow-surface">
              <p className="m-0 text-meta text-accent">{index + 1} / {priority}</p>
              <h3 className="mt-4 mb-0 text-heading-sm">{title}</h3>
              <p className="mt-4 mb-0 text-base/7 text-muted">{body}</p>
            </li>)}
          </ol>
          <h3 className="mt-10 mb-4 text-heading-md">{ui.flow}</h3>
          <ol className="m-0 flex list-inside list-decimal flex-wrap gap-x-10 gap-y-4 p-0 text-base/7">{copy.flow.map(step => <li key={step}>{step}</li>)}</ol>
        </section>
        <section className="border-t border-line py-section-compact" aria-labelledby="measurements-title">
          <h2 id="measurements-title" className="m-0 mb-heading-gap text-heading-lg">{ui.measurements}</h2>
          {audit.scores ? <>
            <dl className="m-0 grid grid-cols-4 gap-6 max-compact:grid-cols-2 max-narrow:grid-cols-1">
              {audit.scores.map((score, index) => <div key={ui.scores[index]} className="min-w-0 rounded-card bg-surface p-card-padding shadow-surface">
                <dt className="text-meta text-muted">{ui.scores[index]}</dt>
                <dd className="m-0 mt-3 text-heading-lg">{score}<span className="ml-2 text-base text-muted">/ 100</span></dd>
                <svg className="mt-4 h-2 w-full" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="4" rx="2" className="fill-line"/><rect width={score} height="4" rx="2" className="fill-accent"/></svg>
              </div>)}
            </dl>
            <p className="mt-6 max-w-reading text-sm/6 text-muted">{ui.scoreNote}</p>
          </> : <p className="max-w-reading text-base/7 text-muted">{copy.measurementNote ?? ui.incomplete}</p>}
          {audit.metrics && <dl className="mt-10 grid grid-cols-3 gap-6 max-compact:grid-cols-1">
            {audit.metrics.map((value, index) => <div key={ui.metricLabels[index]} className="min-w-0 border-t border-line pt-5">
              <dt className="text-ui text-muted">{ui.metricLabels[index]}</dt>
              <dd className="m-0 mt-3 text-heading-md">{format.format(value)}{[" s", " ms", ""][index]}</dd>
              <dd className="m-0 mt-3 text-sm/6 text-muted">{ui.metricHelp[index]}</dd>
            </div>)}
          </dl>}
          <p className="mt-6 max-w-reading text-base/7 text-muted">{copy.methodextra}</p>
        </section>
        <section className="border-t border-line py-section-compact" aria-labelledby="method-title">
          <div className="max-w-reading">
            <h2 id="method-title" className="m-0 text-heading-lg">{ui.methodology}</h2>
            {[copy.methodology ?? ui.method, copy.searchNote ?? ui.search, ui.own].map(text => <p key={text} className="mt-5 mb-0 text-base/7 text-muted">{text}</p>)}
            <h3 className="mt-10 mb-0 text-heading-md">{ui.validationTitle}</h3>
            <p className="mt-4 mb-0 text-base/7 text-muted">{ui.validation}</p>
          </div>
        </section>
        <section id="sources" className="scroll-mt-32 border-t border-line py-section-compact" aria-labelledby="sources-title">
          <h2 id="sources-title" className="m-0 text-heading-lg">{ui.sources}</h2>
          <a href={audit.url} rel="noreferrer" className="mt-5 inline-block max-w-full break-all text-ui text-accent underline underline-offset-4">{audit.url}</a>
          <ol className="mt-6 grid max-w-reading list-none gap-5 p-0">
            {audit.sources.map(([number, title, href]) => <li key={number} className="text-sm/6 text-muted">
              <span className="font-mono">[{number}] </span>
              {href.startsWith("https://") ? <><span>{locale === "de" ? title : ui.sourcePage}</span><br/><a href={href} rel="noreferrer" className="break-all text-accent underline underline-offset-4">{href}</a></> : (copy.evidenceNote ?? ui.report)}
            </li>)}
          </ol>
        </section>
        <section className="rounded-shell bg-inverse-surface p-card-fluid text-inverse" aria-labelledby="audit-contact">
          <h2 id="audit-contact" className="m-0 max-w-reading text-heading-lg text-inverse">{ui.contactTitle}</h2>
          <p className="mt-6 mb-8 max-w-reading text-lead text-inverse-muted">{copy.cta}</p>
          <div className="flex flex-wrap items-center gap-6">
            <CtaButton light href={localizePath("/contact", locale)}>{ui.contact}</CtaButton>
            <a className="text-ui underline underline-offset-4" href={`mailto:contact@suchio.net?subject=${encodeURIComponent(`Website-Audit ${audit.company}`)}`}>{ui.email}</a>
          </div>
        </section>
        <p className="mt-8 max-w-reading text-sm/6 text-muted">{ui.linkNote}</p>
        <a href={`${localizePath(locale === "de" ? "/datenschutz" : "/privacy", locale)}#briefwerbung`} className="text-sm/6 text-accent underline underline-offset-4">{ui.privacy}</a>
      </div>
    </div>
  </main>;
}

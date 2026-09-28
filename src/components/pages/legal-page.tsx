import { EditorialHero } from "@/components/editorial-hero";
import { legalContent, legalUpdatedAt, type LegalPageKind } from "@/i18n/legal-content";
import type { Locale } from "@/lib/i18n";
import { auditUi } from "@/i18n/audit-ui";
import { measurementCopy } from "@/i18n/audit-measurement";

export function LegalPage({ locale, kind }: { locale: Locale; kind: LegalPageKind }) {
  const page = legalContent[locale][kind];
  const audit = auditUi[locale];

  return (
    <main id="main-content">
      <EditorialHero title={page.title} copy={page.intro} />

      <section className="bg-canvas px-page pb-section">
        <div className="mx-auto max-w-reading">
          <div className="flex items-center justify-between gap-6 border-b border-line pb-5 text-sm/5 text-muted max-compact:flex-col max-compact:items-start max-compact:gap-1">
            <span className="font-medium tracking-widest uppercase">{page.eyebrow}</span>
            <time dateTime={legalUpdatedAt}>{page.updated}</time>
          </div>

          <div className="grid">
            {page.sections.map((section) => (
              <section className="border-b border-line py-10 last:border-b-0" key={section.id}>
                <h2 className="m-0 text-heading-md">{section.title}</h2>

                {section.paragraphs?.map((paragraph) => (
                  <p className="mt-4 mb-0 whitespace-pre-line text-base/7 text-muted" key={paragraph}>{paragraph}</p>
                ))}

                {section.details && (
                  <dl className="mt-6 grid gap-3">
                    {section.details.map((detail) => (
                      <div className="grid grid-cols-[minmax(7rem,10rem)_1fr] gap-4 max-compact:grid-cols-1 max-compact:gap-1" key={detail.label}>
                        <dt className="text-base/6 font-medium">{detail.label}</dt>
                        <dd className="m-0 text-base/6 text-muted">
                          {detail.href ? <a className="underline decoration-line underline-offset-4 hover:text-accent" href={detail.href}>{detail.value}</a> : detail.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {section.items && (
                  <ul className="mt-6 mb-0 grid list-disc gap-3 pl-5 text-base/7 text-muted">
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}

                {section.links && (
                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                    {section.links.map((link) => (
                      <a className="text-sm/5 font-medium underline decoration-line underline-offset-4 hover:text-muted" href={link.href} key={link.href} rel="noreferrer" target="_blank">{link.label}</a>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
          {kind === "privacy" && <section id="briefwerbung" className="scroll-mt-32 border-t border-line py-10">
            <h2 className="m-0 text-heading-md">{audit.campaignTitle}</h2>
            <p className="mt-4 text-base/7 text-muted">{audit.campaignIntro}</p>
            {audit.privacySections.map(([title, body]) => <section className="mt-8" key={title}>
              <h3 className="m-0 text-heading-sm">{title}</h3>
              <p className="mt-4 mb-0 text-base/7 text-muted">{body}</p>
            </section>)}
            <a href="https://openai.com/policies/eu-privacy-policy/" rel="noreferrer" className="mt-6 inline-block text-sm text-accent underline underline-offset-4">{locale === "de" ? "OpenAI-Datenschutzerklärung" : locale === "fr" ? "Politique de confidentialité OpenAI" : "OpenAI Privacy Policy"}</a>
          </section>}
          {kind === "privacy" && <section id="audit-auswertung" className="scroll-mt-32 border-t border-line py-10">
            <h2 className="m-0 text-heading-md">{measurementCopy[locale].privacyTitle}</h2>
            <p className="mt-4 text-base/7 text-muted">{measurementCopy[locale].privacyBody}</p>
          </section>}
        </div>
      </section>
    </main>
  );
}

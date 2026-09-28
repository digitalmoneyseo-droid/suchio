import { AuditVisitChoice } from "@/components/audit-visit-choice";
import { CtaButton } from "@/components/cta-button";
import { Disclosure } from "@/components/disclosure";
import type { Locale } from "@/i18n/config";
import type { Audit } from "@/lib/audits";
import type { CampaignReview } from "@/lib/audit-campaign-review";
import { getCampaignPlan, stackDescription } from "@/lib/audit-campaign-plan";
import { localizePath } from "@/lib/locale-path";
import styles from "./campaign-audit-page.module.css";

const labels = {
  de: {
    eyebrow: "Suchio / Individuelle Website-Analyse",
    reportFor: "Website-Check für",
    assessment: "Unsere Einschätzung",
    checked: "Geprüft am",
    observation: "Auf der geprüften Website",
    sample: "Konkreter Befund aus der Stichprobe",
    source: "Quelle",
    findings: "Wo der Auftritt heute bremst",
    action: "Was sich ändern sollte",
    rebuild: "Wie die neue Website helfen kann",
    business: "Möglicher geschäftlicher Effekt",
    businessText: "Wenn Interessenten schneller erkennen, welche Leistung zu ihrem Anliegen passt und wie sie Kontakt aufnehmen, steigt die Chance auf passende Anfragen und damit auf zusätzlichen Umsatz. Eine tatsächliche Umsatzwirkung lässt sich erst nach der Umsetzung messen.",
    route: "Der neue Weg zur Anfrage",
    technology: "Technischer Befund",
    platform: "Öffentlich erkennbarer Unterbau",
    generator: "Generator-Angabe im HTML der Startseite",
    html: "Hinweise im HTML der Startseite",
    unknown: "Aus dem öffentlichen HTML nicht sicher bestimmbar",
    techCaution: "Ein CMS oder Baukasten ist für sich kein Qualitätsmangel. Entscheidend ist die hier beobachtete Umsetzung.",
    techTarget: "Für einen Neuaufbau würden wir Mobilansicht, Lesbarkeit, klare Seitenstruktur und einen sparsamen Medieneinsatz von Anfang an mitplanen. Die konkrete Technik wählen wir nach Ihrem Pflegebedarf.",
    noScore: "Für diese Website veröffentlichen wir keine pauschale Performance- oder SEO-Note: Dafür liegen keine vergleichbaren Laborläufe vor. Die Zahl oben beschreibt nur die genannte, geprüfte Stelle.",
    proposalTitle: "So würden wir Ihre Website neu aufbauen",
    designTitle: "Neue Gestaltung",
    journeyTitle: "Besseres Benutzererlebnis",
    stackTitle: "Technischer Vorschlag",
    implementationTitle: "Konkret für Ihren Auftritt",
    aiTitle: "KI mit klarem Zweck",
    offerTitle: "Sehen Sie Ihre neue Website, bevor sie gebaut wird.",
    offer: "Wir gestalten für Sie kostenfrei einen rein visuellen Entwurf des gesamten neuen Webauftritts. So können Sie Startseite, wichtige Leistungswege und Kontakt als zusammenhängende Gestaltung beurteilen. Die technische Umsetzung gehört nicht zu diesem kostenlosen Entwurf.",
    offerEmail: "Visuellen Entwurf anfragen",
    offerPhone: "Jetzt anrufen",
    details: "Quellen und Prüfgrenzen",
    scope: "Prüfumfang",
    method: "Einordnung der Zahlen und Aussagen",
    sources: "Geprüfte Seiten",
    privacy: "Datenschutz zur Briefansprache",
    linkNote: "Dieser individuelle Bericht ist über den Link im Brief erreichbar. Der Link ist nicht passwortgeschützt und kann weitergegeben werden.",
  },
  en: {
    eyebrow: "Suchio / Individual website review", reportFor: "Website review for", assessment: "Our assessment", checked: "Checked on", observation: "On the checked website", sample: "Specific finding from the sample", source: "Source", findings: "Where the current site gets in the way", action: "What should change", rebuild: "How a new website could help", business: "Potential business effect", businessText: "When visitors can quickly see which service fits their need and how to get in touch, a relevant enquiry becomes more likely and can create additional revenue opportunities. The actual effect can only be measured after launch.", route: "A clearer path to enquiry", technology: "Technical finding", platform: "Publicly visible foundation", generator: "Generator tag in the homepage HTML", html: "Signals in the homepage HTML", unknown: "Not reliably identifiable from public HTML", techCaution: "A CMS or site builder is not in itself a quality defect. The implementation observed here is what matters.", noScore: "We do not publish an overall performance or SEO score for this site: comparable lab runs are unavailable. The figure above describes only the cited page sample.", proposalTitle: "How we would rebuild your website", designTitle: "New design", journeyTitle: "Better user experience", stackTitle: "Technical proposal", implementationTitle: "For your website", aiTitle: "AI with a clear purpose", offerTitle: "See your new website before it is built.", offer: "We will create a free visual design of the entire new website. You can review the homepage, key service paths and contact journey as one coherent design. Technical implementation is not part of this free design.", offerEmail: "Request the visual design", offerPhone: "Call us", details: "Sources and limits", scope: "Scope", method: "How to read these findings", sources: "Checked pages", privacy: "Privacy for postal outreach", linkNote: "This individual report is accessible through the link in the letter. The link is not password protected and can be shared.",
  },
  fr: {
    eyebrow: "Suchio / Analyse individuelle du site", reportFor: "Analyse du site de", assessment: "Notre appréciation", checked: "Vérifié le", observation: "Sur le site examiné", sample: "Constat précis de l'échantillon", source: "Source", findings: "Ce qui freine le site aujourd'hui", action: "Ce qu'il faudrait changer", rebuild: "Comment un nouveau site pourrait aider", business: "Effet commercial possible", businessText: "Si les visiteurs comprennent plus vite quelle prestation leur convient et comment vous contacter, une demande pertinente devient plus probable et peut créer des occasions de chiffre d'affaires. L'effet réel ne pourra être mesuré qu'après la mise en ligne.", route: "Un parcours plus clair vers la demande", technology: "Constat technique", platform: "Base technique visible publiquement", generator: "Indication du générateur dans le HTML de l'accueil", html: "Indices dans le HTML de l'accueil", unknown: "Impossible à déterminer sûrement depuis le HTML public", techCaution: "Un CMS ou un outil de création n'est pas un défaut en soi. C'est la réalisation observée ici qui compte.", noScore: "Nous ne publions pas de note globale de performance ou de SEO : il manque des tests comparables. Le chiffre ci-dessus concerne seulement la page citée.", proposalTitle: "Voici comment nous refondrions votre site", designTitle: "Nouveau design", journeyTitle: "Meilleure expérience utilisateur", stackTitle: "Proposition technique", implementationTitle: "Pour votre site", aiTitle: "L'IA pour un usage précis", offerTitle: "Voyez votre nouveau site avant sa réalisation.", offer: "Nous créons gratuitement une proposition visuelle pour l'ensemble du nouveau site. Vous pourrez examiner l'accueil, les principales prestations et le contact comme un design cohérent. Le développement technique ne fait pas partie de cette proposition gratuite.", offerEmail: "Demander le projet visuel", offerPhone: "Nous appeler", details: "Sources et limites", scope: "Périmètre", method: "Comment lire ces constats", sources: "Pages examinées", privacy: "Confidentialité du courrier publicitaire", linkNote: "Ce rapport individuel est accessible par le lien du courrier. Il n'est pas protégé par mot de passe et peut être partagé.",
  },
} as const;

export function CampaignAuditPage({ audit, review, locale }: { audit: Audit; review: CampaignReview; locale: Locale }) {
  const copy = audit.content[locale];
  const text = labels[locale];
  const plan = getCampaignPlan(audit.id);
  if (!plan) throw new Error(`Missing campaign plan for ${audit.id}`);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${audit.measuredAt}T00:00:00Z`));
  const mail = `mailto:contact@suchio.net?subject=${encodeURIComponent(`Website-Entwurf ${audit.company}`)}`;
  const contact = localizePath("/contact", locale);
  const tel = "tel:+4917642767348";

  return <main id="main-content" className={styles.page} data-audit-code={audit.code}>
    <section className={styles.hero} aria-labelledby="campaign-audit-title">
      <div className={styles.heroInner}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.reportFor}>{text.reportFor} <strong>{audit.company}</strong></p>
            <h1 id="campaign-audit-title" className={styles.title}>{review.headline[locale]}</h1>
            <p className={styles.verdict}>{review.verdict[locale]}</p>
            <p className={styles.date}><time dateTime={audit.measuredAt}>{text.checked} {date}</time></p>
            <div className={styles.heroActions}>
              <CtaButton href={contact}>{text.offerEmail}</CtaButton>
              <a href="#befunde" className={styles.quietLink}>{text.findings} ↓</a>
            </div>
          </div>
          <aside className={styles.proofCard} aria-label={text.sample}>
            <p className={styles.proofTop}>{text.sample}</p>
            <strong className={styles.statValue}>{review.fact.value}</strong>
            <p className={styles.statLabel}>{review.fact.label[locale]}</p>
            <p className={styles.proofFoot}>{text.source} [{review.fact.source}] · {date}</p>
          </aside>
        </div>
      </div>
    </section>

    <div className={styles.content}>
      <section id="befunde" className={styles.section} aria-labelledby="findings-title">
        <div className={styles.sectionIntro}>
          <h2 id="findings-title">{text.findings}</h2>
        </div>
        <div className={styles.findingList}>
          {copy.findings.map(([title, observation, action], index) => <article key={`${index}-${title}`} className={styles.finding}>
            <div>
              <h3>{title}</h3>
              <p>{observation}</p>
              <div className={styles.action}><span>{text.action}</span><p>{action}</p></div>
            </div>
          </article>)}
        </div>
      </section>

      <section id="neustart" className={`${styles.section} ${styles.rebuild}`} aria-labelledby="rebuild-title">
        <div className={styles.sectionIntro}>
          <h2 id="rebuild-title">{text.proposalTitle}</h2>
          <p>{copy.summary}</p>
        </div>
        <div className={styles.proposalGrid}>
          <article className={styles.proposalCard}><h3>{text.designTitle}</h3><p>{plan.design[locale]}</p></article>
          <article className={styles.proposalCard}><h3>{text.journeyTitle}</h3><p>{plan.journey[locale]}</p></article>
          <article className={`${styles.proposalCard} ${styles.proposalWide}`}><h3>{text.stackTitle}</h3><p>{stackDescription[plan.stack][locale]}</p><h4>{text.implementationTitle}</h4><p>{plan.implementation[locale]}</p></article>
          {plan.ai && <article className={`${styles.proposalCard} ${styles.proposalWide}`}><h3>{text.aiTitle}</h3><p>{plan.ai[locale]}</p></article>}
        </div>
        <p className={styles.impact}><strong>{text.business}</strong>{text.businessText}</p>
      </section>

      <section id="technik" className={styles.section} aria-labelledby="technology-title">
        <div className={styles.sectionIntro}>
          <h2 id="technology-title">{text.technology}</h2>
          <p>{text.noScore}</p>
        </div>
        <div className={styles.techGrid}>
          <div className={styles.techCard}>
            <span className={styles.techLabel}>{text.platform}</span>
            <strong>{review.technology.platform ?? text.unknown}</strong>
            {review.technology.platform && <small>{text[review.technology.evidence]}</small>}
            <p>{text.techCaution}</p>
          </div>
        </div>
      </section>

      <section id="angebot" className={styles.offer} aria-labelledby="offer-title">
        <div>
          <h2 id="offer-title">{text.offerTitle}</h2>
          <p>{text.offer}</p>
          <div className={styles.offerActions}>
            <CtaButton href={contact} light>{text.offerEmail}</CtaButton>
            <a className={styles.offerCall} href={tel}>{text.offerPhone}: <strong>+49 176 42767348</strong></a>
          </div>
          <a className={styles.emailLine} href={mail}>contact@suchio.net</a>
        </div>
      </section>

      <section className={styles.afterword} aria-labelledby="details-title">
        <h2 id="details-title">{text.details}</h2>
        <Disclosure id={`audit-${audit.id}-scope`} group={`audit-${audit.id}-details`} title={text.scope} defaultOpen>
          <p className={styles.detailParagraph}>{copy.methodology}</p>
          <p className={styles.detailParagraph}>{copy.searchNote}</p>
        </Disclosure>
        <Disclosure id={`audit-${audit.id}-method`} group={`audit-${audit.id}-details`} title={text.method}>
          <p className={styles.detailParagraph}>{copy.methodextra}</p>
          <p className={styles.detailParagraph}>{copy.measurementNote}</p>
        </Disclosure>
        <div className={styles.sources}>
          <h3>{text.sources}</h3>
          <ol>{audit.sources.map(([number, title, href]) => <li key={number}><span>[{number}] {title}</span>{/^https?:\/\//.test(href) && <a href={href} rel="noreferrer">{href}</a>}</li>)}</ol>
        </div>
      </section>
      <div className={styles.consent}><AuditVisitChoice code={audit.code} locale={locale} /></div>
      <p className={styles.endNote}>{text.linkNote}</p>
      <a className={styles.privacy} href={`${localizePath(locale === "de" ? "/datenschutz" : "/privacy", locale)}#briefwerbung`}>{text.privacy}</a>
    </div>
  </main>;
}

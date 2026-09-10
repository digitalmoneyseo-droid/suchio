import { publicContactEmail, publicContactPhone, publicContactPhoneHref } from "@/lib/contact";
import type { Locale } from "./config";

export type LegalPageKind = "imprint" | "privacy";

interface LegalDetail {
  label: string;
  value: string;
  href?: string;
}

interface LegalLink {
  href: string;
  label: string;
}

export interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  details?: LegalDetail[];
  items?: string[];
  links?: LegalLink[];
}

export interface LegalPageContent {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

type LegalContent = Record<LegalPageKind, LegalPageContent>;

export const legalUpdatedAt = "2026-09-09";
const updatedLabel = (locale: Locale) => {
  const prefix = { de: "Stand: ", en: "Last updated: ", fr: "Mise à jour : " }[locale];
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${legalUpdatedAt}T00:00:00Z`));
  return `${prefix}${date}`;
};

const cloudflareLinks = [
  { href: "https://www.cloudflare.com/privacypolicy/", label: "Cloudflare Privacy Policy" },
  { href: "https://www.cloudflare.com/cloudflare-customer-dpa/", label: "Cloudflare Data Processing Addendum" },
];

const resendLinks = [
  { href: "https://resend.com/legal/privacy-policy", label: "Resend Privacy Policy" },
  { href: "https://resend.com/legal/dpa", label: "Resend Data Processing Addendum" },
];

const de: LegalContent = {
  imprint: {
    eyebrow: "Rechtliches",
    title: "Impressum",
    intro: "Anbieterkennzeichnung und Kontaktangaben für Suchio.",
    updated: updatedLabel("de"),
    sections: [
      { id: "information-pursuant-to-section-5-ddg",
        title: "Angaben gemäß § 5 DDG",
        paragraphs: ["Aleks Tsenov\nGeschäftsbezeichnung: Suchio\nBergstraße 41\n65795 Hattersheim am Main\nDeutschland"],
      },
      { id: "contact",
        title: "Kontakt",
        details: [
          { label: "Telefon", value: publicContactPhone, href: publicContactPhoneHref },
          { label: "E-Mail", value: publicContactEmail, href: `mailto:${publicContactEmail}` },
        ],
      },
      { id: "business-details",
        title: "Unternehmensangaben",
        paragraphs: ["Nicht in das Handelsregister eingetragenes Einzelunternehmen.\nInhaber: Aleks Tsenov"],
      },
      { id: "responsible-for-content",
        title: "Verantwortlich für die Inhalte",
        paragraphs: ["Aleks Tsenov\nBergstraße 41\n65795 Hattersheim am Main\nDeutschland"],
      },
      { id: "consumer-dispute-resolution",
        title: "Verbraucherstreitbeilegung",
        paragraphs: ["Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."],
      },
    ],
  },
  privacy: {
    eyebrow: "Rechtliches",
    title: "Datenschutzerklärung",
    intro: "Diese Erklärung beschreibt, wie Suchio personenbezogene Daten beim Besuch der Website und bei einer Kontaktaufnahme verarbeitet.",
    updated: updatedLabel("de"),
    sections: [
      { id: "1-controller",
        title: "1. Verantwortlicher",
        paragraphs: ["Aleks Tsenov\nSuchio\nBergstraße 41\n65795 Hattersheim am Main\nDeutschland"],
        details: [
          { label: "Telefon", value: publicContactPhone, href: publicContactPhoneHref },
          { label: "E-Mail", value: publicContactEmail, href: `mailto:${publicContactEmail}` },
        ],
      },
      { id: "2-hosting-delivery-and-server-logs",
        title: "2. Hosting, Auslieferung und Serverprotokolle",
        paragraphs: [
          "Die Website wird über Cloudflare Workers und Cloudflare Static Assets ausgeliefert. Beim Aufruf verarbeitet Cloudflare insbesondere IP-Adresse, Datum und Uhrzeit, angeforderte URL, HTTP-Status, Referrer, Browser- und Geräteangaben sowie technische Netzwerk- und Sicherheitsdaten. Die Verarbeitung dient der sicheren und schnellen Auslieferung, der Fehleranalyse und der Abwehr missbräuchlicher Zugriffe.",
          "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt im sicheren, stabilen und effizienten Betrieb dieser Website. Auf dem aktuell eingesetzten Workers-Free-Tarif werden Workers-Protokolle grundsätzlich bis zu drei Tage gespeichert und anschließend automatisch gelöscht, sofern sie nicht ausnahmsweise zur Aufklärung eines Sicherheitsvorfalls oder zur Rechtsverfolgung länger benötigt werden.",
          "Anbieter ist Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, USA. Eine Verarbeitung kann auch außerhalb des Europäischen Wirtschaftsraums stattfinden. Cloudflare stützt Übermittlungen in die USA auf das EU-U.S. Data Privacy Framework und, soweit erforderlich, auf EU-Standardvertragsklauseln.",
        ],
        links: cloudflareLinks,
      },
      { id: "3-contact-form-and-email-communication",
        title: "3. Kontaktformular und E-Mail-Kommunikation",
        paragraphs: [
          "Bei einer Anfrage verarbeiten wir die von dir eingegebenen Daten. Dazu können Name, E-Mail-Adresse, Unternehmen, Unternehmenswebsite, gewünschte Leistung, Budgetrahmen, Nachricht und Sprache gehören. Ein unsichtbares Honeypot-Feld dient ausschließlich der Spam-Abwehr. Die Angaben werden nicht in einer eigenen Website-Datenbank gespeichert.",
          "Die Verarbeitung erfolgt zur Bearbeitung deiner Anfrage und zur Kommunikation. Geht es um einen Vertrag oder vorvertragliche Maßnahmen, ist Art. 6 Abs. 1 lit. b DSGVO die Rechtsgrundlage. In anderen Fällen beruht sie auf Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist die sachgerechte Beantwortung geschäftlicher Anfragen.",
          "Für den Versand nutzen wir Resend, einen Dienst der Plus Five Five, Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA. Resend verarbeitet mindestens Absender- und Empfängeradresse, Nachrichteninhalt und Versandmetadaten und hält E-Mail-Daten nach eigener Dokumentation grundsätzlich 30 Tage vor. Übermittlungen in die USA werden über das EU-U.S. Data Privacy Framework und EU-Standardvertragsklauseln abgesichert.",
          "Die Anfrage verbleibt außerdem im E-Mail-Postfach des Verantwortlichen. Wir löschen Korrespondenz, sobald die Anfrage abschließend bearbeitet ist und keine gesetzlichen Aufbewahrungspflichten oder berechtigten Nachweisinteressen entgegenstehen. Bitte übermittle über das Formular keine besonderen Kategorien personenbezogener Daten im Sinne von Art. 9 DSGVO.",
        ],
        links: resendLinks,
      },
      { id: "4-language-preference",
        title: "4. Spracheinstellung",
        paragraphs: [
          "Die Website speichert die gewählte Sprache im Cookie „suchio-locale“. Das Cookie enthält nur den Sprachcode, gilt für die gesamte Website und wird nach einem Jahr gelöscht. Es ist erforderlich, damit die ausdrücklich gewählte Sprachversion bei späteren Aufrufen erhalten bleibt.",
          "Die Speicherung ist nach § 25 Abs. 2 Nr. 2 TDDDG ohne Einwilligung zulässig. Soweit der Sprachcode einer Person zugeordnet werden kann, ist Art. 6 Abs. 1 lit. f DSGVO die Rechtsgrundlage. Das Cookie kann jederzeit über die Browsereinstellungen gelöscht werden.",
        ],
      },
      { id: "5-no-analytics-or-marketing-services",
        title: "5. Keine Analyse- oder Marketingdienste",
        paragraphs: ["Derzeit verwenden wir keine Webanalyse, keine Werbetracker, keine Social-Media-Pixel und keine nicht erforderlichen Cookies. Sollte sich das ändern, wird diese Datenschutzerklärung vor dem Einsatz angepasst und eine erforderliche Einwilligung eingeholt."],
      },
      { id: "6-encryption",
        title: "6. Verschlüsselung",
        paragraphs: ["Die Übertragung zwischen deinem Browser und der Website erfolgt verschlüsselt über HTTPS/TLS. Eine verschlüsselte Verbindung ist am Schloss-Symbol und an „https://“ in der Adresszeile erkennbar."],
      },
      { id: "7-your-rights",
        title: "7. Deine Rechte",
        paragraphs: ["Soweit die gesetzlichen Voraussetzungen erfüllt sind, hast du gegenüber dem Verantwortlichen folgende Rechte:"],
        items: [
          "Auskunft über deine personenbezogenen Daten (Art. 15 DSGVO)",
          "Berichtigung unrichtiger Daten (Art. 16 DSGVO)",
          "Löschung (Art. 17 DSGVO)",
          "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
          "Datenübertragbarkeit (Art. 20 DSGVO)",
          "Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)",
        ],
      },
      { id: "8-right-to-object",
        title: "8. Widerspruchsrecht",
        paragraphs: ["Du kannst einer Verarbeitung, die auf Art. 6 Abs. 1 lit. f DSGVO beruht, aus Gründen widersprechen, die sich aus deiner besonderen Situation ergeben. Wir verarbeiten die betroffenen Daten dann nicht weiter, sofern keine zwingenden schutzwürdigen Gründe oder Gründe zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen überwiegen."],
      },
      { id: "9-right-to-complain",
        title: "9. Beschwerderecht",
        paragraphs: ["Du kannst dich bei einer Datenschutzaufsichtsbehörde beschweren. Die für den Sitz von Suchio zuständige Behörde ist der Hessische Beauftragte für Datenschutz und Informationsfreiheit, Gustav-Stresemann-Ring 1, 65189 Wiesbaden, Deutschland."],
        links: [{ href: "https://datenschutz.hessen.de/", label: "Datenschutzaufsicht Hessen" }],
      },
      { id: "10-providing-data-and-automated-decisions",
        title: "10. Bereitstellung der Daten und automatisierte Entscheidungen",
        paragraphs: ["Die Nutzung des Kontaktformulars ist freiwillig. Ohne die als erforderlich markierten Angaben können wir die Anfrage nicht über das Formular bearbeiten; eine Kontaktaufnahme per E-Mail oder Telefon bleibt möglich. Es findet keine automatisierte Entscheidungsfindung einschließlich Profiling statt."],
      },
      { id: "11-changes-to-this-policy",
        title: "11. Änderungen dieser Erklärung",
        paragraphs: ["Wir aktualisieren diese Datenschutzerklärung, wenn sich die Website, die eingesetzten Dienste oder die rechtlichen Anforderungen ändern. Es gilt die auf dieser Seite veröffentlichte Fassung."],
      },
    ],
  },
};

const en: LegalContent = {
  imprint: {
    eyebrow: "Legal",
    title: "Legal notice",
    intro: "Provider identification and contact details for Suchio.",
    updated: updatedLabel("en"),
    sections: [
      { id: "information-pursuant-to-section-5-ddg", title: "Information pursuant to section 5 DDG", paragraphs: ["Aleks Tsenov\nTrading name: Suchio\nBergstraße 41\n65795 Hattersheim am Main\nGermany"] },
      { id: "contact", title: "Contact", details: [{ label: "Phone", value: publicContactPhone, href: publicContactPhoneHref }, { label: "Email", value: publicContactEmail, href: `mailto:${publicContactEmail}` }] },
      { id: "business-details", title: "Business details", paragraphs: ["Sole proprietorship not registered in the German commercial register.\nOwner: Aleks Tsenov"] },
      { id: "responsible-for-content", title: "Responsible for content", paragraphs: ["Aleks Tsenov\nBergstraße 41\n65795 Hattersheim am Main\nGermany"] },
      { id: "consumer-dispute-resolution", title: "Consumer dispute resolution", paragraphs: ["We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board."] },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy policy",
    intro: "This policy explains how Suchio processes personal data when you visit the website or contact us.",
    updated: updatedLabel("en"),
    sections: [
      { id: "1-controller", title: "1. Controller", paragraphs: ["Aleks Tsenov\nSuchio\nBergstraße 41\n65795 Hattersheim am Main\nGermany"], details: [{ label: "Phone", value: publicContactPhone, href: publicContactPhoneHref }, { label: "Email", value: publicContactEmail, href: `mailto:${publicContactEmail}` }] },
      { id: "2-hosting-delivery-and-server-logs",
        title: "2. Hosting, delivery, and server logs",
        paragraphs: [
          "The website is delivered through Cloudflare Workers and Cloudflare Static Assets. When you access the site, Cloudflare processes data including your IP address, date and time, requested URL, HTTP status, referrer, browser and device information, and technical network and security data. This processing supports secure and fast delivery, error analysis, and protection against misuse.",
          "The legal basis is Article 6(1)(f) GDPR. Our legitimate interest is the secure, stable, and efficient operation of this website. On the Workers Free plan currently in use, Workers logs are generally retained for up to three days and then deleted automatically unless they are exceptionally needed for longer to investigate a security incident or establish legal claims.",
          "The provider is Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, USA. Processing may take place outside the European Economic Area. Cloudflare relies on the EU-U.S. Data Privacy Framework and, where required, the EU Standard Contractual Clauses for transfers to the United States.",
        ],
        links: cloudflareLinks,
      },
      { id: "3-contact-form-and-email-communication",
        title: "3. Contact form and email communication",
        paragraphs: [
          "When you contact us, we process the information you provide. This may include your name, email address, company, company website, selected service, budget range, message, and language. An invisible honeypot field is used only to prevent spam. The information is not stored in a separate website database.",
          "We process this information to handle and respond to your enquiry. Article 6(1)(b) GDPR applies where the enquiry concerns a contract or pre-contractual steps. In other cases, Article 6(1)(f) GDPR applies; our legitimate interest is responding appropriately to business enquiries.",
          "We use Resend, a service of Plus Five Five, Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA, to send the message. Resend processes at least sender and recipient addresses, message content, and delivery metadata and, according to its documentation, generally retains email data for 30 days. Transfers to the United States are safeguarded through the EU-U.S. Data Privacy Framework and the EU Standard Contractual Clauses.",
          "The enquiry also remains in the controller’s email inbox. We delete correspondence once the enquiry has been fully handled unless statutory retention duties or legitimate evidentiary interests require further storage. Please do not submit special categories of personal data under Article 9 GDPR through the form.",
        ],
        links: resendLinks,
      },
      { id: "4-language-preference", title: "4. Language preference", paragraphs: ["The website stores your chosen language in the “suchio-locale” cookie. It contains only the language code, applies across the website, and expires after one year. It is necessary to retain the language version you expressly selected for later visits.", "Storage does not require consent under section 25(2)(2) TDDDG. Where the language code can be linked to a person, Article 6(1)(f) GDPR is the legal basis. You can delete the cookie at any time in your browser settings."] },
      { id: "5-no-analytics-or-marketing-services", title: "5. No analytics or marketing services", paragraphs: ["We currently use no web analytics, advertising trackers, social media pixels, or non-essential cookies. If this changes, we will update this policy before introducing the service and obtain consent where required."] },
      { id: "6-encryption", title: "6. Encryption", paragraphs: ["Data transmitted between your browser and the website is encrypted using HTTPS/TLS. You can recognise an encrypted connection by the lock symbol and “https://” in the address bar."] },
      { id: "7-your-rights", title: "7. Your rights", paragraphs: ["Where the statutory conditions are met, you have the following rights against the controller:"], items: ["Access to your personal data (Article 15 GDPR)", "Rectification of inaccurate data (Article 16 GDPR)", "Erasure (Article 17 GDPR)", "Restriction of processing (Article 18 GDPR)", "Data portability (Article 20 GDPR)", "Objection to processing based on legitimate interests (Article 21 GDPR)"] },
      { id: "8-right-to-object", title: "8. Right to object", paragraphs: ["You may object to processing based on Article 6(1)(f) GDPR for reasons arising from your particular situation. We will then stop processing the relevant data unless compelling legitimate grounds or the establishment, exercise, or defence of legal claims override your interests."] },
      { id: "9-right-to-complain", title: "9. Right to complain", paragraphs: ["You may lodge a complaint with a data protection authority. The authority responsible for Suchio’s place of establishment is the Hessian Commissioner for Data Protection and Freedom of Information, Gustav-Stresemann-Ring 1, 65189 Wiesbaden, Germany."], links: [{ href: "https://datenschutz.hessen.de/", label: "Hessian data protection authority" }] },
      { id: "10-providing-data-and-automated-decisions", title: "10. Providing data and automated decisions", paragraphs: ["Using the contact form is voluntary. Without the fields marked as required, we cannot process the enquiry through the form; you can still contact us by email or phone. We do not use automated decision-making, including profiling."] },
      { id: "11-changes-to-this-policy", title: "11. Changes to this policy", paragraphs: ["We update this privacy policy when the website, the services used, or legal requirements change. The version published on this page applies."] },
    ],
  },
};

const fr: LegalContent = {
  imprint: {
    eyebrow: "Informations juridiques",
    title: "Mentions légales",
    intro: "Identification de l’éditeur et coordonnées de Suchio.",
    updated: updatedLabel("fr"),
    sections: [
      { id: "information-pursuant-to-section-5-ddg", title: "Informations conformément à l’article 5 du DDG allemand", paragraphs: ["Aleks Tsenov\nNom commercial : Suchio\nBergstraße 41\n65795 Hattersheim am Main\nAllemagne"] },
      { id: "contact", title: "Contact", details: [{ label: "Téléphone", value: publicContactPhone, href: publicContactPhoneHref }, { label: "E-mail", value: publicContactEmail, href: `mailto:${publicContactEmail}` }] },
      { id: "business-details", title: "Informations sur l’entreprise", paragraphs: ["Entreprise individuelle non inscrite au registre du commerce allemand.\nPropriétaire : Aleks Tsenov"] },
      { id: "responsible-for-content", title: "Responsable du contenu", paragraphs: ["Aleks Tsenov\nBergstraße 41\n65795 Hattersheim am Main\nAllemagne"] },
      { id: "consumer-dispute-resolution", title: "Règlement des litiges de consommation", paragraphs: ["Nous ne sommes ni disposés ni tenus de participer à une procédure de règlement des litiges devant un organisme de médiation de la consommation."] },
    ],
  },
  privacy: {
    eyebrow: "Informations juridiques",
    title: "Politique de confidentialité",
    intro: "Cette politique explique comment Suchio traite les données personnelles lors de votre visite du site ou d’une prise de contact.",
    updated: updatedLabel("fr"),
    sections: [
      { id: "1-controller", title: "1. Responsable du traitement", paragraphs: ["Aleks Tsenov\nSuchio\nBergstraße 41\n65795 Hattersheim am Main\nAllemagne"], details: [{ label: "Téléphone", value: publicContactPhone, href: publicContactPhoneHref }, { label: "E-mail", value: publicContactEmail, href: `mailto:${publicContactEmail}` }] },
      { id: "2-hosting-delivery-and-server-logs",
        title: "2. Hébergement, diffusion et journaux serveur",
        paragraphs: [
          "Le site est diffusé à l’aide de Cloudflare Workers et Cloudflare Static Assets. Lors d’une consultation, Cloudflare traite notamment l’adresse IP, la date et l’heure, l’URL demandée, le statut HTTP, le référent, les informations sur le navigateur et l’appareil ainsi que des données techniques de réseau et de sécurité. Ce traitement permet une diffusion sûre et rapide, l’analyse des erreurs et la prévention des abus.",
          "La base juridique est l’article 6, paragraphe 1, point f) du RGPD. Notre intérêt légitime est d’assurer un fonctionnement sûr, stable et efficace du site. Avec l’offre Workers Free actuellement utilisée, les journaux Workers sont en principe conservés jusqu’à trois jours puis supprimés automatiquement, sauf nécessité exceptionnelle liée à un incident de sécurité ou à la défense de droits en justice.",
          "Le prestataire est Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis. Le traitement peut avoir lieu hors de l’Espace économique européen. Cloudflare encadre les transferts vers les États-Unis par le cadre UE–États-Unis de protection des données et, si nécessaire, par les clauses contractuelles types de l’UE.",
        ],
        links: cloudflareLinks,
      },
      { id: "3-contact-form-and-email-communication",
        title: "3. Formulaire de contact et communications par e-mail",
        paragraphs: [
          "Lorsque vous nous contactez, nous traitons les informations fournies. Il peut s’agir du nom, de l’adresse e-mail, de l’entreprise, de son site web, du service souhaité, de la tranche budgétaire, du message et de la langue. Un champ invisible de type honeypot sert uniquement à lutter contre le spam. Ces informations ne sont pas enregistrées dans une base de données propre au site.",
          "Le traitement sert à gérer votre demande et à y répondre. L’article 6, paragraphe 1, point b) du RGPD s’applique lorsqu’elle concerne un contrat ou des mesures précontractuelles. Dans les autres cas, il repose sur l’article 6, paragraphe 1, point f) du RGPD ; notre intérêt légitime est de répondre de manière appropriée aux demandes professionnelles.",
          "Nous utilisons Resend, un service de Plus Five Five, Inc., 2261 Market Street #5039, San Francisco, CA 94114, États-Unis, pour envoyer le message. Resend traite au minimum les adresses de l’expéditeur et du destinataire, le contenu du message et les métadonnées d’envoi et conserve, selon sa documentation, les données d’e-mail pendant 30 jours en principe. Les transferts sont encadrés par le cadre UE–États-Unis de protection des données et les clauses contractuelles types de l’UE.",
          "La demande reste également dans la boîte e-mail du responsable. Nous supprimons la correspondance lorsque la demande est définitivement traitée, sauf obligation légale de conservation ou intérêt légitime à conserver une preuve. Merci de ne pas transmettre de catégories particulières de données au sens de l’article 9 du RGPD par le formulaire.",
        ],
        links: resendLinks,
      },
      { id: "4-language-preference", title: "4. Préférence linguistique", paragraphs: ["Le site enregistre la langue choisie dans le cookie « suchio-locale ». Il contient uniquement le code de langue, s’applique à l’ensemble du site et expire après un an. Il est nécessaire pour conserver la version linguistique expressément choisie lors des visites ultérieures.", "Ce stockage ne requiert pas de consentement en vertu de l’article 25, paragraphe 2, point 2 du TDDDG allemand. Lorsque le code peut être rattaché à une personne, la base juridique est l’article 6, paragraphe 1, point f) du RGPD. Vous pouvez supprimer le cookie à tout moment dans les réglages du navigateur."] },
      { id: "5-no-analytics-or-marketing-services", title: "5. Aucun service d’analyse ou de marketing", paragraphs: ["Nous n’utilisons actuellement aucun outil d’analyse web, traceur publicitaire, pixel de réseau social ni cookie non essentiel. Si cela change, cette politique sera mise à jour avant la mise en service et un consentement sera recueilli si nécessaire."] },
      { id: "6-encryption", title: "6. Chiffrement", paragraphs: ["Les échanges entre votre navigateur et le site sont chiffrés via HTTPS/TLS. Une connexion chiffrée se reconnaît au cadenas et à « https:// » dans la barre d’adresse."] },
      { id: "7-your-rights", title: "7. Vos droits", paragraphs: ["Lorsque les conditions légales sont remplies, vous disposez des droits suivants auprès du responsable :"], items: ["Accès à vos données personnelles (article 15 du RGPD)", "Rectification des données inexactes (article 16 du RGPD)", "Effacement (article 17 du RGPD)", "Limitation du traitement (article 18 du RGPD)", "Portabilité des données (article 20 du RGPD)", "Opposition aux traitements fondés sur un intérêt légitime (article 21 du RGPD)"] },
      { id: "8-right-to-object", title: "8. Droit d’opposition", paragraphs: ["Vous pouvez vous opposer à un traitement fondé sur l’article 6, paragraphe 1, point f) du RGPD pour des raisons tenant à votre situation particulière. Nous cesserons alors le traitement, sauf motifs légitimes impérieux ou nécessité liée à la constatation, à l’exercice ou à la défense de droits en justice."] },
      { id: "9-right-to-complain", title: "9. Droit d’introduire une réclamation", paragraphs: ["Vous pouvez déposer une réclamation auprès d’une autorité de protection des données. L’autorité compétente pour le siège de Suchio est le Commissaire de Hesse à la protection des données et à la liberté d’information, Gustav-Stresemann-Ring 1, 65189 Wiesbaden, Allemagne."], links: [{ href: "https://datenschutz.hessen.de/", label: "Autorité de protection des données de Hesse" }] },
      { id: "10-providing-data-and-automated-decisions", title: "10. Fourniture des données et décisions automatisées", paragraphs: ["L’utilisation du formulaire est facultative. Sans les champs marqués comme obligatoires, nous ne pouvons pas traiter la demande par ce moyen ; un contact par e-mail ou téléphone reste possible. Aucune décision automatisée, y compris aucun profilage, n’est réalisée."] },
      { id: "11-changes-to-this-policy", title: "11. Modification de cette politique", paragraphs: ["Nous mettons cette politique à jour lorsque le site, les services utilisés ou les exigences juridiques évoluent. La version publiée sur cette page s’applique."] },
    ],
  },
};

export const legalContent = { de, en, fr } as const satisfies Record<Locale, LegalContent>;

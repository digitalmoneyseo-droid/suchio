import type { Locale } from "@/i18n/config";
import octoberCampaign from "@/content/audit-campaign-2026-10-01.json";

type Localized = Record<Locale, string>;
type Technology = { platform: string | null; evidence: "generator" | "html" | "unknown" };

export type CampaignReview = {
  headline: Localized;
  verdict: Localized;
  fact: { value: string; label: Localized; source: string };
  technology: Technology;
};

const local = (de: string, en: string, fr: string): Localized => ({ de, en, fr });

/** Only the twenty Hattersheim campaign reports. Facts refer to the cited sample, not a whole-site crawl. */
const reviews: Record<string, CampaignReview> = {
  mp: {
    headline: local("Maßarbeit, die online kaum sichtbar wird", "Custom work is barely visible online", "Un travail sur mesure peu visible en ligne"),
    verdict: local("Die Benutzeroberfläche erinnert an eine ältere Vorlage. Ohne ausgeführte Arbeiten oder einen Weg nach Vorhaben fällt es Interessenten schwer, die Qualität Ihrer Maßanfertigungen vor einer Anfrage einzuschätzen.", "The interface resembles an older template. Without completed work or a project-based path, visitors struggle to judge your craftsmanship before enquiring.", "L'interface rappelle un ancien modèle. Sans réalisations ni parcours par projet, il est difficile d'évaluer votre savoir-faire avant de vous contacter."),
    fact: { value: "3", label: local("Menüpunkte auf der Startseite – keiner führt zu einer Leistung", "Home navigation links – none leads to a service", "Liens du menu d'accueil – aucun vers une prestation"), source: "1" },
    technology: { platform: "IONOS MyWebsite", evidence: "generator" },
  },
  alles: {
    headline: local("Viele Gewerke, zu wenig Orientierung", "Many trades, too little direction", "De nombreux métiers, peu d'orientation"),
    verdict: local("Die Benutzeroberfläche wirkt wie ein älterer Leistungskatalog. Das Benutzererlebnis verbindet die vielen Gewerke nicht zu einem verständlichen Weg für größere Sanierungsvorhaben.", "The interface feels like an ageing service catalogue. Its user experience does not connect the many trades into a clear path for larger renovation projects.", "L'interface ressemble à un ancien catalogue. Le parcours ne relie pas les nombreux métiers en une démarche claire pour les rénovations plus importantes."),
    fact: { value: "7+", label: local("Gewerke in den geprüften Listen, ohne Projektweg", "Trades in the checked lists, without a project path", "Métiers dans les listes examinées, sans parcours de projet"), source: "1, 2" },
    technology: { platform: "IONOS MyWebsite", evidence: "generator" },
  },
  krebs: {
    headline: local("Die besten Arbeiten kommen zu spät", "The strongest work appears too late", "Les meilleures réalisations arrivent trop tard"),
    verdict: local("Die Gestaltung lenkt zunächst auf allgemeine Gewerke und eine ältere Seitenvorlage. Im Benutzererlebnis bleiben vorhandene, überzeugendere Projektbelege hinter Listen und Galeriekategorien verborgen.", "The design first directs attention to broad trade lists and an older page template. Stronger existing project evidence stays behind lists and gallery categories.", "La présentation dirige d'abord vers des listes générales et un ancien modèle. Les projets les plus convaincants restent cachés derrière ces listes et catégories."),
    fact: { value: "4", label: local("allgemeine Einstiege vor konkreten Projekten", "Broad entry categories before specific projects", "Catégories générales avant les projets concrets"), source: "1, 2" },
    technology: { platform: "Joomla", evidence: "html" },
  },
  schwenke: {
    headline: local("Eine Handyansicht, die Patienten ausbremst", "A mobile view that slows patients down", "Une vue mobile qui freine les patients"),
    verdict: local("Die Benutzeroberfläche wirkt auf dem Handy veraltet und wie eine verkleinerte Desktopseite. Das erschwert die Behandlungswahl und den gewünschten Weg zum Telefonanruf.", "On a phone the interface looks dated and behaves like a shrunken desktop page. This makes treatment choice and the intended telephone route harder.", "Sur téléphone, l'interface paraît datée et ressemble à une page de bureau rétrécie. Le choix du soin et l'accès à l'appel deviennent plus difficiles."),
    fact: { value: "980 px", label: local("Layoutbreite auf einem 390-px-Gerät", "Layout width on a 390 px device", "Largeur de page sur un écran de 390 px"), source: "1" },
    technology: { platform: "IONOS MyWebsite", evidence: "generator" },
  },
  stueben: {
    headline: local("Ihre Elektroarbeiten stehen nicht im Mittelpunkt", "Your electrical work is not the focus", "Vos travaux électriques passent au second plan"),
    verdict: local("Die unruhige, veraltet wirkende Benutzeroberfläche stellt allgemeine Meldungen vor die eigenen Arbeiten. Interessenten müssen Leistungen und Referenzen erst aus dem Katalog zusammensuchen.", "The busy, dated-looking interface puts general articles ahead of your own work. Visitors must search the catalogue for services and references.", "L'interface chargée et vieillissante place les articles généraux avant vos travaux. Les visiteurs doivent chercher prestations et références dans le catalogue."),
    fact: { value: "1", label: local("interne Kennung als Hauptüberschrift statt Leistungsbotschaft", "Internal identifier used as the main heading", "Identifiant interne utilisé comme titre principal"), source: "1" },
    technology: { platform: "TYPO3 CMS", evidence: "generator" },
  },
  luepke: {
    headline: local("Auf dem Handy bleibt die Desktopseite bestehen", "The desktop layout persists on phones", "La mise en page de bureau persiste sur mobile"),
    verdict: local("Die veraltete Benutzeroberfläche bleibt auf dem Handy zu breit. Das Benutzererlebnis unterscheidet geplante Bad- und Heizungsprojekte nicht klar von dringenden Servicefällen.", "The dated interface remains too wide on a phone. The journey does not clearly separate planned bathroom and heating projects from urgent service cases.", "L'interface vieillissante reste trop large sur téléphone. Le parcours ne distingue pas clairement les projets de salle de bains ou de chauffage des dépannages urgents."),
    fact: { value: "980 px", label: local("Layoutbreite auf einem 390-px-Gerät", "Layout width on a 390 px device", "Largeur de page sur un écran de 390 px"), source: "1" },
    technology: { platform: null, evidence: "unknown" },
  },
  weber: {
    headline: local("Naturstein wie im alten Prospekt", "Natural stone in an old-style brochure", "La pierre naturelle comme dans un ancien catalogue"),
    verdict: local("Die Benutzeroberfläche wirkt altmodisch, während die Natursteinarbeiten selbst zu wenig Raum erhalten. Für sehr unterschiedliche Vorhaben fehlen anschauliche Beispiele und eine hilfreiche Auswahl.", "The interface looks old-fashioned while the stone work itself gets too little space. Very different projects lack useful examples and guidance.", "L'interface paraît démodée et laisse trop peu de place aux réalisations. Les projets très différents manquent d'exemples et d'aide au choix."),
    fact: { value: "6", label: local("Anwendungsfelder in einer knappen Übersicht", "Applications in one brief overview", "Applications dans une vue d'ensemble succincte"), source: "1" },
    technology: { platform: "IONOS MyWebsite", evidence: "generator" },
  },
  seta: {
    headline: local("Zu viele Gewerke, zu wenig belegte Arbeit", "Many trades, too little visible proof", "Beaucoup de métiers, trop peu de preuves concrètes"),
    verdict: local("Die uneinheitliche Benutzeroberfläche wirkt wenig ansprechend. Ein langer Leistungsblock und wiederholte Kundenstimmen helfen Bauherren kaum, passende ausgeführte Projekte zu erkennen.", "The inconsistent interface makes a weak first impression. A long service block and repeated testimonials do little to show clients relevant completed projects.", "L'interface incohérente donne une faible première impression. Une longue liste de prestations et des avis répétés montrent peu de projets comparables."),
    fact: { value: "1", label: local("langer Startseitenfluss für sehr unterschiedliche Bauleistungen", "Long homepage stream for very different construction services", "Longue page d'accueil pour des prestations de construction très différentes"), source: "1" },
    technology: { platform: "WordPress", evidence: "generator" },
  },
  ruppert: {
    headline: local("Dacharbeiten ohne Entscheidungshilfe", "Roofing without decision guidance", "Des travaux de toiture sans aide au choix"),
    verdict: local("Die überladene, veraltet wirkende Oberfläche erklärt kaum, welcher Weg zu Schaden, Sanierung oder Neubau passt. Die Website führt sehr schnell zum Kontakt, bevor sie die Leistung greifbar macht.", "The busy, dated-looking interface barely distinguishes damage, renovation and new roofs. It moves to contact before making the work tangible.", "L'interface chargée et datée distingue peu les dégâts, la rénovation et le neuf. Elle mène au contact avant de rendre les prestations concrètes."),
    fact: { value: "0", label: local("erläuterte Dachprojekte auf der geprüften Seite", "Explained roofing projects on the checked page", "Projets de toiture expliqués sur la page examinée"), source: "1" },
    technology: { platform: null, evidence: "unknown" },
  },
  winter: {
    headline: local("Objektbetreuung wirkt wie vier Einzelleistungen", "Property care reads like separate services", "L'entretien d'immeubles paraît fragmenté"),
    verdict: local("Die überladene, veraltet wirkende Benutzeroberfläche zeigt mehrere Dienste nebeneinander. Für Verwaltungen entsteht kein klarer Weg zu einer laufenden Objektbetreuung.", "The busy, dated-looking interface presents services side by side. Property managers do not get a clear route to ongoing care.", "L'interface chargée et vieillissante juxtapose les services. Les gestionnaires ne trouvent pas de parcours clair vers l'entretien régulier."),
    fact: { value: "4", label: local("getrennte Dienstbereiche ohne gemeinsamen Objektweg", "Separate service areas without one property-care path", "Domaines séparés sans parcours commun pour l'immeuble"), source: "2" },
    technology: { platform: "Jimdo Creator", evidence: "generator" },
  },
  och: {
    headline: local("Handwerk bleibt hinter einer Leistungsliste", "Craftsmanship hidden behind a list", "Le savoir-faire caché derrière une liste"),
    verdict: local("Die Benutzeroberfläche wirkt wie ein älteres Werbeplakat. Einzelne Leistungen bleiben so knapp, dass Interessenten Material, Ausführung und Eignung für ihr Vorhaben kaum beurteilen können.", "The interface resembles an older advertising poster. Some services are so brief that visitors cannot judge materials, workmanship or fit for their project.", "L'interface ressemble à une ancienne affiche. Certaines prestations sont si brèves qu'il est difficile d'évaluer matériaux, réalisation et pertinence."),
    fact: { value: "2", label: local("Stichpunkte auf der geprüften Glasreparaturseite", "Bullet points on the checked glass-repair page", "Points sur la page de réparation de vitrages examinée"), source: "2" },
    technology: { platform: "Joomla", evidence: "generator" },
  },
  hereth: {
    headline: local("Fachkompetenz ohne Weg zum Fachbereich", "Expertise without a path to the right field", "Une expertise sans accès au bon domaine"),
    verdict: local("Die Benutzeroberfläche wirkt für anspruchsvolle Metallbauprojekte veraltet. Brandschutz und Sicherheit stehen in einer Sammelliste, statt Auftraggeber gezielt zu Anforderungen und Referenzen zu führen.", "The interface looks dated for demanding metalwork projects. Fire protection and security sit in one list instead of guiding buyers to requirements and references.", "L'interface paraît datée pour des projets métalliques exigeants. Incendie et sécurité restent dans une liste au lieu de guider vers exigences et références."),
    fact: { value: "2", label: local("sichtbare Hauptmenüziele: Start und Kontakt", "Visible main navigation choices: home and contact", "Choix du menu principal : accueil et contact"), source: "1" },
    technology: { platform: "Jimdo Creator", evidence: "generator" },
  },
  wagner: {
    headline: local("Ein unfertiger Einstieg statt klarer Leistungen", "An unfinished introduction instead of clear services", "Une entrée inachevée plutôt que des prestations claires"),
    verdict: local("Die Benutzeroberfläche wirkt durch den sichtbaren Platzhalter unfertig. Besucher sehen Kontakt und Öffnungszeiten, können aber ihre Bad-, Heizungs- oder Serviceanliegen kaum einer Leistung zuordnen.", "A visible placeholder makes the interface look unfinished. Visitors see contact details and hours but can barely match bathroom, heating or service needs to an offer.", "Un texte provisoire donne à l'interface un aspect inachevé. Contacts et horaires sont visibles, mais les besoins ne mènent guère à une prestation."),
    fact: { value: "1", label: local("sichtbarer Platzhalter „Neuer Text“ im mobilen Einstieg", "Visible “Neuer Text” placeholder in the mobile introduction", "Texte provisoire « Neuer Text » dans la vue mobile"), source: "1" },
    technology: { platform: "IONOS MyWebsite", evidence: "html" },
  },
  bb: {
    headline: local("Zwei Angebote, eine zu breite Handyseite", "Two offers, one oversized mobile page", "Deux activités, une page mobile trop large"),
    verdict: local("Die wenig zeitgemäße Benutzeroberfläche trennt Hausmeisterservice und Schreinerei kaum. Auf dem Handy macht die überbreite Seite beide Wege zusätzlich schwer bedienbar.", "The dated interface barely separates property services from carpentry. On a phone the oversized page makes both paths harder to use.", "L'interface datée distingue peu l'entretien et la menuiserie. Sur téléphone, la page trop large rend les deux parcours difficiles."),
    fact: { value: "768 px", label: local("Seitenbreite auf einem 390-px-Gerät", "Page width on a 390 px device", "Largeur de page sur un écran de 390 px"), source: "1" },
    technology: { platform: "IONOS MyWebsite", evidence: "html" },
  },
  geiss: {
    headline: local("Einbauten wirken wie Katalogbilder", "Installations feel like catalogue images", "Les installations ressemblent à des images de catalogue"),
    verdict: local("Die schmale, altmodisch wirkende Benutzeroberfläche zeigt Referenzen vor allem als Bilder und Kategorien. Ohne Aufgabe und Ergebnis bereiten sie eine anspruchsvollere Beratung nur wenig vor.", "The narrow, old-fashioned interface shows references mostly as images and categories. Without the brief and outcome they do little to prepare a substantial enquiry.", "L'interface étroite et vieillissante montre surtout des images et catégories. Sans besoin initial ni résultat, ces références préparent peu une demande approfondie."),
    fact: { value: "0", label: local("erläuterte Aufgaben in der geprüften Referenzübersicht", "Explained client briefs in the checked reference overview", "Besoins clients expliqués dans la page de références examinée"), source: "2" },
    technology: { platform: "CM4all", evidence: "html" },
  },
  gigadent: {
    headline: local("Die Produktauswahl beginnt mit Unklarheit", "Product choice starts with uncertainty", "Le choix du produit commence dans le flou"),
    verdict: local("Die uneinheitliche Benutzeroberfläche führt Fachbesucher nicht klar von der Anwendung zum Gerät. Auf dem Handy erscheint zudem eine abweichende Marke, bevor die Produktauswahl verständlich wird.", "The inconsistent interface does not guide professional visitors from application to device. A different brand also appears on mobile before product choice is clear.", "L'interface incohérente ne guide pas clairement de l'application à l'appareil. Une autre marque apparaît aussi sur mobile avant que le choix soit clair."),
    fact: { value: "1", label: local("abweichende Marke „Dermato“ im mobilen Kopf", "Different “Dermato” brand in the mobile header", "Marque différente « Dermato » dans l'en-tête mobile"), source: "1" },
    technology: { platform: "IONOS MyWebsite", evidence: "html" },
  },
  laporta: {
    headline: local("Bauprojekte bleiben hinter Text verborgen", "Building projects stay behind the text", "Les projets de construction restent cachés derrière le texte"),
    verdict: local("Die gestalterisch veraltete Benutzeroberfläche gibt Bauvorhaben wenig Raum. Ohne frühe Beispiele und Wahl nach Vorhaben können Besucher Erfahrung und Projektpassung schwer einschätzen.", "The dated interface gives building projects too little space. Without early examples or a path by project type, visitors struggle to assess relevant experience.", "L'interface datée laisse peu de place aux projets. Sans exemples précoces ni choix par type de travaux, l'expérience reste difficile à évaluer."),
    fact: { value: "0", label: local("konkrete Projekte im geprüften Startseiten-Einstieg", "Specific projects in the checked homepage introduction", "Projets concrets dans l'introduction examinée"), source: "1" },
    technology: { platform: null, evidence: "unknown" },
  },
  boxen: {
    headline: local("Werkstattfälle ohne klaren ersten Schritt", "Workshop needs without a clear first step", "Des besoins d'atelier sans première étape claire"),
    verdict: local("Die dichte, veraltet wirkende Benutzeroberfläche erklärt Wartung, Diagnose und Reparatur kaum. Eine allgemeine Kontaktmöglichkeit hilft Fahrern und Werkstatt wenig bei der Vorbereitung des ersten Gesprächs.", "The dense, dated-looking interface barely explains maintenance, diagnostics and repair. Generic contact does little to prepare drivers or the workshop for a first conversation.", "L'interface dense et datée explique peu l'entretien, le diagnostic et la réparation. Le contact général prépare mal le premier échange."),
    fact: { value: "0", label: local("sichtbare Angaben zu Fahrzeug und Problem im Kontaktweg", "Visible vehicle and problem prompts in the contact path", "Champs visibles sur le véhicule et la panne dans le parcours de contact"), source: "1" },
    technology: { platform: "DS-Systems", evidence: "generator" },
  },
  dachbau: {
    headline: local("Dringende Hilfe und Sanierung im selben Strom", "Urgent help and renovation in one stream", "Urgence et rénovation dans le même flux"),
    verdict: local("Die uneinheitliche, wenig ansprechende Benutzeroberfläche stellt sehr verschiedene Dachanliegen nebeneinander. Ohne getrennte Wege müssen Besucher selbst herausfinden, was für Schaden oder Sanierung gilt.", "The inconsistent interface puts very different roofing needs side by side. Without separate paths, visitors must work out what applies to damage or renovation.", "L'interface incohérente juxtapose des besoins de toiture très différents. Sans parcours séparés, les visiteurs doivent tout démêler eux-mêmes."),
    fact: { value: "6", label: local("verschiedene Dachleistungen in einer Sammelliste", "Different roofing services in one combined list", "Prestations de toiture dans une seule liste"), source: "1" },
    technology: { platform: null, evidence: "unknown" },
  },
  mas: {
    headline: local("Tiefbaukompetenz ohne Projektführung", "Civil engineering without a project path", "Des compétences en génie civil sans parcours de projet"),
    verdict: local("Die Benutzeroberfläche wirkt wie eine ältere Firmenbroschüre. Auftraggeber finden Fachbereiche, aber kaum einen frühen Weg zu vergleichbaren Vorhaben und den Angaben für eine erste Einschätzung.", "The interface resembles an older company brochure. Buyers find disciplines but little early guidance to comparable projects or the information needed for an initial assessment.", "L'interface rappelle une ancienne brochure d'entreprise. Les donneurs d'ordre trouvent les domaines, mais peu de projets comparables ou d'indications pour une première évaluation."),
    fact: { value: "0", label: local("Einstiege nach Auftragstyp auf der geprüften Startseite", "Project-type entry points on the checked homepage", "Entrées par type de projet sur la page d'accueil examinée"), source: "1" },
    technology: { platform: "IONOS MyWebsite", evidence: "generator" },
  },
};

export function getCampaignReview(id: string): CampaignReview | undefined {
  return reviews[id] ?? (octoberCampaign.reviews as Record<string, CampaignReview>)[id];
}

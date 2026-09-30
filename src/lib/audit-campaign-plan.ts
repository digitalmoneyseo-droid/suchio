import type { Locale } from "@/i18n/config";

type Localized = Record<Locale, string>;
type Stack = "astro" | "astro-filter" | "astro-phone" | "next-catalog";

type CampaignPlan = {
  design: Localized;
  journey: Localized;
  stack: Stack;
  implementation: Localized;
  ai?: Localized;
};

const local = (de: string, en: string, fr: string): Localized => ({ de, en, fr });

export const stackDescription: Record<Stack, Localized> = {
  astro: local(
    "Astro und TypeScript für schnelle, überwiegend statische Seiten; Leistungen und Referenzen als strukturierte Content Collections. Auslieferung über Cloudflare, ein Anfrageformular bei Bedarf über einen serverseitigen Worker.",
    "Astro and TypeScript for fast, mostly static pages; services and references in structured content collections. Delivery via Cloudflare, with a server-side Worker for enquiries if needed.",
    "Astro et TypeScript pour des pages principalement statiques et rapides ; prestations et références dans des collections structurées. Diffusion via Cloudflare, avec un Worker côté serveur pour les demandes si nécessaire."
  ),
  "astro-filter": local(
    "Astro und TypeScript für die Inhaltsseiten; eine kleine React-Komponente nur für den Referenzfilter. Strukturierte Content Collections halten Projekte pflegbar, Cloudflare liefert die Seiten statisch aus.",
    "Astro and TypeScript for content pages, with a small React component only for filtering references. Structured content collections keep projects editable; Cloudflare serves the static pages.",
    "Astro et TypeScript pour les contenus, avec un petit composant React uniquement pour filtrer les références. Des collections structurées facilitent la mise à jour des projets ; Cloudflare sert les pages statiques."
  ),
  "astro-phone": local(
    "Astro und TypeScript für schlanke, mobil optimierte Informationsseiten mit klarer Anruffunktion. Die Seiten werden statisch über Cloudflare ausgeliefert; eine Onlinebuchung ist nicht Teil dieses Vorschlags.",
    "Astro and TypeScript for lean, mobile-first information pages with a clear call action. Cloudflare serves the static pages; online booking is not part of this proposal.",
    "Astro et TypeScript pour des pages d'information légères et adaptées au mobile, avec un appel clairement accessible. Cloudflare sert les pages statiques ; aucune réservation en ligne n'est prévue."
  ),
  "next-catalog": local(
    "Next.js und TypeScript für eigenständige Produktseiten und einen interaktiven Vergleich mit React. Die Produktdaten bleiben strukturiert; Anfrage und Datenvalidierung laufen serverseitig.",
    "Next.js and TypeScript for individual product pages and an interactive React comparison. Product data stays structured; enquiries and validation run on the server.",
    "Next.js et TypeScript pour des fiches produit et un comparateur interactif en React. Les données restent structurées ; les demandes et leur validation sont traitées côté serveur."
  ),
};

/** Proposals derived from the checked pages. They describe a possible build, not work already delivered. */
const plans: Record<string, CampaignPlan> = {
  mp: {
    design: local("Großformatige Fotos echter Einbauten, ruhige Typografie und klare Bereiche für Innenausbau, Möbelbau und Reparaturen statt schmaler Textblöcke.", "Large photographs of real installations, calm typography and distinct areas for interiors, furniture and repairs instead of narrow text blocks.", "De grandes photos de réalisations, une typographie sobre et des espaces distincts pour l'aménagement, le mobilier et les réparations."),
    journey: local("Besucher wählen ihr Vorhaben, sehen ähnliche Maßarbeiten mit Aufgabe und Ergebnis und können Maße, Ort und Wünsche in einer Projektanfrage nennen.", "Visitors choose their project, see relevant work with the brief and result, then describe measurements, location and wishes in an enquiry.", "Les visiteurs choisissent leur projet, voient des réalisations comparables avec besoin et résultat, puis indiquent mesures, lieu et souhaits."),
    stack: "astro-filter",
    implementation: local("Projektkarten nach Raum und Arbeitstyp filterbar machen; jedes Referenzbild mit kurzer, vom Betrieb bestätigter Projektbeschreibung versehen.", "Filter project cards by room and type of work; add a short, business-approved project description to each image.", "Filtrer les projets par pièce et type de travail ; accompagner chaque photo d'une description validée par l'entreprise."),
    ai: local("Optional könnten aus freigegebenen Projektnotizen erste Bildtexte und Kategorien vorgeschlagen werden; Veröffentlichung erst nach Ihrer Prüfung.", "Optionally, approved project notes could yield draft image text and categories, with publication only after your review.", "Des notes de projet validées pourraient servir à proposer des légendes et catégories, publiées uniquement après votre contrôle."),
  },
  alles: {
    design: local("Ein klares Raster für Sanierungsvorhaben, prägnante Projektbilder und getrennte Leistungsgruppen statt einer gleichförmigen Gewerkliste.", "A clear grid for renovation needs, strong project imagery and separate service groups rather than one uniform trade list.", "Une grille claire par projet de rénovation, des images fortes et des groupes de prestations distincts plutôt qu'une liste uniforme."),
    journey: local("Der Einstieg unterscheidet Teilgewerk und Komplettsanierung; danach folgen passende Leistungen, ein realer Projektablauf und eine Anfrage mit Eckdaten.", "The first choice separates individual trades from full renovation, followed by relevant services, a real project process and an enquiry with key details.", "Le premier choix distingue un corps de métier d'une rénovation complète, puis présente les prestations, le déroulement et une demande avec données clés."),
    stack: "astro",
    implementation: local("Leistungsseiten nach Gewerken verknüpfen und Sanierungsprojekte als eigene Fallstudien mit Umfang, Ort und Ergebnis pflegen.", "Link service pages across trades and maintain renovation projects as case studies with scope, location and result.", "Relier les pages de prestations et publier les rénovations comme études de cas avec périmètre, lieu et résultat."),
  },
  krebs: {
    design: local("Vorher-nachher-Arbeiten und hochwertige Raumaufnahmen früh zeigen; die ältere Vorlagenoptik durch ein reduziertes Bild- und Schriftsystem ersetzen.", "Lead with before-and-after work and strong room photography; replace the older template look with a restrained image and type system.", "Montrer tôt les réalisations avant/après et les espaces ; remplacer l'ancien modèle par un système sobre d'images et de typographie."),
    journey: local("Auftraggeber wählen Innenraum, Fassade oder Spezialgestaltung und gelangen direkt zu erklärten Referenzen und einem passenden Gesprächsanlass.", "Clients choose interiors, façades or specialist finishes and go directly to explained references and a relevant conversation prompt.", "Les clients choisissent intérieur, façade ou finition spéciale, puis accèdent à des références expliquées et à une prise de contact adaptée."),
    stack: "astro-filter",
    implementation: local("Referenzen mit Ausgangslage, Material und Ergebnis strukturieren; Filter nach Ausführungsbereich nur für tatsächlich vorhandene Projekte anbieten.", "Structure references by initial brief, material and result; offer category filters only for projects actually available.", "Structurer les références par besoin, matériau et résultat ; filtrer uniquement les projets réellement disponibles."),
    ai: local("Optional kann KI aus bestätigten Projektnotizen Entwürfe für Bildunterschriften erstellen; fachliche Aussagen werden manuell freigegeben.", "AI could optionally draft captions from confirmed project notes; technical claims would be approved manually.", "L'IA pourrait proposer des légendes à partir de notes confirmées ; les affirmations techniques seraient validées manuellement."),
  },
  schwenke: {
    design: local("Eine echte mobile Gestaltung mit großen, gut lesbaren Einstiegen für Therapie und Prävention; der Telefonkontakt bleibt jederzeit sichtbar.", "A genuinely mobile layout with large, readable entries for therapy and prevention; the telephone contact stays visible throughout.", "Une vraie mise en page mobile avec de grands accès lisibles à la thérapie et à la prévention ; le téléphone reste visible."),
    journey: local("Patienten finden zuerst ihr Anliegen, verstehen Behandlung und Ablauf und rufen anschließend an. Die bestehende Regel zur Terminvergabe bleibt erhalten.", "Patients first find their need, understand the treatment and process, then call. The existing appointment rule remains in place.", "Les patients trouvent d'abord leur besoin, comprennent le soin et son déroulement, puis appellent. La règle actuelle de rendez-vous est conservée."),
    stack: "astro-phone",
    implementation: local("Behandlungsseiten mit klaren Überschriften und einer durchgängigen, tastaturbedienbaren Telefonnummer aufbauen; keine Patientendaten über ein neues Formular erheben.", "Build treatment pages with clear headings and a keyboard-accessible phone link throughout; do not collect patient data through a new form.", "Créer des pages de soins aux titres clairs et un numéro de téléphone accessible au clavier ; ne pas recueillir de données de patients dans un nouveau formulaire."),
  },
  stueben: {
    design: local("Elektroarbeiten und ausgewählte Referenzen in den Vordergrund stellen; Meldungen und Katalogelemente gestalterisch zurücknehmen.", "Put electrical work and selected references first; visually reduce the prominence of news and catalogue elements.", "Mettre les travaux électriques et les références en avant ; rendre les actualités et éléments de catalogue moins dominants."),
    journey: local("Besucher wählen Installation, Hausgeräte oder Prüfung, sehen Leistungen und Beispiele und schildern erst danach ihr konkretes Anliegen.", "Visitors choose installation, appliances or inspection, review services and examples, then describe their specific need.", "Les visiteurs choisissent installation, appareils ou contrôle, voient prestations et exemples, puis décrivent leur besoin."),
    stack: "astro",
    implementation: local("E-Check und weitere Leistungen als eigenständige, verständliche Seiten pflegen; Nachrichten nur dort einbinden, wo sie den Leistungsweg stützen.", "Maintain E-Check and other services as separate, clear pages; show news only where it supports the service journey.", "Créer des pages claires pour l'E-Check et les autres prestations ; intégrer les actualités seulement lorsqu'elles aident le parcours."),
  },
  luepke: {
    design: local("Bad und Heizung mit großzügigen Fotos und klaren Überschriften darstellen; die zu breite Handyansicht durch ein responsives Raster ersetzen.", "Present bathrooms and heating with generous imagery and clear headings; replace the oversized mobile layout with a responsive grid.", "Présenter salles de bains et chauffage avec de grandes images et des titres clairs ; remplacer la page mobile trop large par une grille adaptable."),
    journey: local("Geplante Umbauten und dringender Service erhalten getrennte Einstiege. Fragen nach Anlage, Ort und Zeitbedarf passen sich dem jeweiligen Anliegen an.", "Planned renovations and urgent service get separate entries. Questions about system, location and timing follow the chosen need.", "Les projets planifiés et le dépannage urgent ont des accès distincts. Les questions sur l'installation, le lieu et le délai suivent le besoin choisi."),
    stack: "astro",
    implementation: local("Bad-, Heizungs- und Serviceseiten strukturiert pflegen; für dringende Fälle einen auffälligen Telefonweg, für Projekte eine kurze Anfrage anbieten.", "Maintain structured bathroom, heating and service pages; give urgent cases a prominent call action and projects a short enquiry.", "Structurer les pages salle de bains, chauffage et service ; proposer l'appel pour l'urgence et une demande courte pour les projets."),
  },
  weber: {
    design: local("Naturstein mit Materialdetails und großformatigen Arbeitsfotos zeigen; Anwendungen in einer ruhigen, hochwertigen Oberfläche voneinander trennen.", "Show stone through material details and large work photographs; separate applications within a calm, high-quality interface.", "Montrer la pierre par des détails de matière et de grandes photos ; distinguer les usages dans une interface sobre et soignée."),
    journey: local("Interessenten wählen den Einsatzbereich, vergleichen passende Beispiele und fragen mit Materialwunsch, Fläche und Ort an.", "Visitors choose an application, compare relevant examples and enquire with material preference, area and location.", "Les visiteurs choisissent un usage, comparent des exemples pertinents et indiquent matériau souhaité, surface et lieu."),
    stack: "astro-filter",
    implementation: local("Anwendungen und Referenzen als verknüpfte Inhalte modellieren; eine leichte Filterfunktion nach Einsatzbereich nur bei ausreichenden echten Beispielen ergänzen.", "Model applications and references as linked content; add a light application filter only when enough real examples exist.", "Relier usages et références comme contenus structurés ; ajouter un filtre léger seulement avec assez de vrais exemples."),
  },
  seta: {
    design: local("Die uneinheitliche Startseite durch ein konsistentes System aus Typografie, Projektbildern und klar abgegrenzten Bauleistungen ersetzen.", "Replace the inconsistent homepage with a coherent system of typography, project imagery and clearly separated construction services.", "Remplacer l'accueil incohérent par une typographie uniforme, des images de projets et des prestations bien distinctes."),
    journey: local("Bauherren wählen ihr Vorhaben, sehen vergleichbare ausgeführte Arbeiten und können Umfang, Standort und Planungsstand angeben.", "Clients choose their project, see comparable completed work and can share scope, location and planning stage.", "Les clients choisissent leur projet, voient des réalisations comparables et indiquent périmètre, lieu et stade de planification."),
    stack: "astro-filter",
    implementation: local("Projekte nach Bauart, Gewerk und Ergebnis pflegen; wiederholte Kundenstimmen nur mit klarer Quelle und passendem Kontext einsetzen.", "Organize projects by construction type, trade and outcome; use testimonials only with a clear source and relevant context.", "Classer les projets par type, métier et résultat ; n'utiliser les avis qu'avec une source claire et un contexte pertinent."),
    ai: local("Wenn echte Projektdaten vorliegen, kann KI erste Kategorien und Fallstudienentwürfe vorschlagen; Fotos, Fakten und Aussagen bleiben menschlich geprüft.", "With real project data, AI could suggest initial categories and case-study drafts; photos, facts and claims remain human-reviewed.", "Avec de vraies données de projet, l'IA peut proposer catégories et brouillons d'études de cas ; photos et faits restent vérifiés par une personne."),
  },
  ruppert: {
    design: local("Schaden, Sanierung und Neubau auf der Startseite sichtbar unterscheiden; Dachdetails und reale Arbeiten statt dichter Textflächen zeigen.", "Clearly distinguish damage, renovation and new roofs on the homepage; show roof details and real work instead of dense text.", "Distinguer clairement dégât, rénovation et neuf dès l'accueil ; montrer des détails de toiture et de vrais chantiers."),
    journey: local("Bei einem Schaden führt der Weg schnell zu Kontakt und Dringlichkeit; bei einer geplanten Sanierung zuerst zu Ablauf, Material und Referenz.", "Damage leads quickly to contact and urgency; planned renovation first explains process, materials and references.", "Un dégât mène rapidement au contact et à l'urgence ; une rénovation planifiée présente d'abord étapes, matériaux et références."),
    stack: "astro",
    implementation: local("Getrennte Inhaltsvorlagen für Soforthilfe und geplante Projekte vorsehen; im Anfrageweg Dachart, Anliegen und Ort nur passend zum Fall abfragen.", "Use separate content templates for urgent help and planned projects; ask for roof type, need and location only when relevant.", "Prévoir des modèles distincts pour l'urgence et les projets ; demander type de toit, besoin et lieu selon le cas."),
  },
  winter: {
    design: local("Objektbetreuung als zusammenhängendes Angebot zeigen, mit übersichtlichen Leistungspaketen und seriösen Objektbildern statt einzelner Kacheln.", "Present property care as one coherent service with clear service packages and credible property imagery instead of isolated tiles.", "Présenter l'entretien d'immeubles comme une offre cohérente, avec des ensembles de prestations et des images crédibles."),
    journey: local("Verwaltungen wählen Objektart und regelmäßigen Bedarf; Privatkunden finden ihren eigenen Weg. Danach werden Leistungsumfang und Kontakt klar.", "Managers choose property type and ongoing needs; private clients get a separate path. Scope and contact then become clear.", "Les gestionnaires choisissent type d'immeuble et besoin régulier ; les particuliers ont un parcours distinct, puis voient périmètre et contact."),
    stack: "astro",
    implementation: local("Leistungspakete als pflegbare Inhalte anlegen und im Formular nur Objektart, Ort und gewünschten Umfang abfragen.", "Maintain service packages as editable content and ask only for property type, location and required scope in the form.", "Gérer les ensembles de prestations comme contenus modifiables et demander seulement type d'immeuble, lieu et périmètre."),
  },
  och: {
    design: local("Fenster, Türen, Glas und Innenausbau in einer klaren Bildsprache ordnen; Material und handwerkliche Ausführung sichtbar machen.", "Organize windows, doors, glass and interiors in a clear visual language; show materials and workmanship.", "Organiser fenêtres, portes, vitrages et aménagement dans un langage visuel clair ; rendre visibles matériaux et savoir-faire."),
    journey: local("Besucher wählen Produkt oder Reparatur, verstehen Varianten und Einbau und fragen mit Maß, Material und Einbauort an.", "Visitors choose a product or repair, understand options and installation, then enquire with measurements, material and location.", "Les visiteurs choisissent produit ou réparation, comprennent variantes et pose, puis indiquent dimensions, matériau et lieu."),
    stack: "astro",
    implementation: local("Produktseiten mit Varianten, Einsatzort und Beispielarbeit verknüpfen; für Reparaturen einen kürzeren, direkten Kontaktweg anbieten.", "Link product pages to variants, use cases and examples; offer a shorter, direct contact route for repairs.", "Relier les fiches produit aux variantes, usages et exemples ; proposer un contact plus direct pour les réparations."),
  },
  hereth: {
    design: local("Brandschutz, Sicherheit und Metallbau als eigenständige Fachbereiche mit technischen Referenzen und ruhiger, präziser Gestaltung präsentieren.", "Present fire protection, security and metalwork as distinct fields with technical references and calm, precise design.", "Présenter protection incendie, sécurité et métallerie comme domaines distincts avec références techniques et design précis."),
    journey: local("Auftraggeber wählen den Fachbereich, prüfen Anforderungen und ähnliche Projekte und nennen Objekt, Gewerk und Planungsstand.", "Buyers choose a field, review requirements and comparable projects, then provide property, trade and planning stage.", "Les donneurs d'ordre choisissent un domaine, voient exigences et projets comparables, puis indiquent objet et avancement."),
    stack: "astro",
    implementation: local("Fachseiten mit dokumentierten Anforderungen und verifizierten Referenzen pflegen; Dateianhänge erst nach Prüfung von Bedarf und Datenschutz vorsehen.", "Maintain field pages with documented requirements and verified references; add file uploads only after need and privacy review.", "Gérer les pages métiers avec exigences documentées et références vérifiées ; n'ajouter des fichiers qu'après examen du besoin et des données."),
  },
  wagner: {
    design: local("Den Platzhalter entfernen und Bad, Heizung und Service mit einheitlicher Typografie, echten Bildern und klaren Leistungsblöcken darstellen.", "Remove the placeholder and present bathrooms, heating and service with consistent typography, real imagery and clear service sections.", "Supprimer le texte provisoire et présenter bains, chauffage et service avec typographie cohérente, vraies images et sections claires."),
    journey: local("Ein schneller Einstieg trennt geplante Projekte von Servicefällen; anschließend folgen kurze Leistungsinfos und ein passender Telefon- oder Anfrageweg.", "A quick entry separates planned projects from service cases, followed by concise service information and the appropriate call or enquiry route.", "Un accès rapide sépare projets planifiés et dépannage, puis présente la prestation et le bon contact."),
    stack: "astro",
    implementation: local("Nur bestätigte Leistungen veröffentlichen; Anfragen je nach Fall mit Badziel, Heizungsanlage oder Serviceanliegen strukturieren.", "Publish only confirmed services; structure enquiries around bathroom goals, heating system or service need as appropriate.", "Publier uniquement les prestations confirmées ; structurer les demandes selon le bain, le chauffage ou le dépannage."),
  },
  bb: {
    design: local("Hausmeisterservice und Schreinerei visuell klar trennen, aber unter einer konsistenten Marke führen; die Mobilansicht ohne überbreite Elemente neu aufbauen.", "Visually separate property services and carpentry under one coherent brand, with a mobile layout free of oversized elements.", "Distinguer visuellement entretien et menuiserie sous une même marque ; reconstruire la vue mobile sans éléments trop larges."),
    journey: local("Der erste Klick wählt den Geschäftsbereich. Leistungen und Beispiele führen danach zu einer Anfrage mit Objekt oder Werkstück.", "The first choice selects the business area. Services and examples then lead to an enquiry about a property or item of work.", "Le premier choix définit l'activité. Prestations et exemples mènent ensuite à une demande sur l'immeuble ou l'ouvrage."),
    stack: "astro",
    implementation: local("Zwei klar getrennte Inhaltsbereiche mit gemeinsamem Kontaktmodul anlegen; Formularfelder abhängig vom ausgewählten Geschäftsbereich zeigen.", "Create two clearly separated content areas with one contact module; show form fields according to the selected business area.", "Créer deux espaces de contenu distincts avec un contact commun ; adapter les champs au domaine choisi."),
  },
  geiss: {
    design: local("Referenzen größer und mit klarer Bildhierarchie zeigen; aus Katalogbildern nachvollziehbare Einbaugeschichten machen.", "Show references at a larger scale with clear image hierarchy; turn catalogue-like images into understandable installation stories.", "Agrandir les références avec une hiérarchie d'images claire ; transformer les photos de catalogue en récits d'installation."),
    journey: local("Besucher wählen Produkt und Einsatzort, sehen passende Aufgaben mit Ergebnis und fragen anschließend eine Beratung an.", "Visitors choose a product and installation location, see relevant briefs and results, then request advice.", "Les visiteurs choisissent produit et lieu de pose, voient besoins et résultats comparables, puis demandent conseil."),
    stack: "astro-filter",
    implementation: local("Referenzen nach Produktart und Einbauort strukturieren; Filter nur auf tatsächlich dokumentierte Fälle anwenden.", "Structure references by product type and installation location; filter only genuinely documented cases.", "Structurer les références par produit et lieu de pose ; filtrer uniquement les cas documentés."),
    ai: local("Optional kann KI aus bestätigten Projektdaten Schlagworte vorschlagen; konkrete Maße und Ergebnisse müssen vor Veröffentlichung geprüft werden.", "AI could optionally suggest tags from confirmed project data; dimensions and outcomes must be checked before publication.", "L'IA pourrait proposer des mots-clés à partir de données confirmées ; dimensions et résultats seraient vérifiés avant publication."),
  },
  gigadent: {
    design: local("Eine durchgängige Markenoberfläche und gut lesbare Produktkarten gestalten; Anwendungen, Geräte und technische Daten sichtbar voneinander unterscheiden.", "Create one coherent brand interface with readable product cards; clearly separate applications, devices and technical specifications.", "Créer une interface de marque cohérente et des fiches lisibles ; distinguer usages, appareils et caractéristiques techniques."),
    journey: local("Fachbesucher starten bei der Anwendung, vergleichen passende Geräte anhand bestätigter Merkmale und stellen eine gezielte Produktanfrage.", "Professional visitors start with an application, compare suitable devices using verified attributes and send a focused product enquiry.", "Les professionnels partent de l'usage, comparent les appareils selon des données validées et envoient une demande ciblée."),
    stack: "next-catalog",
    implementation: local("Ein einheitliches Datenmodell für Produktmerkmale und einen regelbasierten Vergleich aufbauen; Fachangaben werden redaktionell geprüft, nicht von KI erfunden.", "Build one data model for product attributes and a rule-based comparison; technical claims are reviewed by editors, not invented by AI.", "Créer un modèle commun de caractéristiques et un comparateur fondé sur des règles ; les données techniques sont vérifiées, non inventées par l'IA."),
  },
  laporta: {
    design: local("Echte Bauprojekte früh und groß zeigen; Text, Typografie und Bildraster nach Neubau, Erweiterung und Modernisierung ordnen.", "Show real construction projects early and prominently; organize copy, typography and imagery around new builds, extensions and modernization.", "Montrer tôt de vrais projets ; organiser textes, typographie et images autour du neuf, des extensions et de la modernisation."),
    journey: local("Besucher wählen die Art des Vorhabens, sehen ein vergleichbares Projekt mit Umfang und Ergebnis und können ihr Objekt beschreiben.", "Visitors choose their project type, see a comparable project with scope and result and can describe their property.", "Les visiteurs choisissent leur projet, voient un chantier comparable avec périmètre et résultat, puis décrivent leur objet."),
    stack: "astro-filter",
    implementation: local("Projektseiten aus strukturierten Angaben zu Bauart, Umfang und Ort erzeugen; Filter erst nach Aufbau einer belastbaren Referenzauswahl ergänzen.", "Generate project pages from structured data about type, scope and location; add filtering after a substantial reference set exists.", "Créer des pages projet à partir de données structurées ; ajouter un filtre seulement avec suffisamment de références."),
  },
  boxen: {
    design: local("Wartung, Diagnose und Reparatur als klar erkennbare Bereiche gestalten; Leistungen und Werkstattablauf statt dichter Textflächen zeigen.", "Give maintenance, diagnostics and repairs clearly distinct areas; show services and workshop process instead of dense text.", "Créer des espaces distincts pour entretien, diagnostic et réparation ; montrer prestations et déroulement plutôt qu'un texte dense."),
    journey: local("Fahrer wählen ihr Anliegen, verstehen den nächsten Werkstattschritt und teilen Fahrzeugtyp, Problem und Erreichbarkeit mit.", "Drivers choose their need, understand the next workshop step and provide vehicle type, problem and contact details.", "Les conducteurs choisissent leur besoin, comprennent l'étape suivante et indiquent véhicule, problème et coordonnées."),
    stack: "astro",
    implementation: local("Servicefälle in pflegbaren Leistungsseiten erklären; eine kurze Anfrage mit Fahrzeug- und Problemdaten serverseitig validieren.", "Explain service cases in editable pages; validate a short vehicle-and-problem enquiry on the server.", "Expliquer les prestations dans des pages modifiables ; valider côté serveur une courte demande sur le véhicule et la panne."),
  },
  dachbau: {
    design: local("Dachschaden und geplante Sanierung sofort trennen; reale Dachdetails, Arbeitsbilder und klare Handlungsflächen statt einer langen Sammelliste einsetzen.", "Separate roof damage from planned renovation immediately; use real roof details, work imagery and clear actions instead of one long list.", "Séparer immédiatement sinistre et rénovation ; montrer détails de toiture, chantiers et actions claires plutôt qu'une longue liste."),
    journey: local("Bei Schaden zählt ein schneller Telefonweg; bei Sanierung führen Ablauf, Referenzen und Dachart zu einer vorbereiteten Anfrage.", "Damage calls for a fast phone route; renovation uses process, references and roof type to prepare an enquiry.", "Un sinistre mène vite au téléphone ; une rénovation passe par le déroulement, les références et le type de toit."),
    stack: "astro",
    implementation: local("Dringende und geplante Anliegen in getrennten Inhaltsvorlagen pflegen; Anfragen nur mit den für Dachart und Vorhaben nötigen Angaben versehen.", "Maintain urgent and planned needs in separate content templates; ask only for details needed for roof type and project.", "Gérer urgences et projets dans des modèles distincts ; demander seulement les données utiles sur la toiture et le besoin."),
  },
  mas: {
    design: local("Fachbereiche mit belastbaren Baustellenbildern und klarer technischer Hierarchie präsentieren; den broschürenhaften Einstieg vereinfachen.", "Present disciplines with credible site photographs and a clear technical hierarchy; simplify the brochure-like introduction.", "Présenter les domaines avec de vraies photos de chantier et une hiérarchie technique claire ; simplifier l'accueil de type brochure."),
    journey: local("Auftraggeber wählen Tiefbauvorhaben und sehen vergleichbare Projekte, Leistungsumfang und Angaben für ein erstes Fachgespräch.", "Buyers choose a civil engineering need and see comparable projects, scope and the details needed for an initial discussion.", "Les donneurs d'ordre choisissent leur projet, voient références et périmètre et trouvent les données utiles au premier échange."),
    stack: "astro-filter",
    implementation: local("Projekte nach Auftragstyp, Fachbereich und Planungsstand strukturieren; technische Angaben und Referenzen vom Betrieb freigeben lassen.", "Structure projects by contract type, discipline and planning stage; have the business approve technical details and references.", "Structurer les projets par type de marché, domaine et stade de planification ; faire valider les données techniques et références."),
    ai: local("Optional könnte KI freigegebene Projektunterlagen für interne Schlagwortvorschläge auswerten; vertrauliche Dokumente nur nach gesonderter Freigabe.", "AI could optionally suggest internal tags from approved project material; confidential documents only with separate permission.", "L'IA pourrait proposer des mots-clés internes à partir de dossiers approuvés ; documents confidentiels uniquement après autorisation distincte."),
  },
};

export function getCampaignPlan(id: string): CampaignPlan | undefined {
  return plans[id];
}

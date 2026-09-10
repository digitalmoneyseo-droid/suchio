# Neue Briefaktion

Die sechs Einzelbriefe haben jeweils genau eine DIN-A4-Seite. Die Sammeldatei hat sechs Seiten. **Einseitig** bei tatsächlicher Größe drucken. Die frühere doppelseitige Fassung wird für diese Aktion ersetzt.

Die Briefe sind für individuelle Auditseiten auf suchio.net vorbereitet. **Erst verteilen, wenn die sechs Auditlinks und suchio.net/audit/privacy veröffentlicht und live geprüft sind.** Die lokale Implementierung allein macht die im Brief genannten URLs noch nicht erreichbar. Die Veröffentlichung ist kein Bestandteil des PDF-Exports.

## Inhalt und Nachweise

Die Kurzvorstellung, Anschriften, Datum, Betreff, Ansprache und der Abschluss entsprechen jetzt einem Geschäftsbrief. Im Haupttext stehen konkrete Hindernisse aus Kundensicht. Die Briefe enthalten keine technische Gesamtnote. Einzelne Performance-Messwerte sind ausdrücklich als mobile Labortests bezeichnet. Die vollständigen vier Lighthouse-Kategorien stehen auf der Detailseite und werden dort erklärt. Bei Marquardt bleiben die wegen Ladezeitlimit unvollständigen Gesamtwertungen unveröffentlicht.

Die technischen Messungen stammen vom 08.09.2026. Briefdatum ist der 09.09.2026. Vor einer deutlich späteren Aktion die Befunde erneut prüfen, insbesondere die Suchmaschinen-Sperren bei Marquardt. Auswirkungen auf Umsatz, reale Buchungsquoten und konkrete Google-Platzierungen sind nicht gemessen und werden nicht als feststehende Verluste dargestellt.

Eine vollständige Quellenliste und ein ausführlicher Prüfbericht müssen nicht pauschal auf jedem Werbebrief abgedruckt werden. Aussagen müssen aber zutreffen; eine Auswahl darf keinen irreführenden Gesamteindruck erzeugen. Darum bleiben Prüftag und der Hinweis auf den Labortest im Brief, während Details und Nachweise auf die verlinkte Seite wandern. Quellen: [§ 5 UWG](https://www.gesetze-im-internet.de/uwg_2004/__5.html), [§ 5a UWG](https://www.gesetze-im-internet.de/uwg_2004/__5a.html).

## Datenschutz in zwei Ebenen

Der Brief enthält Verantwortlichen, Werbezweck, Rechtsgrundlage, Datenarten, wesentliche Datenweitergaben einschließlich KI und USA, Betroffenenrechte und einen hervorgehobenen Werbewiderspruch. Die vollständigen Informationen stehen unter `/audit/privacy`, ebenso in den englischen und französischen Sprachversionen. Die Informationen müssen auf Wunsch auch kostenlos auf Papier bereitgestellt werden. Ein bloßer Link ohne grundlegende Information wäre hier zu knapp.

Die [vom EDSA bestätigten Transparenzleitlinien](https://www.edpb.europa.eu/documents/guideline/transparency_en), insbesondere Randnummern 36 bis 38, sehen eine gestufte Information auch außerhalb rein digitaler Kontakte vor. Umfang und Ausgestaltung bleiben vom konkreten Fall abhängig. Der Hinweis ist keine verbindliche anwaltliche Freigabe und heilt keine unzulässige Datenerhebung oder Weitergabe.

Die individuellen Links sind schwer erratbar, aber nicht passwortgeschützt. Jeder mit dem Link kann den jeweiligen Bericht lesen oder weitergeben. Die Seiten enthalten keine Empfängeranschriften, stehen nicht in Navigation oder Sitemap und tragen noindex. Eine garantierte Geheimhaltung oder Nichtauffindbarkeit ist das nicht. Es wurde kein zusätzliches Klick-, Öffnungs- oder Empfängertracking eingebaut. Cloudflare verarbeitet Inhalte und technische Zugriffsdaten gemäß den Website-Datenschutzhinweisen.

Mit der Online-Bereitstellung entsteht eine neue Aufbewahrung: Die Auditseiten bleiben während der Aktion und einer Rückmeldefrist von 30 Tagen verfügbar. Danach müssen Arbeitsdateien, Druckdateien und die Online-Berichte entfernt werden, soweit kein konkreter Klärungsbedarf besteht. Das Entfernen der Seiten erfordert ein neues Deployment; es gibt keine automatische Abschaltung. Alte Builds, Versionshistorien, lokale Dateien und Anbieter-Speicher sind im Löschverfahren zu berücksichtigen. KI-Daten müssen beim Anbieter separat gelöscht werden. Minimale Werbesperrinformationen bleiben bei einem Widerspruch erhalten. Wenn ihr eine andere Rückmeldefrist wollt, muss sie vor Verteilung in allen Sprachversionen angepasst werden.

## Empfängeranschriften

- CW Cosmetics: Hauptstraße 26, 65795 Hattersheim am Main. Quelle: Kontaktabschnitt der Startseite.
- Marquardt Küchen, Werksstudio Kriftel: Beyerbachstraße 1, 65830 Kriftel. Quelle: im Browser geladene Standortseite.
- LM Limousines GmbH: Beyerbacherstrasse 7, 65830 Kriftel. Schreibweise aus dem Kontaktbereich der Startseite übernommen.
- PowerHouse Main-Taunus: Hofheimer Straße 3, 65719 Hofheim-Lorsbach. Quelle: Kontaktseite.
- The Varied Project: In den Gartenwiesen 17-19, 65830 Kriftel. Quelle: öffentlicher Kontaktbereich der Startseite.
- Allround-Handwerk: Edenkobenerstraße 43, 65931 Frankfurt am Main. Quelle: das vom Auftraggeber ausdrücklich benannte, über die Website verlinkte Impressum-PDF.

Bei Allround-Handwerk stammt die Anschrift damit aus einem Pflichtimpressum. Die DSK beurteilt die Übernahme von Pflichtimpressumsdaten für Werbung restriktiv. Diese Quelle wird hier offengelegt und nicht als datenschutzrechtlich unproblematisch dargestellt. Die Berechtigung zur konkreten werblichen Nutzung und der geschäftliche Bezug des Briefkastens müssen vor der Verteilung geklärt sein. Quelle: [DSK-Orientierungshilfe Direktwerbung](https://www.datenschutzkonferenz-online.de/media/oh/OH-Werbung_Februar%202022_final.pdf). Die vom Nutzer gewünschte Aufnahme in einen Entwurf ersetzt diese Prüfung nicht.

Bei „Keine Werbung“, bekanntem Widerspruch oder entgegenstehendem Hausrecht nicht einwerfen. Die Briefe sind Werbung; ihre Form als individueller Website-Check ändert das nicht. Keine ungefragten Werbeanrufe oder E-Mails aus den recherchierten Kontakten ableiten. Quelle: [§ 7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html).

## Technische Umsetzung

Die Inhalte liegen serverseitig in `src/content/audits.json`. Briefanschriften liegen nur in den lokalen Arbeitsdaten und PDFs. Die 18 Auditseiten und drei Datenschutzhinweise werden statisch für Deutsch, Englisch und Französisch erzeugt. Zufällige Linkcodes bleiben bei erneuter PDF-Erstellung stabil. Kontaktbuttons führen zur bestehenden Kontaktseite oder zu einer E-Mail. Die bisherigen Rechercheunterlagen bleiben für die Nachweisprüfung lokal verfügbar und werden nicht ungefiltert ins Web kopiert.

Beim lokalen Prüflauf wurden PDF-Seitenformat, Seitenzahl, Layout und QR-Code-Ziele kontrolliert. Die finalen Website-Prüfergebnisse werden im Übergabehinweis genannt. Andere bereits vorhandene Änderungen an der Website dürfen nicht versehentlich mitveröffentlicht werden.

Prüfstand 09.09.2026: Next- und vinext-Build erfolgreich, 51 statische Cloudflare-Seiten einschließlich der 21 neuen Audit- und Datenschutzausgaben. 28 Unit-Tests bestanden. Die vier Audit-Browsertests bestehen auf beiden Runtimes, einschließlich aller 18 Detail-URLs, Datenschutzlinks, unbekannter Codes, Nichtindexierung, Ausschluss aus der Sitemap, mobiler Darstellung und automatischer Prüfung der Barrierefreiheit. Im umfassenden Browserlauf bestand zunächst 80 von 86 Tests bei zwei vorgesehenen Auslassungen. Die beiden neuen Auditfehler wurden korrigiert und erfolgreich nachgeprüft; ein zeitweilig fehlgeschlagener Firefox-Test bestand anschließend ebenfalls. Ein bestehender WebKit-Test zum Öffnen der Homepage-FAQ schlägt weiterhin fehl. Der Gesamtstand ist deshalb nicht vollständig freigegeben. Kein Produktionsdeployment wurde durchgeführt.

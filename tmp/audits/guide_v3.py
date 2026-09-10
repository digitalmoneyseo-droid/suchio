from pathlib import Path
import json
root=Path.cwd()
target=root/'output/pdf/briefaktion-v3'
source=(root/'output/pdf/briefaktion-v2/Hinweise_zur_neuen_Fassung.md').read_text('utf-8')
source=source.replace('# Neue Briefaktion','# Briefaktion – Fassung 3')
source=source.replace('suchio.net/audit/privacy','suchio.net/datenschutz#briefwerbung').replace('`/audit/privacy`','`/datenschutz#briefwerbung`')
source=source.replace('Die vollständigen Informationen stehen unter', 'Die vollständigen Informationen sind in die bestehende Datenschutzerklärung integriert und stehen unter')
source=source.replace('Die 18 Auditseiten und drei Datenschutzhinweise werden statisch für Deutsch, Englisch und Französisch erzeugt.', 'Die 18 Auditseiten werden statisch für Deutsch, Englisch und Französisch erzeugt. Der Abschnitt zur Briefwerbung ergänzt die bestehende Datenschutzerklärung in allen drei Sprachen. /datenschutz ist ein Alias derselben Erklärung; /privacy bleibt deren kanonische Adresse.')
source=source.split('Prüfstand 09.09.2026:')[0]
source+='''## Änderungen in Fassung 3

Absenderdaten stehen rechts in einer Spalte; Suchio steht dort alleine in der ersten Zeile. Über dem Empfänger steht keine zusätzliche Absenderzeile. Jeder Brief nennt durchgehend das Unternehmen mit seiner geprüften Website.

Die drei wichtigsten Punkte stehen in einer Tabelle: Beobachtung, Folge für Interessenten, unser Ansatz. Jeder Brief enthält außerdem eine individuelle Grafik. Bei vorgeschlagenen Nutzerwegen steht ausdrücklich „Unser Vorschlag“; Befundgrafiken zeigen die nachgewiesenen Linkziele, Seiteneinstiege oder Messwerte. Es handelt sich nicht um Website-Screenshots. Die beiden nächsten Schritte sind hervorgehoben: ausführlichen Audit ansehen und per E-Mail oder Telefon Kontakt aufnehmen.

Eine zusätzliche Datenschutzseite für Audits entfällt. Die vorhandene Erklärung wird um den Abschnitt Briefwerbung ergänzt, erreichbar über suchio.net/datenschutz#briefwerbung. Der kurze gedruckte Hinweis und der separate Werbewiderspruch bleiben erhalten.

Alle sechs Einzel-PDFs wurden auf eine A4-Seite, Schriftbild, Abstände, Unternehmens- und Auditlinks sowie lesbare QR-Codes geprüft. Die Sammeldatei umfasst sechs Seiten.
'''
(target/'Hinweise_zur_neuen_Fassung.md').write_text(source,encoding='utf-8')
audits=json.loads((root/'src/content/audits.json').read_text('utf-8'))
letters=json.loads((root/'tmp/audits/letters-ready.json').read_text('utf-8'))
links='# Auditlinks – lokale Vorschau und vorgesehene Veröffentlichung\n\nDie Produktionslinks sind vorbereitet, aber im Rahmen dieser Überarbeitung nicht veröffentlicht.\n\n'
for a,l in zip(audits,letters):
    links+=f"- **{l['address'][0]}**: [Lokale Vorschau](http://localhost:3121/audit/{a['code']}) · [Vorgesehener Auditlink](https://suchio.net/audit/{a['code']})\n"
links+='\n[Datenschutzhinweis lokal ansehen](http://localhost:3121/datenschutz#briefwerbung). Die lokale Vorschau setzt den laufenden Server auf Port 3121 voraus.\n'
(target/'Auditlinks.md').write_text(links,encoding='utf-8')

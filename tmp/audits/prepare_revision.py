import json, secrets
from pathlib import Path

root = Path.cwd()
tmp = root / 'tmp/audits'
old = json.loads((tmp / 'content.json').read_text('utf-8'))
letters = json.loads((tmp / 'revision-copy.json').read_text('utf-8'))
translations = json.loads((tmp / 'translations.json').read_text('utf-8'))
target = root / 'src/content/audits.json'
previous = json.loads(target.read_text('utf-8')) if target.exists() else []
codes = {d['id']: d['code'] for d in previous}
summaries = {
 'cw': 'Neue Kundinnen müssen zu lange suchen, bevor sie eine Behandlung auswählen und einen Termin anfragen können. Der mobile Einstieg räumt dem Titelbild und den Teamvorstellungen zu viel Platz ein. Schwache Textkontraste und ein großes Bild erschweren den Besuch zusätzlich.',
 'marquardt': 'Startseite und Standortseite Kriftel lieferten Sperrsignale für Suchmaschinen. Die zentrale Webbetreuung sollte diesen Punkt zuerst klären. Überlagerte Dialoge erschweren außerdem den mobilen Erstbesuch, und der Aktionsslider hat konkrete Bedienungsfehler.',
 'lm': 'Die Fahrzeugauswahl und wiederholende Texte machen die Buchungsentscheidung unnötig umständlich. Vier Detail-Links führen an dieselbe Stelle. Schwache Kontraste und 57 mobile Performance-Punkte passen aus unserer Sicht nicht zum Anspruch eines Premium-Transfers.',
 'powerhouse': 'Der Weg zum ersten passenden Kurs verlangt zu viel Suchen. Preise, Vorbereitung und Buchung sind auf mehrere Seiten verteilt. Im mobilen Einstieg fehlt eine klare Hilfe für neue Gäste; die Buchungsoberfläche sollte eine einheitliche Sprache verwenden.',
 'varied': 'Der Auftritt zeigt die Band, führt aber zu spät zu den Informationen, die für eine Buchungsanfrage entscheiden. Eventarten, Live-Eindruck und Anfrage sollten zusammenstehen. Dazu verschiebt sich der Inhalt beim mobilen Laden deutlich.',
 'allrounder': 'Die angegebene HOME-Adresse zeigt vor allem Kontakt und App-Werbung. Die eigentlichen Leistungen stehen unter einem anderen Einstieg. Diese Aufteilung, fremde Plattformwerbung und große Leerbereiche lassen den Auftritt aus unserer Sicht unfertig wirken.'
}
data = []
for original, letter in zip(old, letters):
    assert original['id'] == letter['id']
    ident = original['id']
    report = json.loads((tmp / f'{ident}-full.report.json').read_text('utf-8'))
    metrics = report['audits']
    localized = {
      'de': dict(title=original['title'].replace('\n', ' '), summary=summaries[ident], findings=original['findings'], steps=original['steps'], flow=original['flow'], cta=original['cta'], methodextra=original['methodextra']),
      **translations[ident]
    }
    localized['de']['title'] = {'marquardt': 'Suchmaschinen-Sperren zuerst klären', 'lm': 'Die Fahrzeugauswahl muss zum passenden Detail führen'}.get(ident, localized['de']['title'])
    item = dict(id=ident, code=codes.get(ident, secrets.token_hex(10)), company=original['company'], url=original['url'], measuredAt='2026-09-08', lighthouseVersion=report['lighthouseVersion'], scores=None if ident=='marquardt' else [round(report['categories'][key]['score'] * 100) for key in ['performance','accessibility','best-practices','seo']], metrics=None if ident=='marquardt' else [round(metrics['largest-contentful-paint']['numericValue']/1000,1), round(metrics['total-blocking-time']['numericValue']), round(metrics['cumulative-layout-shift']['numericValue'],3)], sources=original['sources'], content=localized)
    for locale, content in localized.items():
        assert len(content['findings']) == 3 and len(content['steps']) == 3 and len(content['flow']) == 3, locale
    data.append(item)
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', 'utf-8')
for letter, item in zip(letters, data):
    letter['code'] = item['code']
    letter['url'] = 'https://suchio.net/audit/' + item['code']
(tmp / 'letters-ready.json').write_text(json.dumps(letters, ensure_ascii=False, indent=2), 'utf-8')
print('Prepared 6 letters and 18 localized audit pages; stable individual URLs retained.')

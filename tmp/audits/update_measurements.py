import json
from pathlib import Path
p=Path('tmp/audits/content.json');data=json.loads(p.read_text('utf-8'))
for d in data:
 r=json.loads(Path(f'tmp/audits/{d["id"]}-full.report.json').read_text('utf-8'))
 d['scores']=[round(r['categories'][k]['score']*100) for k in ['performance','accessibility','best-practices','seo']]
 for source in d['sources']:
  source[1]=source[1].replace('und Chrome-Trace','und Browserprüfung').replace('und Chrome-Trace','und Browserprüfung')
 if d['id']=='cw':
  d['metric']='5,4 s';d['metriclabel']='LCP im simulierten Mobiltest'
  d['metricnote']='Zeit bis zum größten sichtbaren Element. Das Titelbild ist rund 1,55 MB groß. Lighthouse schätzt dafür 1,11 MB Einsparpotenzial.'
  d['findings'][1][1]=d['findings'][1][1].replace('[1, 2]','[1, 2, 3]')
  d['findings'][2]=['Das Titelbild lädt unnötig viele Daten', 'Die Datei AdobeStock_433183022 auf dem Bild-CDN umfasst rund 1,55 MB. Lighthouse schätzt für dieses Bild etwa 1,11 MB Einsparpotenzial. Der simulierte Mobiltest erreicht 66 Performance-Punkte und einen LCP von 5,4 Sekunden. [1, 2]', 'Bildgröße und Kompression anpassen, ein modernes Format ausliefern und die Sichtbarkeit des Einstiegs erneut messen.']
  d['steps'][0][2]='Das große Titelbild optimieren, Behandlungen früher zeigen und Textkontraste überarbeiten.'
  d['methodextra']='LCP bezeichnet den Zeitpunkt des größten sichtbaren Elements. Einsparpotenziale sind Tool-Schätzungen. Keine Prüfung des tatsächlichen Anfrageeingangs.'
 elif d['id']=='marquardt':
  d['scores']=[None,85,69,69]
  d['steps'][2][2]='Slider zugänglich umsetzen und die Ladezeit in einem vollständig abgeschlossenen mobilen Test erneut prüfen.'
  d['methodextra']='Marquardt: Performance wegen Zeitlimit nicht gewertet. Die übrigen Punkte stammen aus dem separaten mobilen DevTools-Audit. Werte gelten für die Startseite; Kriftel separat per Browser und HTTP geprüft.'
 elif d['id']=='lm':
  d['steps'][2][2]='Suchwortlisten kürzen. Den verspäteten Cookie-Dialog und seine Ladeabhängigkeiten im Erstbesuch untersuchen.'
  d['methodextra']='LCP 14,9 s im simulierten Erstaufruf; größtes Element ist der Cookie-Text, nicht das Fahrzeugbild. Keine abgeschlossene Buchung oder Prüfung realer Buchungsquoten.'
 elif d['id']=='powerhouse':
  d['metric']='5,2 s';d['metriclabel']='LCP im simulierten Mobiltest'
  d['metricnote']='Zeit bis zum größten sichtbaren Element. Lighthouse schätzt für ein großes Bild rund 178 KiB Einsparpotenzial. Zugänglichkeit: 91 Punkte im selben Lauf.'
  d['steps'][2]=['Anschließend','Bilder und Metadaten','Das große Bild mit rund 178 KiB geschätzter Ersparnis optimieren. H1 ergänzen und Metadaten im ausgelieferten HTML kontrollieren.']
  d['methodextra']='SEO 85: Die gemeldete Meta-Beschreibung war später im DOM vorhanden; kein gesicherter Dauerfehler. Bildersparnis ist eine Tool-Schätzung. LCP ist der Zeitpunkt des größten sichtbaren Elements.'
 elif d['id']=='varied':
  d['metriclabel']='CLS im simulierten Mobiltest'
  d['metricnote']='Der Test zeigt Layoutverschiebungen, einschließlich des Cookie-Dialogs. CLS ist einheitslos; der gute Bereich endet bei 0,10. Laborwert, keine Besucherdaten. [3, 4]'
  d['methodextra']='LCP 6,6 s, größtes Element ist der Cookie-Text. Terminstand aus dem Live-Browser, nicht aus dem älteren Suchindex. LCP ist der Zeitpunkt des größten sichtbaren Elements.'
  d['sources'][1][1]='Veranstalterseite; aktuelle Termine unter /Termine/'
  d['sources'][1][2]='https://www.variedproject.de/Fuer-Veranstalter/'
 elif d['id']=='allrounder':
  d['methodextra']='LCP 13,8 s für den Kontakttext im simulierten Mobiltest. 100 Punkte in den übrigen Kategorien bewerten keine inhaltliche Vollständigkeit. Android-Version separat geprüft.'
p.write_text(json.dumps(data,ensure_ascii=False,indent=2),'utf-8')

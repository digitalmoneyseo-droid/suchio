import json
from pathlib import Path
root=Path.cwd()
audits=json.loads((root/'src/content/audits.json').read_text('utf-8'))
text='# Vorschau der Auditseiten\n\nDie Seiten sind lokal umgesetzt. Die Produktionslinks sind noch nicht veröffentlicht. Die lokale Vorschau läuft unter http://localhost:3120.\n\n'
for audit in audits:
    path='/audit/'+audit['code']
    text+=f'- {audit["company"]}: [lokale Vorschau](http://localhost:3120{path}) · vorgesehene Adresse: https://suchio.net{path}\n'
text+='\n[Datenschutzhinweis zur Briefansprache](http://localhost:3120/audit/privacy)\n\nDie Sprachwahl bietet jeweils dieselben Inhalte auf Deutsch, Englisch und Französisch. Die Auditcodes stehen weder in der Navigation noch in der Sitemap. Vor Verteilung müssen die Produktionslinks und der Datenschutzhinweis live geprüft werden.\n'
(root/'output/pdf/briefaktion-v2/Auditlinks.md').write_text(text,'utf-8')

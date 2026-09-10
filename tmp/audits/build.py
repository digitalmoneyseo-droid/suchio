import json, re, html
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
from pypdf import PdfReader, PdfWriter
import pymupdf

ROOT=Path.cwd(); OUT=ROOT/'output/pdf'; OUT.mkdir(parents=True,exist_ok=True)
TMP=ROOT/'tmp/audits'; DATA=json.loads((TMP/'content.json').read_text('utf-8'))
for name,file in [('DM','DMsans-Regular.ttf'),('DMS','DMsans-Semibold.ttf')]:pdfmetrics.registerFont(TTFont(name,str(TMP/file)))
pdfmetrics.registerFontFamily('DM',normal='DM',bold='DMS',italic='DM',boldItalic='DMS')
INK=HexColor('#171717'); MUTED=HexColor('#525252'); BLUE=HexColor('#0064d1'); PALE=HexColor('#f2f6fa'); LINE=HexColor('#d5dde5')
W,H=595.2756,841.8898; M=43; CW=W-2*M
logo=svg2rlg(str(ROOT/'public/suchio-logo-light.svg')); logo.scale(102/logo.width,102/logo.width)
ST={
 'body':ParagraphStyle('body',fontName='DM',fontSize=10,leading=13.7,textColor=INK),
 'small':ParagraphStyle('small',fontName='DM',fontSize=8,leading=10.5,textColor=MUTED),
 'tiny':ParagraphStyle('tiny',fontName='DM',fontSize=7.4,leading=9.5,textColor=MUTED),
 'heading':ParagraphStyle('heading',fontName='DMS',fontSize=12,leading=15,textColor=INK),
 'title':ParagraphStyle('title',fontName='DMS',fontSize=29,leading=31.5,textColor=INK),
 'company':ParagraphStyle('company',fontName='DMS',fontSize=10.5,leading=14,textColor=BLUE)
}
def esc(s):return html.escape(s).replace('\n','<br/>')
def para(c,text,x,y,width=CW,style='body',raw=False):
 p=Paragraph(text if raw else esc(text),ST[style]); _,h=p.wrap(width,1000);p.drawOn(c,x,y-h);return y-h
def header(c,d,n):
 renderPDF.draw(logo,c,M,H-68)
 c.setFont('DM',8);c.setFillColor(MUTED);c.drawRightString(W-M,H-42,'WEBSITE-CHECK  /  WERBUNG')
 c.drawRightString(W-M,H-55,'08.09.2026')
 c.setFont('DM',7.8);c.drawString(M,30,'suchio · Digitales Wachstum und Technologie · Hattersheim am Main')
 c.drawRightString(W-M,30,f'{n} / 2')
def bars(c,values,y):
 labels=['Performance','Zugänglichkeit','Best Practices','Technisches SEO'];gap=18;bw=(CW-3*gap)/4
 for i,(label,v) in enumerate(zip(labels,values)):
  x=M+i*(bw+gap);c.setFillColor(MUTED);c.setFont('DM',8.3);c.drawString(x,y,label)
  c.setFillColor(INK);c.setFont('DMS',23 if v is not None else 15);c.drawString(x,y-28,str(v) if v is not None else 'nicht gewertet')
  if v is not None:
   c.setFont('DM',9);c.drawString(x+pdfmetrics.stringWidth(str(v),'DMS',23)+4,y-28,'/ 100')
  c.setFillColor(LINE);c.roundRect(x,y-41,bw,4,2,fill=1,stroke=0)
  if v is not None:c.setFillColor(BLUE);c.roundRect(x,y-41,bw*v/100,4,2,fill=1,stroke=0)
 return para(c,'Lighthouse · Mobil · Ein simulierter Testlauf, kein Google-Ranking und kein Gütesiegel.',M,y-50,style='tiny')
def metric(c,d,y):
 h=73;c.setFillColor(PALE);c.roundRect(M,y-h,CW,h,7,fill=1,stroke=0)
 c.setFillColor(BLUE);c.setFont('DMS',19);c.drawString(M+12,y-27,d['metric'])
 para(c,d['metriclabel'],M+148,y-12,CW-161,'heading')
 para(c,d['metricnote'],M+148,y-33,CW-161,'small')
 return y-h
def page1(c,d):
 header(c,d,1);y=para(c,d['company'],M,H-87,style='company')-8
 y=para(c,d['title'],M,y,style='title')-13
 y=para(c,d['greeting'],M,y,style='body')-4
 y=para(c,d['intro'],M,y,style='body')-20
 if d['id']=='marquardt':
  y=para(c,'Lighthouse ohne belastbare Gesamtwertung',M,y,style='heading')-5
  y=para(c,'Der Mobiltest erreichte das Ladezeitlimit. Deshalb zeigen wir keine Gesamtpunktzahlen. Die folgenden Befunde wurden zusätzlich im Browser beziehungsweise per HTTP geprüft.',M,y,style='small')-27
 else:y=bars(c,d['scores'],y)-12
 y=metric(c,d,y)-17
 for i,(title,fact,rec) in enumerate(d['findings'],1):
  c.setFillColor(BLUE);c.setFont('DMS',10);c.drawString(M,y-12,f'0{i}')
  y=para(c,title,M+28,y,CW-28,'heading')-4
  y=para(c,fact,M+28,y,CW-28,'body')-3
  y=para(c,'<b>Unser Vorschlag.</b> '+esc(rec),M+28,y,CW-28,'body',True)-13
 print(d['id'],'page1 bottom',round(y,1));assert y>47,(d['id'],'page1 overflow',y)
 c.showPage()
def page2(c,d):
 header(c,d,2);y=para(c,d['company'],M,H-87,style='company')-9
 y=para(c,'So würden wir beginnen',M,y,style='title')-18
 widths=[62,132,CW-194]
 for i,(priority,title,body) in enumerate(d['steps']):
  priority=priority.replace('Anschließend','Zuletzt')
  title=title.replace('Suchmaschinen-Freigabe','Indexierung')
  cells=[Paragraph(esc(priority),ST['small']),Paragraph(esc(title),ST['heading']),Paragraph(esc(body),ST['body'])]
  heights=[p.wrap(w-12,1000)[1] for p,w in zip(cells,widths)];rh=max(heights)+20
  if i%2==0:c.setFillColor(PALE);c.roundRect(M,y-rh,CW,rh,5,fill=1,stroke=0)
  x=M
  for p,w,h in zip(cells,widths,heights):p.drawOn(c,x+7,y-10-h);x+=w
  y-=rh
 y-=17;y=para(c,d['flowtitle'],M,y,style='heading')-11
 bw=(CW-28)/3
 for i,label in enumerate(d['flow']):
  x=M+i*(bw+14);c.setStrokeColor(LINE);c.setFillColor(Color(1,1,1));c.roundRect(x,y-39,bw,39,5,fill=1,stroke=1)
  c.setFont('DMS',9);c.setFillColor(BLUE);c.drawString(x+9,y-15,str(i+1))
  para(c,label,x+24,y-10,bw-30,'small')
  if i<2:
   c.setStrokeColor(BLUE);c.line(x+bw+3,y-19,x+bw+11,y-19);c.line(x+bw+8,y-16,x+bw+11,y-19);c.line(x+bw+8,y-22,x+bw+11,y-19)
 y-=53;y=para(c,d['cta'],M,y,style='body')-11
 y=para(c,'<b>contact@suchio.net</b>  ·  +49 176 42767348  ·  <b>suchio.net</b>',M,y,style='body',raw=True)-5
 y=para(c,'Aleks Tsenov · suchio · Bergstraße 41 · 65795 Hattersheim am Main',M,y,style='small')-15
 y=para(c,'Prüfumfang und Quellen',M,y,style='heading')-5
 method='Stand 08.09.2026. Lighthouse 13.4.1, Mobil, simuliertes Slow 4G und 4-fache CPU-Verlangsamung, frisches Profil, ein Lauf je URL. Ergänzende Browser- und DOM-Prüfung. Laborwerte, keine repräsentativen Nutzerdaten. Keine Ranking- oder Umsatzgarantie.'
 y=para(c,method+' '+d['methodextra'],M,y,style='tiny')-7
 for num,label,url in d['sources']:
  txt=f'[{num}] {label}. {url}'
  y=para(c,txt,M,y,style='tiny')-2
 y-=10
 y=para(c,'Keine weitere Werbung gewünscht?',M,y,style='heading')-4
 y=para(c,'Sie können der Verarbeitung Ihrer Daten für Direktwerbung jederzeit widersprechen. Eine Nachricht an contact@suchio.net oder an die oben genannte Postanschrift genügt.',M,y,style='small')-10
 y=para(c,'Datenschutz zu dieser einmaligen Ansprache',M,y,style='small')-3
 notice='Verantwortlich ist Aleks Tsenov, suchio, mit den oben genannten Kontaktdaten. Wir verwenden öffentlich zugängliche geschäftliche Angaben, Website-Inhalte und Prüfbefunde aus den genannten Websites für diese einmalige Briefwerbung. Soweit diese Daten personenbezogen sind, stützen wir dies auf Art. 6 Abs. 1 lit. f DSGVO; unser Interesse ist die Vorstellung passender geschäftlicher Leistungen. Druck und Verteilung erfolgen durch uns, ohne CRM oder externe Druckerei. Arbeitsdateien werden nach Abschluss der Aktion gelöscht, soweit kein konkreter Klärungsbedarf besteht; erforderliche Werbesperrvermerke bleiben erhalten.\nFür KI-gestützte Recherche und Texterstellung nutzen wir OpenAI Ireland Ltd. OpenAI verarbeitet Daten auch außerhalb des EWR, unter anderem in den USA, und nennt hierfür Angemessenheitsbeschlüsse beziehungsweise Standardvertragsklauseln. Weitere Verarbeitung, Speicherung und eine mögliche Modellverbesserung richten sich nach den Kontoeinstellungen und den OpenAI-Bedingungen. Informationen und Transfergarantien: openai.com/policies/eu-privacy-policy/. Die Löschung beim KI-Dienst wird separat veranlasst; dessen Aufbewahrungsregeln gelten zusätzlich.\nSie haben nach den gesetzlichen Voraussetzungen Rechte auf Auskunft, Berichtigung, Löschung und Einschränkung sowie ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde, etwa dem Hessischen Beauftragten für Datenschutz und Informationsfreiheit.'
 y=para(c,notice,M,y,style='small')
 print(d['id'],'page2 bottom',round(y,1));assert y>48,(d['id'],'page2 overflow',y)
 c.showPage()

for d in DATA:
 file=OUT/(d['file']+'.pdf');c=canvas.Canvas(str(file),pagesize=(W,H),pageCompression=1)
 c.setTitle('Website-Check für '+d['company']);c.setAuthor('suchio · Aleks Tsenov');c.setSubject('Individueller Website-Check vom 08.09.2026 · Werbliche Ansprache')
 page1(c,d);page2(c,d);c.save()
 r=PdfReader(file);assert len(r.pages)==2
 for p in r.pages:assert abs(float(p.mediabox.width)-W)<1
 doc=pymupdf.open(file)
 for i,p in enumerate(doc):p.get_pixmap(matrix=pymupdf.Matrix(1.5,1.5)).save(str(TMP/f'{d["id"]}-pdf-{i+1}.png'))
writer=PdfWriter()
for d in DATA:writer.append(OUT/(d['file']+'.pdf'))
writer.add_metadata({'/Title':'suchio · Sechs individuelle Website-Checks','/Author':'suchio · Aleks Tsenov'})
with open(OUT/'00_Alle_sechs_Audits_Duplex.pdf','wb') as f:writer.write(f)
print('Created six A4 PDFs and combined duplex PDF.')

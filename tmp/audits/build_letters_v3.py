import json,html
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.graphics import renderPDF
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget
from svglib.svglib import svg2rlg
from pypdf import PdfReader,PdfWriter
import pymupdf

ROOT=Path.cwd();TMP=ROOT/'tmp/audits';OUT=ROOT/'output/pdf/briefaktion-v3';OUT.mkdir(parents=True,exist_ok=True)
DATA=json.loads((TMP/'letters-ready.json').read_text('utf-8'));OLD=json.loads((TMP/'content.json').read_text('utf-8'));COPY=json.loads((TMP/'letter-v3-copy.json').read_text('utf-8'))
for name,file in [('DM','DMsans-Regular.ttf'),('DMS','DMsans-Semibold.ttf')]:pdfmetrics.registerFont(TTFont(name,str(TMP/file)))
pdfmetrics.registerFontFamily('DM',normal='DM',bold='DMS')
W,H=595.2756,841.8898;M=48;WIDTH=W-2*M
INK=HexColor('#171717');GRAY=HexColor('#525252');BLUE=HexColor('#0064d1');PALE=HexColor('#f2f6fa');LINE=HexColor('#d5dde5')
ST={key:ParagraphStyle(key,fontName=font,fontSize=size,leading=leading,textColor=color) for key,font,size,leading,color in [('body','DM',10,13.2,INK),('small','DM',8,10.2,GRAY),('cell','DM',9.1,11.7,INK),('label','DMS',9,11.5,BLUE),('subject','DMS',13,16,INK),('url','DM',8.5,11,BLUE),('head','DMS',10.5,13,INK)]}
logo=svg2rlg(str(ROOT/'public/suchio-logo-light.svg'));logo.scale(112/logo.width,112/logo.width)
def esc(t):return html.escape(t).replace('\n','<br/>')
def p(c,t,x,y,width=WIDTH,style='body',raw=False):
 q=Paragraph(t if raw else esc(t),ST[style]);_,h=q.wrap(width,1000);q.drawOn(c,x,y-h);return y-h
def arrow(c,x1,y1,x2,y2):
 c.setStrokeColor(BLUE);c.setLineWidth(.8);c.line(x1,y1,x2,y2);c.line(x2,y2,x2-4,y2+2.5);c.line(x2,y2,x2-4,y2-2.5)
def table(c,copy,y):
 widths=[WIDTH*.31,WIDTH*.34,WIDTH*.35];x=M
 for title,w in zip(['Beobachtung','Folge für Interessenten','Unser Ansatz'],widths):p(c,title,x+7,y-6,w-14,'label');x+=w
 y-=25
 for row in copy['rows']:
  cells=[Paragraph(esc(t),ST['cell']) for t in row]; heights=[q.wrap(w-14,1000)[1] for q,w in zip(cells,widths)];height=max(heights)+13
  c.setFillColor(PALE);c.rect(M,y-height,WIDTH,height,fill=1,stroke=0);x=M
  for q,w,h in zip(cells,widths,heights):q.drawOn(c,x+7,y-6-h);x+=w
  y-=height+3
 return y
def visual(c,ident,copy,y):
 y=p(c,copy['visualTitle'],M,y,style='head')-7
 if ident=='lm':
  bw=64;gap=10
  for i,label in enumerate(copy['flow']):
   x=M+i*(bw+gap);c.setStrokeColor(LINE);c.roundRect(x,y-25,bw,25,3,stroke=1,fill=0);p(c,label,x+4,y-7,bw-8,'cell');c.setStrokeColor(BLUE);c.setLineWidth(.8);c.line(x+bw/2,y-25,x+bw/2,y-39)
  c.line(M+bw/2,y-39,M+311,y-39);c.line(M+311,y-39,M+311,y-27);arrow(c,M+311,y-27,M+324,y-27)
  c.setFillColor(PALE);c.roundRect(M+324,y-46,WIDTH-324,37,3,fill=1,stroke=0);p(c,'Gleicher Seitenabschnitt',M+332,y-20,WIDTH-340,'cell');y-=53
 elif ident=='varied':
  for label,value in zip(copy['flow'],[.517,.1]):
   p(c,label,M,y,170,'cell');c.setFillColor(LINE);c.roundRect(M+174,y-10,WIDTH-174,7,3,fill=1,stroke=0);c.setFillColor(BLUE);c.roundRect(M+174,y-10,(WIDTH-174)*value/.6,7,3,fill=1,stroke=0);y-=19
 else:
  labels=copy['flow'];gap=20;bw=(WIDTH-gap*(len(labels)-1))/len(labels)
  for i,label in enumerate(labels):
   x=M+i*(bw+gap);c.setFillColor(PALE);c.roundRect(x,y-30,bw,30,3,fill=1,stroke=0);p(c,label,x+8,y-8,bw-16,'cell')
   if i<len(labels)-1 and ident not in ['allrounder','marquardt']:arrow(c,x+bw+3,y-15,x+bw+gap-3,y-15)
  y-=36
 y=p(c,copy['visualNote'],M,y,style='small')-9
 return y

privacy='Datenschutz: Verantwortlich ist Aleks Tsenov, Suchio, Kontaktdaten rechts oben. Wir nutzen veröffentlichte Geschäftsangaben und Prüfbefunde für diese einmalige Briefwerbung auf Art. 6 Abs. 1 lit. f DSGVO. KI-Unterstützung durch OpenAI, auch in den USA und je Kontoeinstellung mit möglicher Modellverbesserung; Hosting über Cloudflare. Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung und Beschwerde nach den gesetzlichen Voraussetzungen. Vollständige Angaben: <link href="https://suchio.net/datenschutz#briefwerbung" color="#0064d1">suchio.net/datenschutz#briefwerbung</link>, kostenfrei auch per Post.'
merged=PdfWriter()
for d,original in zip(DATA,OLD):
 ident=d['id'];copy=COPY[ident];informal=ident in ['cw','powerhouse','varied'];path=OUT/f"{original['file']}_Brief.pdf";c=canvas.Canvas(str(path),pagesize=(W,H),pageCompression=1);c.setTitle(f"Website-Check für {copy['topic']} | Suchio");c.setAuthor('Aleks Tsenov · Suchio')
 renderPDF.draw(logo,c,M,H-67)
 rx=W-M-158
 p(c,'Suchio',rx,H-79,158,'head')
 p(c,'Aleks Tsenov\nBergstraße 41\n65795 Hattersheim am Main',rx,H-96,158,'small')
 p(c,'Tel. +49 176 42767348\ncontact@suchio.net\nsuchio.net',rx,H-134,158,'small')
 p(c,'Datum: 09.09.2026',rx,H-174,158,'small')
 p(c,'\n'.join(d['address']),M,H-103,300,'body')
 y=p(c,d['subject'],M,H-205,style='subject')-9
 y=p(c,original['greeting'],M,y)-5
 y=p(c,copy['intro'],M,y)-7
 # Same company-and-URL structure for all six recipients, including the long Wix address.
 name=d['address'][0]+(' / Werksstudio Kriftel' if ident=='marquardt' else '')
 y=p(c,f'<b>Geprüfte Website: {esc(name)}</b><br/><link href="{original["url"]}" color="#0064d1">{esc(original["url"])}</link>',M,y,style='small',raw=True)-6
 y=table(c,copy,y)-9
 y=visual(c,ident,copy,y)
 boxh=87;c.setFillColor(PALE);c.roundRect(M,y-boxh,WIDTH,boxh,4,fill=1,stroke=0)
 p(c,'1. Ausführlichen Audit ansehen',M+10,y-9,WIDTH-89,'head')
 p(c,f'<link href="{d["url"]}">{d["url"].replace("https://","")}</link>',M+10,y-27,WIDTH-89,'url',True)
 p(c,'2. Jetzt Kontakt aufnehmen',M+10,y-45,WIDTH-89,'head')
 verb='Schreibt' if informal else 'Schreiben Sie'
 p(c,f'{verb} an contact@suchio.net, Stichwort „{copy["topic"]}“, oder ruft uns an.' if informal else f'{verb} an contact@suchio.net, Stichwort „{copy["topic"]}“, oder rufen Sie uns an.',M+10,y-61,WIDTH-89,'cell')
 qr=QrCodeWidget(d['url'],barLevel='M');b=qr.getBounds();size=65;draw=Drawing(size,size,transform=[size/(b[2]-b[0]),0,0,size/(b[3]-b[1]),0,0]);draw.add(qr);renderPDF.draw(draw,c,W-M-size-7,y-size-10)
 y-=boxh+8
 y=p(c,'Gern besprechen wir den ersten konkreten Verbesserungsschritt.\nViele Grüße aus Hattersheim · Aleks Tsenov',M,y,style='cell')-6
 y=p(c,'Website-Check / Werbung · Prüfung vom 08.09.2026 · Messungen und Nachweise im Online-Audit.',M,y,style='small')-6
 c.setStrokeColor(LINE);c.line(M,y,W-M,y);y-=6
 y=p(c,'<b>Keine weitere Werbung gewünscht?</b> Widerspruch jederzeit per E-Mail oder Post an Suchio.',M,y,style='small',raw=True)-4
 y=p(c,privacy,M,y,style='small',raw=True)
 print(ident,'bottom',round(y,1));assert y>=25,(ident,y)
 c.showPage();c.save();reader=PdfReader(path);assert len(reader.pages)==1;merged.append(reader)
 with pymupdf.open(path) as doc:doc[0].get_pixmap(matrix=pymupdf.Matrix(1.5,1.5)).save(TMP/f'{ident}-letter-v3.png')
merged.write(OUT/'00_Alle_sechs_Briefe_Einseitig.pdf')

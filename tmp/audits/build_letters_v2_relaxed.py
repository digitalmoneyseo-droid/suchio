import json, html
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
from pypdf import PdfReader, PdfWriter
import pymupdf

ROOT=Path.cwd(); TMP=ROOT/'tmp/audits'; OUT=ROOT/'output/pdf/briefaktion-v2-luftiger'
OUT.mkdir(parents=True,exist_ok=True)
DATA=json.loads((TMP/'letters-ready.json').read_text('utf-8'))
OLD=json.loads((TMP/'content.json').read_text('utf-8'))
for name,file in [('DM','DMsans-Regular.ttf'),('DMS','DMsans-Semibold.ttf')]: pdfmetrics.registerFont(TTFont(name,str(TMP/file)))
pdfmetrics.registerFontFamily('DM',normal='DM',bold='DMS',italic='DM',boldItalic='DMS')
pdfmetrics.registerFont(TTFont('DMB',str(TMP/'DMsans-Bold-Unique.ttf')))
W,H=595.2756,841.8898; M=56.7; WIDTH=W-2*M
INK=HexColor('#171717'); GRAY=HexColor('#525252'); BLUE=HexColor('#0064d1'); PALE=HexColor('#f2f6fa')
styles={
 'body':ParagraphStyle('body',fontName='DM',fontSize=10.2,leading=13.5,textColor=INK),
 'small':ParagraphStyle('small',fontName='DM',fontSize=8,leading=10.3,textColor=GRAY),
 'address':ParagraphStyle('address',fontName='DM',fontSize=10.3,leading=14.7,textColor=INK),
 'sender':ParagraphStyle('sender',fontName='DM',fontSize=9.5,leading=12.8,textColor=INK),
 'subject':ParagraphStyle('subject',fontName='DMS',fontSize=13,leading=16.2,textColor=BLUE),
 'url':ParagraphStyle('url',fontName='DMS',fontSize=10.3,leading=14,textColor=BLUE),
}
logo=svg2rlg(str(ROOT/'public/suchio-logo-light.svg'));logo.scale(103/logo.width,103/logo.width)
def esc(t):return html.escape(t).replace('\n','<br/>')
def p(c,text,x,y,width=WIDTH,style='body',raw=False):
    para=Paragraph(text if raw else esc(text),styles[style]);_,height=para.wrap(width,1000);para.drawOn(c,x,y-height);return y-height

privacy='Datenschutz: Aleks Tsenov, suchio, Kontaktdaten oben, verarbeitet veröffentlichte Geschäftsangaben und Prüfbefunde zur einmaligen Briefwerbung auf Art. 6 Abs. 1 lit. f DSGVO. KI-Unterstützung durch OpenAI, auch mit Verarbeitung in den USA und möglicher Modellverbesserung je Kontoeinstellung; Online-Audit über Cloudflare. Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung und Beschwerde bestehen nach den gesetzlichen Voraussetzungen. Einzelheiten zu Quellen, Empfängern und Löschung: <link href="https://suchio.net/audit/privacy" color="#0064d1">suchio.net/audit/privacy</link>, auf Wunsch kostenfrei per Post.'
merged=PdfWriter()
for d,original in zip(DATA,OLD):
    path=OUT/f"{original['file']}_Brief.pdf"
    c=canvas.Canvas(str(path),pagesize=(W,H),pageCompression=1)
    c.setTitle(f"Website-Check für {d['address'][0]} | Suchio")
    c.setAuthor('Aleks Tsenov · Suchio')
    renderPDF.draw(logo,c,M,H-67)
    address_top=H-92
    p(c,f'<font name="DMB">{esc(d["address"][0])}</font>',M,address_top,260,'address',raw=True)
    p(c,'\n'.join(d['address'][1:]),M,H-112,260,'address')
    right_x=W-M-184
    p(c,'<font name="DMB">Suchio</font>',right_x,address_top,184,'address',raw=True)
    p(c,'Aleks Tsenov\nBergstraße 41\n65795 Hattersheim am Main',right_x,H-112,184,'sender')
    p(c,'E-Mail: contact@suchio.net<br/>Tel: +49 176 42767348<br/>Internet: <link href="https://suchio.net">suchio.net</link>',right_x,H-159,184,'sender',raw=True)
    p(c,'Datum: 09.09.2026',right_x,H-211,184,'sender')
    y=p(c,d['subject'],M,H-239,style='subject')-14
    y=p(c,original['greeting'],M,y)-7
    y=p(c,d['intro'].replace('suchio','Suchio'),M,y)-10
    for title,body in d['points']:
        y=p(c,f'<b>{esc(title)}</b> {esc(body)}',M,y,raw=True)-8
    y=p(c,d['offer'],M,y)-8
    y=p(c,d['close'],M,y)-12
    y=p(c,'Viele Grüße aus Hattersheim\nAleks Tsenov von Suchio',M,y)-14
    boxh=57
    c.setFillColor(PALE);c.roundRect(M,y-boxh,WIDTH,boxh,4,fill=1,stroke=0)
    label='Euer ausführlicher Website-Audit' if original['id'] in ['cw','powerhouse','varied'] else 'Ihr ausführlicher Website-Audit'
    link=f'<link href="{d["url"]}">{d["url"].replace("https://","")}</link>'
    labelp=Paragraph(esc(label),styles['body']); linkp=Paragraph(link,styles['url'])
    _,labelh=labelp.wrap(WIDTH-78,1000); _,linkh=linkp.wrap(WIDTH-78,1000)
    texttop=y-(boxh-labelh-linkh-5)/2
    labelp.drawOn(c,M+12,texttop-labelh)
    linkp.drawOn(c,M+12,texttop-labelh-5-linkh)
    qr=QrCodeWidget(d['url'],barLevel='M');b=qr.getBounds();size=49
    drawing=Drawing(size,size,transform=[size/(b[2]-b[0]),0,0,size/(b[3]-b[1]),0,0]);drawing.add(qr);renderPDF.draw(drawing,c,W-M-size-4,y-size-4)
    y-=boxh+10
    y=p(c,'Grundlage: Website-Prüfung und mobiler Lighthouse-Labortest vom 08.09.2026. Details online.',M,y,style='small')-8
    c.setStrokeColor(HexColor('#d5dde5'));c.line(M,y,W-M,y);y-=7
    y=p(c,'<b>Keine weitere Werbung gewünscht?</b> Widerspruch jederzeit an contact@suchio.net oder unsere Postanschrift.',M,y,style='small',raw=True)-5
    y=p(c,privacy.replace('Aleks Tsenov, suchio,','Aleks Tsenov, Suchio,').replace('suchio.net/audit/privacy','suchio.net/datenschutz#briefwerbung'),M,y,style='small',raw=True)
    print(d['id'],'bottom',round(y,1));assert y>=27, (d['id'],y)
    c.showPage();c.save()
    reader=PdfReader(path);assert len(reader.pages)==1
    merged.append(reader)
    with pymupdf.open(path) as doc:doc[0].get_pixmap(matrix=pymupdf.Matrix(1.5,1.5)).save(TMP/f"{d['id']}-letter-v2-relaxed.png")
merged.write(OUT/'00_Alle_sechs_Briefe_Einseitig.pdf')
print('Six one-page A4 letters and six-page combined file written.')

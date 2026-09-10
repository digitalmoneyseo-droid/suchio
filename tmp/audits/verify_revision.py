from pathlib import Path
import json
import cv2
import pymupdf
import numpy as np
from pypdf import PdfReader

root=Path.cwd(); out=root/'output/pdf/briefaktion-v3'; tmp=root/'tmp/audits'
letters=json.loads((tmp/'letters-ready.json').read_text('utf-8'))
old=json.loads((tmp/'content.json').read_text('utf-8'))
for letter, original in zip(letters,old):
    path=out/f"{original['file']}_Brief.pdf"
    reader=PdfReader(path);assert len(reader.pages)==1
    page=reader.pages[0];assert abs(float(page.mediabox.width)-595.276)<1 and abs(float(page.mediabox.height)-841.89)<1
    text=page.extract_text();assert letter['url'].replace('https://','') in text
    assert original['url'] in text
    assert 'suchio.net/datenschutz#briefwerbung' in text
    assert '100 / 100' not in text and '\ufffd' not in text
    with pymupdf.open(path) as document:
        pix=document[0].get_pixmap(matrix=pymupdf.Matrix(300/72,300/72))
        image=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)
    decoded,points,_=cv2.QRCodeDetector().detectAndDecode(image)
    assert decoded==letter['url'],(letter['id'],decoded)
    print(letter['id'], 'A4, one page, QR code and text OK')
assert len(PdfReader(out/'00_Alle_sechs_Briefe_Einseitig.pdf').pages)==6
print('Combined PDF: six pages OK')

from pathlib import Path
import json, re, sys, pymupdf, cv2, numpy as np
out=Path(sys.argv[1] if len(sys.argv)>1 else 'output/pdf/briefaktion-v2-ueberarbeitet')
data=json.loads(Path('tmp/audits/letters-ready.json').read_text('utf-8'))
for path,d in zip(sorted(out.glob('0[1-6]*.pdf')),data):
    with pymupdf.open(path) as doc:
        assert len(doc)==1
        page=doc[0]; text=page.get_text()
        assert 'Aleks Tsenov von Suchio' in text
        assert not re.search(r'\bsuchio\b(?!\.net)',text)
        spans=[s for b in page.get_text('dict')['blocks'] if 'lines' in b for l in b['lines'] for s in l['spans']]
        names=[s for s in spans if s['text'] in (d['address'][0],'Suchio')]
        assert len(names)==2 and abs(names[0]['origin'][1]-names[1]['origin'][1])<.01
        assert all('Bold' in s['font'] for s in names)
        pix=page.get_pixmap(matrix=pymupdf.Matrix(300/72,300/72))
        img=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)
        assert cv2.QRCodeDetector().detectAndDecode(img)[0]==d['url']
        print(d['id'], 'one page, bold alignment and QR verified')

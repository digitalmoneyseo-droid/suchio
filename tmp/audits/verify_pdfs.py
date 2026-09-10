from pathlib import Path
from pypdf import PdfReader

files = sorted(Path('output/pdf').glob('*.pdf'))
assert len(files) == 7
for file in files:
    reader = PdfReader(file)
    assert len(reader.pages) == (12 if file.name.startswith('00_') else 2)
    for page in reader.pages:
        assert abs(float(page.mediabox.width) - 595.276) < 1
        assert abs(float(page.mediabox.height) - 841.89) < 1
    text = ''.join(page.extract_text() for page in reader.pages)
    assert 'Datenschutz' in text and 'suchio' in text and '\ufffd' not in text
    print(file.name, len(reader.pages), 'A4 OK')
guide = Path('output/pdf/Bitte_vor_Verteilung_lesen.md').read_text(encoding='utf-8')
assert 'enthält' in guide
print('UTF-8 guide OK')

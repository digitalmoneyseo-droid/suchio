from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
font=TTFont('node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2')
font=instantiateVariableFont(font,{'wght':700},inplace=True)
font.flavor=None
for record in font['name'].names:
    if record.nameID in (1,4,6):
        record.string='SuchioDMSansBold'.encode(record.getEncoding())
font.save('tmp/audits/DMsans-Bold-Unique.ttf')

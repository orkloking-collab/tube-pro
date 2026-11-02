# Subsets the CJK display fonts to the glyphs the project uses (+ all kana, ASCII, punctuation).
# Re-run after adding new kanji to the script:  python3 tools/subset-fonts.py <src_font_dir> <out_dir>
# (full fonts ship in node_modules/@expo-google-fonts/* after `npm install`).
import sys, os, glob
from fontTools import subset
src, out = sys.argv[1], sys.argv[2]
chars = set()
for f in glob.glob('src/**/*.js', recursive=True) + glob.glob('player/*.html') + glob.glob('tools/*.mjs'):
    chars |= set(open(f, encoding='utf-8').read())
ranges = [(0x20, 0x7E), (0xA0, 0xFF), (0x2010, 0x206F), (0x3000, 0x30FF), (0xFF00, 0xFFEF)]
for a, b in ranges: chars |= {chr(c) for c in range(a, b + 1)}
text = ''.join(sorted(chars))
for name in ['DelaGothicOne-Regular.ttf', 'YujiBoku-Regular.ttf']:
    opts = subset.Options(); opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
    font = subset.load_font(os.path.join(src, name), opts)
    s = subset.Subsetter(opts); s.populate(text=text); s.subset(font)
    subset.save_font(font, os.path.join(out, name), opts)
    print(name, os.path.getsize(os.path.join(src, name)), '->', os.path.getsize(os.path.join(out, name)))

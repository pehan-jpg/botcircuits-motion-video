# Tiles a PNG sequence's stack column into a contact sheet: seq-sheet.py <dir> <out.jpg> [y0 y1]
import glob, sys
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
y0, y1 = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (170, 520)
fs = sorted(glob.glob(d + "/*.png"), key=lambda f: int("".join(c for c in f.split("/")[-1] if c.isdigit())))
tiles = []
for f in fs:
    n = int("".join(c for c in f.split("/")[-1] if c.isdigit()))
    im = Image.open(f).convert("RGB").crop((1390, y0, 1850, y1)).resize((230, int(230 * (y1 - y0) / 460)))
    dr = ImageDraw.Draw(im); dr.rectangle([0, 0, 46, 14], fill=(0, 0, 0)); dr.text((3, 2), f"f{n}", fill=(255, 255, 0))
    tiles.append(im)
cols = 9; h = tiles[0].height
o = Image.new("RGB", (230 * cols, h * ((len(tiles) + cols - 1) // cols)), "white")
for i, t in enumerate(tiles):
    o.paste(t, ((i % cols) * 230, (i // cols) * h))
o.save(out, quality=90)

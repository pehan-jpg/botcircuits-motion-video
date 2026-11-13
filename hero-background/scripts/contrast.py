# WCAG contrast of overlay text against the glass behind it.
# Usage: contrast.py <normal.png> <text-hidden.png> [x0 x1]
# Text pixels are where the two renders differ. Each text line (split on horizontal gaps) is
# measured separately: background = mean colour of the hidden render inside the line's box,
# text = mean colour of the strongest text pixels in the normal render. Lines with a glyph
# height under 13px are small labels (target 3:1); the rest are body text (target 4.5:1).
import sys
import numpy as np
from PIL import Image

def lum(rgb):
    c = np.asarray(rgb, float) / 255
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)

normal = np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(float)
hidden = np.asarray(Image.open(sys.argv[2]).convert("RGB")).astype(float)
x0, x1 = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1400, 1840)
diff = np.abs(normal - hidden).sum(axis=2)
diff[:, :x0] = 0
diff[:, x1:] = 0
mask = diff > 40

rows = np.where(mask.any(axis=1))[0]
bands, start = [], None
for i, r in enumerate(rows):
    if start is None:
        start = r
    if i == len(rows) - 1 or rows[i + 1] - r > 3:
        bands.append((start, r))
        start = None

worst = {"label": 99.0, "body": 99.0}
for top, bottom in bands:
    cols = np.where(mask[top : bottom + 1].any(axis=0))[0]
    segs, s = [], cols[0]
    for i, c in enumerate(cols):
        if i == len(cols) - 1 or cols[i + 1] - c > 24:
            segs.append((s, c))
            if i < len(cols) - 1:
                s = cols[i + 1]
    for left, right in segs:
        box = (slice(top, bottom + 1), slice(left, right + 1))
        d = diff[box]
        if (d > 40).sum() < 30:
            continue
        strong = d > 0.6 * d.max()
        text = normal[box][strong].mean(axis=0)
        bg = hidden[box].reshape(-1, 3).mean(axis=0)
        h = bottom - top + 1
        kind = "label" if h < 13 else "body"
        r = ratio(text, bg)
        worst[kind] = min(worst[kind], r)
        need = 3.0 if kind == "label" else 4.5
        print(f"  y {top:4d}-{bottom:4d} x {left:4d}-{right:4d} {kind:5s} text {tuple(int(v) for v in text)} bg {tuple(int(v) for v in bg)} ratio {r:5.2f} {'ok' if r >= need else 'LOW'}")
print(f"  worst label {worst['label']:.2f} (need 3.0), worst body {worst['body']:.2f} (need 4.5)")

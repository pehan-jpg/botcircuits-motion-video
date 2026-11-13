# Single-frame glitch detector for a PNG sequence (same rule as find-glitches.py), column region only.
import glob, sys
import numpy as np
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + "/*.png"), key=lambda f: int("".join(c for c in f.split("/")[-1] if c.isdigit())))
fr = [np.asarray(Image.open(f).convert("L").resize((480, 270))).astype(float)[:, 345:470] for f in fs]
bad = []
for i in range(1, len(fr) - 1):
    a = np.abs(fr[i] - fr[i - 1]).mean(); b = np.abs(fr[i] - fr[i + 1]).mean(); c = np.abs(fr[i - 1] - fr[i + 1]).mean()
    if min(a, b) > 2 * max(c, 1) and min(a, b) > 3:
        bad.append(fs[i].split("/")[-1])
print(f"{sys.argv[1]}: {len(fs)} frames, suspect: {bad}")

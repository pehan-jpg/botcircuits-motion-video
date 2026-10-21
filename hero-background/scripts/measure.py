# Mean luma, R/B warmth ratio and saturation for each still, centre-weighted (ignores vignette edges).
import sys, glob, os
import numpy as np
from PIL import Image
for f in sorted(glob.glob(os.path.join(sys.argv[1], "*.png"))):
    a = np.asarray(Image.open(f).convert("RGB")).astype(float) / 255
    h, w, _ = a.shape
    c = a[h//6:-h//6, w//6:-w//6]
    r, g, b = c[..., 0].mean(), c[..., 1].mean(), c[..., 2].mean()
    y = 0.2126*c[...,0] + 0.7152*c[...,1] + 0.0722*c[...,2]
    mx, mn = c.max(-1), c.min(-1)
    sat = ((mx - mn) / np.maximum(mx, 1e-6)).mean()
    print(f"{os.path.basename(f):22s} luma={y.mean():.3f} p95={np.percentile(y,95):.3f} p5={np.percentile(y,5):.3f} R/B={r/b:.2f} sat={sat:.2f}")

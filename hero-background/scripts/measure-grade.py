# Measures the base videos the way the hero is displayed: left 68% of the frame, scaled to
# 1881px wide (nearest neighbour, so the sharpness metric is not smoothed by interpolation),
# cropped to 1080 tall from y=88. Reports average RGB, BT.709 luma, luma
# percentiles and sharpness (variance of the Laplacian of luma) per scene frame.
import subprocess, sys
import numpy as np

FRAMES = {"airport": 75, "keyboard": 228, "sofa": 405, "headset": 540}  # 405 = 13.5 s

def grab(path, n):
    vf = (f"select='eq(n\\,{n})',scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24,"
          "crop=1306:1080:0:0,scale=1881:-2:flags=neighbor,crop=1881:1080:0:88")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-vsync", "0", "-frames:v", "1",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(1080, 1881, 3).astype(float)

def stats(img):
    y = 0.2126 * img[..., 0] + 0.7152 * img[..., 1] + 0.0722 * img[..., 2]
    lap = (-4 * y[1:-1, 1:-1] + y[:-2, 1:-1] + y[2:, 1:-1] + y[1:-1, :-2] + y[1:-1, 2:])
    return {
        "rgb": tuple(round(v, 1) for v in img.reshape(-1, 3).mean(0)),
        "luma": round(y.mean(), 1),
        "p5": round(np.percentile(y, 5), 1),
        "p95": round(np.percentile(y, 95), 1),
        "sharp": round(lap.var(), 1),
    }

orig, graded = sys.argv[1], sys.argv[2]
for scene, n in FRAMES.items():
    a, b = stats(grab(orig, n)), stats(grab(graded, n))
    print(f"{scene:8s} f{n}: original {a}")
    print(f"{'':8s}       graded   {b}   luma change {b['luma'] - a['luma']:+.1f}")

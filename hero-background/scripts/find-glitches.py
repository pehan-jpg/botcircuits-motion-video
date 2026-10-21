# Finds single-frame render glitches in a rendered video: frame i differs from both
# neighbours while the neighbours match each other (checked in the right column only).
import subprocess, sys
import numpy as np

path, x0, x1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
w, h = 384, 216
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={w}:{h},format=gray", "-f", "rawvideo", "-"],
    capture_output=True, check=True,
).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, h, w)[:, :, int(x0 * w) : int(x1 * w)].astype(float)
bad = []
for i in range(1, len(frames) - 1):
    a = np.abs(frames[i] - frames[i - 1]).mean()
    b = np.abs(frames[i] - frames[i + 1]).mean()
    c = np.abs(frames[i - 1] - frames[i + 1]).mean()
    if min(a, b) > 2 * max(c, 1) and min(a, b) > 3:
        bad.append((i, round(a, 2), round(b, 2), round(c, 2)))
print(f"{path}: {len(frames)} frames, suspect frames: {bad}")

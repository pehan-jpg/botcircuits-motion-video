"""Compares the clean title frame pairs written by clean-title-test.mjs and fails on any extra layer."""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

out = Path(sys.argv[1])
data = json.loads((out / "pairs.json").read_text())
LIMIT = 6  # per channel, absorbs encoder-free anti-aliasing noise only
fails, lines = [], []
for w in data["windows"]:
    ps = [p for p in data["pairs"] if p["id"] == w["id"]]
    worst = (0, 0, None)
    for p in ps:
        a = np.asarray(Image.open(out / f"{p['id']}-{p['frame']}.png").convert("RGB"), dtype=np.int16)
        b = np.asarray(Image.open(out / f"{p['id']}-{p['frame']}-ref.png").convert("RGB"), dtype=np.int16)
        d = np.abs(a - b).max(axis=2)
        n = int((d > LIMIT).sum())
        if n > worst[0] or worst[2] is None:
            worst = (n, int(d.max()), p)
        if n > 0:
            ys, xs = np.nonzero(d > LIMIT)
            fails.append(f"{p['id']} frame {p['frame']} ({p['t']:.2f}s): {n} px differ, box x {xs.min()}-{xs.max()} y {ys.min()}-{ys.max()}")
    lines.append(f"{w['id']} {w['from']:.2f}s to {w['to']:.2f}s: {len(ps)} frames, worst {worst[0]} px (max diff {worst[1]})")
report = "\n".join(lines + ([""] + fails if fails else []) + ["", "FAIL" if fails else "PASS: only the plate, the glow and the title are visible in every clean title window."])
(out / "report.txt").write_text(report + "\n")
print(report)
sys.exit(1 if fails else 0)

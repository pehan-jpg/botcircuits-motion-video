"""Checks written by s1-lane-test.mjs: stage pixels in the lane, HUD in the safe area, caption clear of card and chips."""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

out = Path(sys.argv[1])
frames = json.loads((out / "frames.json").read_text())
LANE = (96, 236)
SAFE = 96
GAP = 24
fails, worst = [], 0
for fr in frames:
    a = np.asarray(Image.open(out / f"{fr['frame']}-noHud.png").convert("RGB"), dtype=np.int16)[LANE[0]:LANE[1]]
    b = np.asarray(Image.open(out / f"{fr['frame']}-bg.png").convert("RGB"), dtype=np.int16)[LANE[0]:LANE[1]]
    d = np.abs(a - b).max(axis=2)
    n = int((d > 2).sum())
    worst = max(worst, n)
    if n:
        ys, xs = np.nonzero(d > 2)
        fails.append(f"(a) {fr['t']:.2f}s: {n} stage pixels in the lane, x {xs.min()}-{xs.max()} y {ys.min() + LANE[0]}-{ys.max() + LANE[0]}")
    vis = [i for i in fr["items"] if i["opacity"] > 0.05]
    for i in vis:
        r = i["rect"]
        if r["x"] < SAFE - 0.5 or r["y"] < SAFE - 0.5 or r["x"] + r["w"] > 1920 - SAFE + 0.5 or r["y"] + r["h"] > 1080 - SAFE + 0.5:
            fails.append(f"(b) {fr['t']:.2f}s: {i['label']} outside the safe area {r}")
    lines = [i for i in vis if i["label"].startswith("Line: ")]
    others = [i for i in vis if not i["label"].startswith("Line: ")]
    for l in lines:
        L = l["rect"]
        for o in others:
            R = o["rect"]
            if L["x"] < R["x"] + R["w"] + GAP and R["x"] < L["x"] + L["w"] + GAP and L["y"] < R["y"] + R["h"] + GAP and R["y"] < L["y"] + L["h"] + GAP:
                fails.append(f"(c) {fr['t']:.2f}s: caption within {GAP}px of {o['label']}")
captions = sum(1 for fr in frames for i in fr["items"] if i["label"].startswith("Line: ") and i["opacity"] > 0.05)
report = [f"{len(frames)} frames from 0 to 13.6s; most stage pixels in the lane in one frame: {worst}; frames with a caption: {captions}"]
report += fails[:40] + ([f"... {len(fails) - 40} more"] if len(fails) > 40 else [])
report.append("FAIL" if fails else "PASS: the lane is clear of the stage, the HUD is inside the safe area, the caption keeps 24px from the card and chips.")
(out / "report.txt").write_text("\n".join(report) + "\n")
print("\n".join(report))
sys.exit(1 if fails else 0)

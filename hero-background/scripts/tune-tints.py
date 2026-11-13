# Raises each scene's glass tints in 0.05 steps until every text line passes WCAG contrast
# (body 4.5:1, labels 3:1) at the frame where the scene's stack is complete.
# Query lines are those above the card's top edge: they raise `queryTint`; the rest raise `tint`.
import os, re, subprocess

CONFIG = "src/overlay/config.ts"
# scene key -> (complete-stack frame at 60 fps, y of the card's top edge at that frame)
SCENES = {"travel": (246, 358), "banking": (546, 309), "retail": (867, 275), "insurance": (1197, 707)}
ENV = dict(os.environ, REMOTION_BROWSER="/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
           REMOTION_CHROME_MODE="chrome-for-testing", REMOTION_GL="swangle")

def read_tints():
    src = open(CONFIG).read()
    out = {}
    for key in SCENES:
        block = src[src.index(f"  {key}: {{"):]
        out[key] = [float(re.search(r"\n    tint: ([0-9.]+),", block).group(1)), float(re.search(r"\n    queryTint: ([0-9.]+),", block).group(1))]
    return out

def write_tints(tints):
    src = open(CONFIG).read()
    for key, (tint, qtint) in tints.items():
        i = src.index(f"  {key}: {{")
        head, block = src[:i], src[i:]
        block = re.sub(r"\n    tint: [0-9.]+,", f"\n    tint: {tint:.2f},", block, count=1)
        block = re.sub(r"\n    queryTint: [0-9.]+,", f"\n    queryTint: {qtint:.2f},", block, count=1)
        src = head + block
    open(CONFIG, "w").write(src)

def measure(frames):
    frames_arg = ",".join(str(f) for f in frames)
    for d, props in (("out/tune", None), ("out/tune-hidden", '{"hideText":true}')):
        env = dict(ENV, STILLS_DIR=d)
        if props:
            env["STILLS_PROPS"] = props
        subprocess.run(["node", "scripts/overlay-stills.mjs", frames_arg], env=env, capture_output=True, check=True)

def lines(frame):
    res = subprocess.run(["python3", "scripts/contrast.py", f"out/tune/f{frame}.png", f"out/tune-hidden/f{frame}.png"], capture_output=True, text=True).stdout
    out = []
    for l in res.splitlines():
        m = re.match(r"\s+y\s+(\d+)-\s*(\d+).*?(label|body).*ratio\s+([0-9.]+)", l)
        if m:
            out.append((int(m.group(1)), m.group(3), float(m.group(4))))
    return out

tints = read_tints()
pending = dict(SCENES)
for it in range(12):
    if not pending:
        break
    write_tints(tints)
    measure([f for f, _ in pending.values()])
    for key, (frame, card_top) in list(pending.items()):
        q_fail = c_fail = False
        for y, kind, r in lines(frame):
            if r < (3.0 if kind == "label" else 4.5):
                if y < card_top:
                    q_fail = True
                else:
                    c_fail = True
        print(f"iter {it} {key}: tint {tints[key][0]:.2f} queryTint {tints[key][1]:.2f} -> card {'FAIL' if c_fail else 'pass'}, query {'FAIL' if q_fail else 'pass'}", flush=True)
        if c_fail:
            tints[key][0] = round(tints[key][0] + 0.05, 2)
        if q_fail:
            tints[key][1] = round(tints[key][1] + 0.05, 2)
        if not (c_fail or q_fail):
            del pending[key]
write_tints(tints)
print("final:", {k: {"tint": v[0], "queryTint": v[1]} for k, v in tints.items()}, "unresolved:", list(pending))

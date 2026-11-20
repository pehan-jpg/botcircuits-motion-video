"""
Checks the single deliverable, out/space_video.mp4:
  - duration equals the sum of built scenes (ffprobe)
  - no fully black frame (ffmpeg blackdetect)
  - no stretch over 0.4s without motion (ffmpeg freezedetect)
  - continuity: last frame of each scene against the first frame of the next
Usage: python3 -I scripts/check-video.py
"""
import json, os, re, subprocess, sys, tempfile
from PIL import Image, ImageChops, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO = os.path.join(ROOT, "out", "space_video.mp4")
FPS = 60

def scenes():
    src = open(os.path.join(ROOT, "src", "timeline.ts")).read()
    rows = re.findall(r'\{\s*id:\s*"(S\d\d)",\s*number:\s*(\d+),\s*name:\s*"([^"]*)",\s*start:\s*([\d.]+),\s*end:\s*([\d.]+),\s*built:\s*(true|false)', src)
    return [dict(id=r[0], n=int(r[1]), name=r[2], start=float(r[3]), end=float(r[4])) for r in rows if r[5] == "true"]

def run(args):
    return subprocess.run(args, capture_output=True, text=True)

def frame_at(index, out):
    run(["ffmpeg", "-v", "error", "-y", "-i", VIDEO, "-vf", f"select=eq(n\\,{index})", "-frames:v", "1", out])
    return Image.open(out).convert("RGB")

def main():
    issues = []
    built = scenes()
    expected = sum(round(s["end"] * FPS) - round(s["start"] * FPS) for s in built)
    probe = json.loads(run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames,duration", "-of", "json", VIDEO]).stdout)
    st = probe["streams"][0]
    frames, dur = int(st["nb_read_frames"]), float(st["duration"])
    print(f"Duration: {dur:.3f}s, {frames} frames. Built scenes {[s['n'] for s in built]} sum to {expected} frames ({expected / FPS:.3f}s).")
    if frames != expected:
        issues.append(f"frame count {frames} does not match {expected}")

    black = run(["ffmpeg", "-i", VIDEO, "-vf", "blackdetect=d=0:pic_th=0.98:pix_th=0.05", "-an", "-f", "null", "-"]).stderr
    hits = re.findall(r"black_start:\S+ black_end:\S+", black)
    print("Black frames: " + ("none" if not hits else "; ".join(hits)))
    if hits:
        issues.append("fully black frames found")

    freeze = run(["ffmpeg", "-i", VIDEO, "-vf", "freezedetect=n=-60dB:d=0.4", "-map", "0:v", "-f", "null", "-"]).stderr
    fz = re.findall(r"freeze_start: ([\d.]+).*?freeze_duration: ([\d.]+)", freeze, re.S)
    print("Motion gaps over 0.4s: " + ("none" if not fz else ", ".join(f"{a}s for {b}s" for a, b in fz)))
    if fz:
        issues.append("stretches without motion")

    print("\nScene boundaries (last frame of scene, first frame of next):")
    tmp = tempfile.mkdtemp()
    offset = 0
    for a, b in zip(built, built[1:]):
        offset += round(a["end"] * FPS) - round(a["start"] * FPS)
        last = frame_at(offset - 1, os.path.join(tmp, "a.png"))
        first = frame_at(offset, os.path.join(tmp, "b.png"))
        diff = ImageChops.difference(last, first).convert("L")
        mean = ImageStat.Stat(diff).mean[0]
        mse = sum((i * i) * c for i, c in enumerate(diff.histogram())) / (diff.size[0] * diff.size[1])
        import math
        psnr = 99.0 if mse == 0 else 10 * math.log10(255 * 255 / mse)
        changed = sum(c for i, c in enumerate(diff.histogram()) if i > 12) / (diff.size[0] * diff.size[1]) * 100
        verdict = "seamless" if psnr >= 38 else "close" if psnr >= 32 else "VISIBLE CHANGE"
        print(f"  Scene {a['n']} to {b['n']} at frame {offset}: mean abs diff {mean:.2f}/255, PSNR {psnr:.1f} dB, pixels changed by more than 12 levels {changed:.2f}%  [{verdict}]")
        if psnr < 32:
            issues.append(f"boundary {a['n']} to {b['n']} is not continuous")
    print("\n" + ("All video checks passed." if not issues else f"{len(issues)} issue(s): " + "; ".join(issues)))
    return 1 if issues else 0

if __name__ == "__main__":
    sys.exit(main())

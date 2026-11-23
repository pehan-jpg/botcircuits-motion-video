"""
Reads out/guards/report*.json from scripts/stills.mjs and checks, per still:
  SafeAreaGuard      nothing within 96px of the edge (from runtime rects)
  ReadabilityGuard   text at least 28px; contrast at least 4.5:1 against the
                     luminance sampled behind the text (text-hidden background pass)
  LogoGuard          on white, at least 28px high
  Copy rules         no "workflow", no dashes used as hyphens, American spelling
  Colour rules       no green orb pixels; amber only where a person decides
Usage: python3 -I scripts/check.py [report.json ...]
"""
import json, re, sys, glob, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAFE, W, H, MIN_PX, MIN_CR = 96, 1920, 1080, 28, 4.5
PRODUCT_SCALE = 1728 / 1875
UI_MIN, UI_MAX, UI_READ = 14, 22, 20

def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def lum(r, g, b):
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

def cr(a, b):
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)

def parse_rgba(s):
    m = re.match(r"rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)", s or "")
    if not m:
        return (13, 18, 36, 1.0)
    return (float(m[1]), float(m[2]), float(m[3]), float(m[4]) if m[4] else 1.0)

BRITISH = re.compile(r"\b(colour|centre|organis|behaviour|licence|analys(e|ing)|favour|catalogue|optimis|prioritis|recognis|travelled|cancelled)\w*", re.I)
DASH = re.compile(r"\s[-–—]\s|[–—]")

def check_copy(text):
    out = []
    if re.search(r"workflow", text, re.I):
        out.append(f'Copy: "workflow" in "{text}"')
    if DASH.search(text):
        out.append(f'Copy: dash used as punctuation in "{text}"')
    m = BRITISH.search(text)
    if m:
        out.append(f'Copy: non-American spelling "{m[0]}" in "{text}"')
    return out

def colour_checks(img, scene, exclude=()):
    """Green orb check: any strongly green, saturated pixels outside the grass band.
    Amber check: pixels near #F2A43A. Scenes 1 and 2 have no decision moment, so amber must be absent."""
    issues = []
    small = img.convert("RGB").resize((480, 270))
    px = small.load()
    amber = 0
    green_sky = 0
    for y in range(270):
        for x in range(480):
            r, g, b = px[x, y]
            if any(e[0] <= x * 4 <= e[2] and e[1] <= y * 4 <= e[3] for e in exclude):
                continue  # third party brand logos keep their own colours
            if abs(r - 242) < 22 and abs(g - 164) < 26 and abs(b - 58) < 30 and r - b > 140:
                amber += 1
            # Saturated green above the horizon would mean a green orb.
            if scene in ("Scene01", "Scene02") and y < 140 and g > 120 and g > r * 1.35 and g > b * 1.35:
                green_sky += 1
    if amber > 6:
        issues.append(f"Colour: {amber} amber pixels with no person deciding in {scene}")
    if green_sky > 6:
        issues.append(f"Colour: {green_sky} saturated green pixels in the upper frame (orb?) in {scene}")
    return issues

def main(paths):
    total, problems, stats = 0, [], []
    logo_stats, ui_max = [], {}
    ui_range = [99.0, 0.0]
    fit = [0, 0, 0]
    ripple_worst = []
    for p in paths:
        for entry in json.load(open(p)):
            total += 1
            where = f'{entry["scene"]} t={entry["second"]}s'
            g = entry.get("guard") or {"items": []}
            still = Image.open(os.path.join(ROOT, entry["still"]))
            brand = [(it["rect"]["x"] - 4, it["rect"]["y"] - 4, it["rect"]["x"] + it["rect"]["w"] + 4, it["rect"]["y"] + it["rect"]["h"] + 4) for it in g["items"] if it["kind"] == "brand"]
            problems += [f"{where}: {m}" for m in colour_checks(still, entry["scene"], brand)]
            bg = Image.open(os.path.join(ROOT, entry["bg"])).convert("RGB") if entry.get("bg") else None
            # Click ripple centred on the cursor hotspot (arrow tip at 3/36, 1.5/44 of the cursor box).
            cur = [it for it in g["items"] if it["kind"] == "cursor" and it["opacity"] > 0.3]
            for rp in [it for it in g["items"] if it["kind"] == "ripple"]:
                if not cur:
                    continue
                c = cur[0]["rect"]
                tip = (c["x"] + c["w"] * 3 / 36, c["y"] + c["h"] * 1.5 / 44)
                cen = (rp["rect"]["x"] + rp["rect"]["w"] / 2, rp["rect"]["y"] + rp["rect"]["h"] / 2)
                dist = ((tip[0] - cen[0]) ** 2 + (tip[1] - cen[1]) ** 2) ** 0.5
                ripple_worst.append((dist, where))
                if dist > 4:
                    problems.append(f"{where}: Cursor: ripple centre is {dist:.1f}px from the cursor hotspot")
            for it in g["items"]:
                if it["kind"] == "fitcheck":
                    nums = [int(x) for x in re.findall(r"\d+", it["label"])]
                    fit[0] += nums[0]; fit[1] += nums[1]; fit[2] += nums[2]
            zoomed = any(it["kind"] == "frame" and it["rect"]["w"] > W + 1 for it in g["items"])
            for it in g["items"]:
                for iss in it.get("issues", []):
                    if iss["guard"] == "SafeAreaGuard" and it["kind"] in ("cursor", "ripple", "brand"):
                        continue  # the pointer and logos inside the product are part of the product picture
                    if iss["guard"] == "SafeAreaGuard" and zoomed and it["kind"] in ("uitext", "box"):
                        continue  # inside the zoomed product frame, which acts as background (camera rule)
                    # The product window may cross the edges while the camera zooms (DESIGN.md camera rule).
                    if it["kind"] == "frame" and iss["guard"] == "SafeAreaGuard":
                        continue
                    rr = it["rect"]
                    if iss["guard"] == "SafeAreaGuard" and (rr["x"] >= W or rr["y"] >= H or rr["x"] + rr["w"] <= 0 or rr["y"] + rr["h"] <= 0):
                        continue  # fully outside the picture while the camera is zoomed in
                    if iss["guard"] == "SafeAreaGuard" and it["kind"] == "uitext" and (rr["x"] + rr["w"] > W or rr["x"] < 0 or rr["y"] < 0 or rr["y"] + rr["h"] > H):
                        continue  # product UI cropped by the zoomed camera, part of the frame
                    problems.append(f'{where}: {iss["guard"]}: {iss["message"]}')
                if it["kind"] == "logo" and it.get("backing") == "sampled" and entry.get("bg") and it["opacity"] >= 0.85:
                    bgi = Image.open(os.path.join(ROOT, entry["bg"])).convert("RGB")
                    r = it["rect"]
                    box = (max(0, int(r["x"])), max(0, int(r["y"])), min(W, int(r["x"] + r["w"])), min(H, int(r["y"] + r["h"])))
                    data = list(bgi.crop(box).resize((max(1, (box[2] - box[0]) // 4), max(1, (box[3] - box[1]) // 4))).get_flattened_data() if hasattr(Image.Image, "get_flattened_data") else bgi.crop(box).getdata())
                    lums = sorted(lum(*c) for c in data)
                    worst = lums[int(len(lums) * 0.05)]
                    ratio = cr(0.0, worst)
                    logo_stats.append((ratio, where))
                    if ratio < 7:
                        problems.append(f"{where}: LogoGuard: logo contrast {ratio:.2f}:1 against the plate, needs 7:1")
                presented = it["opacity"] >= 0.85
                # Product UI: 14 to 22px at 1x (CSS size times the product scale), whole frame and tagged UI text.
                if it["kind"] in ("frame", "uitext") and presented and it.get("cssPx"):
                    lo, hi = it["cssPx"] * PRODUCT_SCALE, it.get("maxCss", 0) * PRODUCT_SCALE
                    ui_range[0] = min(ui_range[0], lo)
                    ui_range[1] = max(ui_range[1], hi)
                    if lo < UI_MIN - 0.15:
                        problems.append(f'{where}: ReadabilityGuard: UI text "{it.get("minLabel") or it["label"]}" is {lo:.1f}px at 1x, minimum {UI_MIN}px')
                    if hi > UI_MAX + 0.15:
                        problems.append(f'{where}: ReadabilityGuard: UI text in "{it["label"]}" is {hi:.1f}px at 1x, maximum {UI_MAX}px')
                if it["kind"] == "uitext":
                    key = (entry["scene"], it["label"])
                    if it.get("read"):
                        ui_max[key] = max(ui_max.get(key, 0), it.get("fontPxMax", it["fontPx"]) if presented else 0)
                    problems += [f"{where}: {m}" for m in check_copy(it.get("text", ""))]
                if it["kind"] not in ("text", "uitext"):
                    continue
                if it["kind"] == "text":
                    problems += [f"{where}: {m}" for m in check_copy(it.get("text", ""))]
                if not presented:
                    continue
                # 28px applies to FeatureTitle, overlay pills and other overlay text (kind "text").
                if it["kind"] == "text" and it["fontPx"] < MIN_PX - 0.1:  # layout widths are whole pixels, so allow rounding
                    problems.append(f'{where}: ReadabilityGuard: "{it["label"]}" is {it["fontPx"]}px')
                if bg is None:
                    continue
                r = it["rect"]
                # Inset the sample so borders of pills and stamps are not read as background.
                ix, iy = min(16, r["w"] * 0.2), min(16, r["h"] * 0.2)
                box = (max(0, int(r["x"] + ix)), max(0, int(r["y"] + iy)), min(W, int(r["x"] + r["w"] - ix)), min(H, int(r["y"] + r["h"] - iy)))
                if box[2] - box[0] < 2 or box[3] - box[1] < 2:
                    continue
                crop = bg.crop(box).resize((max(1, (box[2] - box[0]) // 4), max(1, (box[3] - box[1]) // 4)))
                lums = sorted(lum(*c) for c in (crop.get_flattened_data() if hasattr(crop, 'get_flattened_data') else crop.getdata()))
                tr, tg, tb, ta = parse_rgba(it["color"])
                # Worst case: the background sample that gives the lowest contrast.
                worst_bg = lums[int(len(lums) * 0.05)] if lums else 1
                mean_bg = sum(lums) / len(lums)
                def eff(bl):
                    # Text colour blended over the background at its alpha.
                    if ta >= 0.999:
                        return lum(tr, tg, tb)
                    v = (bl ** (1 / 2.4)) * 255  # approximate sRGB value of the background
                    return lum(tr * ta + v * (1 - ta), tg * ta + v * (1 - ta), tb * ta + v * (1 - ta))
                tl = eff(mean_bg)
                ratio = min(cr(tl, worst_bg), cr(tl, mean_bg))
                stats.append((ratio, where, it["label"]))
                if ratio < MIN_CR:
                    problems.append(f'{where}: ReadabilityGuard: "{it["label"]}" contrast {ratio:.2f}:1 (bg lum mean {mean_bg:.2f}, 5th pct {worst_bg:.2f})')
    print(f"Checked {total} stills.")
    print(f"Overflow test: {fit[1]} text boxes in {fit[0]} plates or boxes checked; collision test: {fit[2]} label pairs checked")
    if logo_stats:
        logo_stats.sort()
        print(f"Logo on plate: lowest contrast {logo_stats[0][0]:.2f}:1 ({logo_stats[0][1]})")
    if ui_range[1] > 0:
        print(f"Product UI text at 1x: {ui_range[0]:.1f}px to {ui_range[1]:.1f}px (allowed {UI_MIN} to {UI_MAX})")
    if ripple_worst:
        print(f"Cursor ripples in stills: {len(ripple_worst)} measured, worst offset {max(ripple_worst)[0]:.1f}px")
    if ui_max:
        print("UI text meant to be read, largest effective size after camera zoom:")
        for (sc, label), px in sorted(ui_max.items()):
            ok = px >= UI_READ - 0.15
            print(f"  {sc} {label}: {px:.1f}px{'' if ok else '  BELOW 20px'}")
            if not ok:
                problems.append(f"{sc}: {label} never reaches {UI_READ}px effective")
    if stats:
        stats.sort()
        print("Lowest contrast samples:")
        for s in stats[:5]:
            print(f"  {s[0]:.2f}:1  {s[1]}  {s[2]}")
    if problems:
        print(f"\n{len(problems)} issue(s):")
        for p in problems:
            print("  " + p)
        return 1
    print("All guards passed.")
    return 0

if __name__ == "__main__":
    paths = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, "out/guards/report*.json")))
    sys.exit(main(paths))

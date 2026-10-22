# Hero background loop

16 s (480 frames, 1920x1080, 30 fps) seamless looping hero background built with Remotion.
No text, logos or chat overlay yet.

All timing, framing and grade values live in [`src/config.ts`](src/config.ts).

## Structure

- `src/HeroBackground.tsx` – `TransitionSeries` of four 135-frame scenes joined by 20-frame
  eased cross dissolves, a light flare per dissolve, the loop tail, and the shared grade.
- `src/components/ClipScene.tsx` – one muted `OffthreadVideo`, per-clip CSS correction, slow push-in.
- `src/components/LightFlare.tsx` – blurred amber radial gradient, screen blend, peaks mid-dissolve.
- `src/components/Grade.tsx` – amber soft-light tint, brown shadow floor, vignette,
  lower-right safe zone (35% x 40%), animated SVG grain.

## Clips (`public/`)

| File | Source | Start used |
| --- | --- | --- |
| airport.mp4 | 1920x1080, 25 fps, 14.2 s | 2.0 s |
| sofa.mp4 | 2560x1080, 25 fps, 8.2 s | 1.0 s (cropped to 16:9 at 35%) |
| hands.mp4 | 1920x1080, 30 fps, 8.5 s | 1.0 s |
| headset.mp4 | 3840x2160 → pre-transcoded to 1920x1080 | 3.0 s (mirrored) |

Headset was pre-transcoded with:

```bash
ffmpeg -i headset_4k.mp4 -vf scale=1920:1080:flags=lanczos -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -g 25 -an -movflags +faststart public/headset.mp4
```

## Commands

```bash
npm run dev          # Remotion Studio preview
npm run stills       # verification stills + brightness / warmth report (out/stills)
npm run render:mp4   # H.264, CRF 20, no audio
npm run render:webm  # VP9 WebM, no audio
```

In a sandbox without Remotion's browser download, pass `--browser-executable=<chromium>` to the
render commands, or set `REMOTION_BROWSER` for `npm run stills`.

---

# Hero video (`HeroOverlay`): graded base + glass UI overlay, and a clean version

1920x1080, 30 fps, 614 frames, no audio. All copy, timings, positions, heights, glass tints,
colours and spring values are in [`src/overlay/config.ts`](src/overlay/config.ts).
`BRAND_LIME` is a placeholder (`#B5E61D`).

## Base video
- `public/hero_base.mp4` is the delivered merged clip, kept untouched.
- `public/hero_base_graded.mp4` is made by `npm run grade` (`scripts/grade-base.sh`): light luma-only
  sharpening everywhere, a midtone lift with deep blacks on the keyboard and headset scenes, a warm
  colour mix on the sofa scene only. Scene ranges use the exact cuts from ffmpeg scene detection:
  **153, 303, 463** (first frame of each new shot).
- `COMP.baseVideo` selects `"original"` or `"graded"` (default `"graded"`). Remotion plays it with
  `OffthreadVideo`, muted, with no scaling or filters.
- `scripts/measure-grade.py` reports average RGB, luma, 5th/95th luma percentiles and sharpness
  (variance of the Laplacian) per scene, measured on the left 68% of the frame scaled to 1881px wide
  (nearest neighbour) and cropped from y=88.

## Overlay and clean version
- The composition's `showOverlay` input prop (default `COMP.showOverlay`) switches the glass UI on or off.
  With `false` only the base video and the four transitions render.
- Layout: one right-aligned, bottom-anchored column (x 1400–1840). Each new card rises into the bottom
  slot while everything above glides up on one spring (damping 22, stiffness 120, mass 0.9); growing
  cards animate their height from fixed per-state heights.
- Transitions, 24 frames centred on each cut: blur dip + warm flare (cut 1 and the loop point), whip pan
  (cut 2), lime sweep with 4% push-in (cut 3).
- `validateTimeline()` fails the render if a card is within 16 frames of a cut, a stack reaches above
  the nav line (y 110), or a card is left on the last frame.

```bash
npm run grade            # build and measure public/hero_base_graded.mp4
npm run overlay:stills   # verification stills (STILLS_DIR, STILLS_PROPS='{"showOverlay":false}')
npm run overlay:preview  # half-resolution preview
npm run overlay:mp4      # out/hero-overlay-v3.mp4  (H.264, CRF 14)
npm run overlay:webm     # out/hero-overlay-v3.webm (VP9, CRF 30)
npm run clean:mp4        # out/hero-clean-v3.mp4
npm run clean:webm       # out/hero-clean-v3.webm
npm run clean:poster     # out/hero-clean-poster.jpg (frame 380, JPEG quality 92)
```

Render settings live in `remotion.config.ts`: PNG frames, bt709 colour space, yuv420p, CRF 14.

Fonts load from Google Fonts at render time. Behind a TLS-intercepting proxy, render with a full
Chromium that trusts the proxy CA: `--browser-executable=<chrome> --chrome-mode=chrome-for-testing`.
Render with `--gl=swangle`; Chrome can still occasionally capture a frame before the glass content is
painted, so `scripts/render-final.sh` scans every frame (whole frame and overlay column) and re-renders
on a glitch or a hang.

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

# Hero overlay (`HeroOverlay`, v3)

Motion-graphics overlay on the merged hero video: 1920x1080, 30 fps, 614 frames.
`COMP.baseVideo = "original"` plays `public/hero_base.mp4` exactly as delivered with `OffthreadVideo`, muted:
no grading of any kind, in ffmpeg or Remotion.

All copy, timings, positions, heights, glass tints, colours and spring values are in
[`src/overlay/config.ts`](src/overlay/config.ts). `BRAND_LIME` is a placeholder (`#B5E61D`).

- Layout: one right-aligned, bottom-anchored column (x 1400–1840, 440px wide). Each scene's bottom
  edge is `SCENES.*.stackBottom`; nothing sits above y 110 (nav bar).
- Chat-style stacking: the customer query appears in the bottom slot; each new card rises into the
  bottom slot (24px below, blur 8 → 0) while everything above glides up by its height + 12px gap,
  on one spring (damping 22, stiffness 120, mass 0.9). A rising card is clipped at the top so it
  emerges out of its slot without overlapping the element above.
- Cards that grow (booking steps, transfer card) animate their height with the same spring from
  fixed per-state heights in config, so every position is computed deterministically per frame.
- Scene 4: the AI concierge arranges the transfer itself (route, two steps, confirmation).
- Cuts (ffmpeg scene detection, first frame of each new shot): **153, 303, 463**.
- Transitions, 24 frames centred on each cut: blur dip + warm flare (cut 1 and the loop point),
  whip pan with horizontal SVG motion blur (cut 2), lime sweep with 4% push-in (cut 3).
- `validateTimeline()` fails the render if an element is within 16 frames of a cut, a stack's
  tallest state reaches above the nav line, or a card is left on the last frame.

```bash
npm run overlay:stills    # verification stills (STILLS_DIR, REMOTION_GL=swangle)
npm run overlay:preview   # half-resolution preview
npm run overlay:mp4       # 1080p H.264, CRF 18, no audio → out/hero-overlay-v3.mp4 (scanned, retried)
npm run overlay:webm      # VP9 WebM, no audio → out/hero-overlay-v3.webm (scanned, retried)
npm run overlay:check     # scan the MP4 for single-frame render glitches
```

Fonts load from Google Fonts at render time. Behind a TLS-intercepting proxy, render with a full
Chromium that trusts the proxy CA: `--browser-executable=<chrome> --chrome-mode=chrome-for-testing`
(for the stills script: `REMOTION_BROWSER` and `REMOTION_CHROME_MODE=chrome-for-testing`).

Render with `--gl=swangle`: with the default GL backend, Chrome occasionally captured a frame before
all compositing tiles were painted, leaving blank patches behind the frosted glass.
`scripts/render-final.sh` renders, scans every frame for that signature, and retries on a glitch or a hang.

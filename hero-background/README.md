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

# Hero overlay (`HeroOverlay`)

Motion-graphics overlay on the merged hero video: 1920x1080, 30 fps, 614 frames.
The base video (`public/hero_base.mp4`) plays untouched (no grade, trim or filters) with `OffthreadVideo`, muted.

All copy, timings, positions, colours and spring values are in [`src/overlay/config.ts`](src/overlay/config.ts).
`BRAND_LIME` is a placeholder (`#B5E61D`) until the exact BotCircuits hex is supplied.

- Cuts (ffmpeg scene detection, first frame of each new shot): **153, 303, 463**.
- Transitions, 24 frames centred on each cut: blur dip + warm flare (cut 1 and the loop point),
  whip pan with horizontal SVG motion blur (cut 2), lime sweep with 4% push-in (cut 3).
- Scenes: `src/overlay/scenes/` — flight update, booking progress, boarding pass, concierge handoff.

```bash
npm run overlay:stills    # verification stills → out/overlay-stills
npm run overlay:preview   # half-resolution preview
npm run overlay:mp4       # 1080p H.264, CRF 18, no audio
npm run overlay:webm      # VP9 WebM, no audio
```

Fonts load from Google Fonts at render time. Behind a TLS-intercepting proxy, render with a full
Chromium that trusts the proxy CA: `--browser-executable=<chrome> --chrome-mode=chrome-for-testing`
(for the stills script: `REMOTION_BROWSER` and `REMOTION_CHROME_MODE=chrome-for-testing`).

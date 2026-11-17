# botcircuits-motion-video

## SpaceTitleCard

A 5.6s (336 frames, 1920x1080, 60 fps, no audio) Remotion homepage title card.

```bash
npm install
npm run dev            # Remotion Studio
npm run render:space   # out/space_title_card.mp4, .webm, _poster.png, out/space_stills/
npm run render:space:loop
```

- Brand assets expected in `public/`: `botcircuits-logo.svg` (symbol) and `botcircuits-wordmark.svg` (ink wordmark). When they are missing, a dashed placeholder box is rendered and the render script warns. After adding the wordmark, set `WORDMARK_ASPECT` in `src/components/BrandAssets.tsx` to match its viewBox.
- `BRAND_LIME` in `src/constants.ts` is a placeholder colour.
- Guards (`SafeAreaGuard`) run on every render and fail it on a safe area, title box or first frame violation.
- The render script uses the preinstalled Chromium in `/opt/pw-browsers` when present (override with `REMOTION_BROWSER`).

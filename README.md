# botcircuits-motion-video

## SpaceTitleCard (v3)

A 10.0s (600 frames, 1920x1080, 60 fps, no audio) Remotion homepage animation: "Ask. Agents work. You approve." A request is typed, an agent team forms, uses connected tools and the Company Brain, fills a table, pauses for human review and completes after approval.

```bash
npm install
npm run dev                                      # Remotion Studio
npm run render:space                             # out/space_title_card.mp4, .webm, _poster.png, out/space_stills/
node scripts/render-space.mjs --loop             # LOOP
node scripts/render-space.mjs --end-mark=symbol  # END_MARK "symbol" (10.8s; needs public/botcircuits-logo.svg)
```

- Official logos live in `public/logos/` (`gmail.webp`, `google-sheets.webp`, `google-drive.webp`, `slack.webp`), used exactly as supplied. The render script stops if one is missing; `--allow-placeholders` renders a named neutral tile instead and reports it.
- `BRAND_LIME` in `src/constants.ts` is a placeholder colour.
- Layout: `src/SpaceTitleCard/layout.ts`. Beats: `src/SpaceTitleCard/timeline.ts`.
- Guards run on every rendered frame and fail the render: `SafeAreaGuard` (96px safe area, overlaps, lines crossing cards), `ReadabilityGuard` (18px minimum, 4.5:1 contrast, typed text rules, cursor hotspot on Approve) and `LogoGuard` (logo present, at least 28px high, unstretched, untinted, on white, clear space).
- The render script uses the preinstalled Chromium in `/opt/pw-browsers` when present (override with `REMOTION_BROWSER`).

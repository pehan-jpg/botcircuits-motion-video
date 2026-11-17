# botcircuits-motion-video

## SpaceTitleCard (v2)

An 8.0s (480 frames, 1920x1080, 60 fps, no audio) Remotion homepage animation. Events arrive on the left, the agent runs the process in the middle and calls connected tools on the right, a person approves, and the result lands in the table. No text on screen.

```bash
npm install
npm run dev                                      # Remotion Studio
npm run render:space                             # out/space_title_card.mp4, .webm, _poster.png, out/space_stills/
node scripts/render-space.mjs --loop             # LOOP
node scripts/render-space.mjs --end-mark=symbol  # END_MARK "symbol"
node scripts/render-space.mjs --labels           # SHOW_LABELS
```

- Brand logos expected in `public/logos/`: `gmail.svg`, `slack.svg`, `salesforce.svg`, `zendesk.svg`, `google-drive.svg`, `google-sheets.svg`. `public/botcircuits-logo.svg` is used by END_MARK "symbol". Missing files render as neutral dashed placeholders, and the render script lists them.
- `BRAND_LIME` in `src/constants.ts` is a placeholder colour.
- Layout lives in `src/SpaceTitleCard/geometry.ts`; beats in `src/SpaceTitleCard/timeline.ts`.
- `SafeAreaGuard` runs on every render and fails it when anything leaves the 96px safe area, guarded elements overlap, or a line crosses a node or tile it does not connect.
- The render script uses the preinstalled Chromium in `/opt/pw-browsers` when present (override with `REMOTION_BROWSER`).

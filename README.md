# botcircuits-motion-video

BotCircuits CX product explainer, built with Remotion (TypeScript, 1920x1080, **60 fps**).

```bash
npm install
npm run dev      # Remotion Studio preview
npx remotion render src/index.ts FullVideo out/preview_scenes_1_to_8_v6.mp4 --codec=h264 --crf=18
```

## Compositions
- `FullVideo` (main, 52 s): scenes 1-8 in one `TransitionSeries` (4/5/7/5/9/9/6/7 s)
- `ProblemSequence` (16 s): scenes 1-3 only
- `Build-scenes/Scene04..08`: each Build scene on its own

## Timing
All timing goes through `sec(n)` (`src/timeline.ts`). Scenes 1-3 keep their 30 fps storyboard numbers via `f30(n) = sec(n / 30)`.
Scenes 4-8 author keyframes in seconds with `kf(frame, [seconds], [values])` (`src/theme.ts`).

## Structure
- `src/theme.ts` tokens (lime is a single constant, used only as an accent), Build palette, fonts, easing, `kf`/`tween`/`press`/`popIn`
- `src/timeline.ts` fps, `sec`, scenes 1-3 bounds and beats
- `src/handoff.ts` hand-off contract between Build scenes (field, orb positions, marquee slots, comet, backdrops, `WHATSAPP_CARD_FINAL` for scene 9)
- `src/constants.ts` `TAGLINE` for the end card (`TypedLine`)
- `src/layout.ts` scenes 1-3 world layout and the `PILL` hand-off into scene 4
- `src/scenes/` scenes 1-3 (+ persistent `ThreadStage`)
- `src/build/` scenes 4-8
- `src/components/` shared: Cursor (arrow + hand), Orb (white), AgentAvatar (white), LogoTile + logos, ChannelCard, GlassPlate, FieldInput (wrapping), PetalSpinner, StepRow (peek), VariableChip/Tag, TypedLine, Backdrop (image with procedural fallback), ProceduralSky (cream, lilac, dusk, foreground clouds), CircleReveal, StrokeLine, Glyphs, Logo, Stage (camera/world)
- `src/build/comet.tsx` the comet wipe shared by scenes 7 and 8
- `public/backdrops/` sky images; `public/logos/<name>.svg` official logos (optional; simple-icons fallback otherwise)
- `public/botcircuits-logo.svg`, `public/botcircuits-wordmark.svg`
- `scripts/stills.mjs` renders FullVideo stills: `node scripts/stills.mjs out/stills 960 1110 ...`

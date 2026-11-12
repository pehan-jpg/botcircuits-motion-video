# botcircuits-motion-video

BotCircuits CX product explainer, built with Remotion (TypeScript, 1920x1080, **60 fps**).

```bash
npm install
npm run dev      # Remotion Studio preview
npx remotion render src/index.ts FullVideo out/preview_scenes_1_to_8.mp4 --codec=h264 --crf=18
```

## Compositions
- `FullVideo` (main, 47 s): scenes 1-8 in one `TransitionSeries`
- `ProblemSequence` (16 s): scenes 1-3 only
- `Build-scenes/Scene04..08`: each Build scene on its own

## Timing
All timing goes through `sec(n)` (`src/timeline.ts`). Scenes 1-3 keep their 30 fps storyboard numbers via `f30(n) = sec(n / 30)`.
Scenes 4-8 author keyframes in seconds with `kf(frame, [seconds], [values])` (`src/theme.ts`).

## Structure
- `src/theme.ts` tokens (lime is a single constant), fonts (bundled in `public/fonts`), easing, `kf`/`tween`/`press`
- `src/timeline.ts` fps, `sec`, scenes 1-3 bounds and beats
- `src/handoff.ts` hand-off contract between Build scenes (morph positions, cameras, `AGENT_AVATAR_FINAL` for scene 9)
- `src/layout.ts` scenes 1-3 world layout and the `PILL` hand-off into scene 4
- `src/scenes/` scenes 1-3 (+ persistent `ThreadStage`)
- `src/build/` scenes 4-8 and their backgrounds
- `src/components/` ChatWindow, Bubble/Avatar, PromptBar, StatusChip/VariableChip/Tag, Cursor, TypingText/Caret, TypingDots, StrokeLine, Sweep, Logo, Agent, Stage (camera/world/blobs), Icons, procedure/ (Procedure editor)
- `public/botcircuits-logo.svg`, `public/botcircuits-wordmark.svg` vectorised from the supplied logo PNG
- `scripts/stills.mjs` renders FullVideo stills: `node scripts/stills.mjs out/stills 960 1110 ...`

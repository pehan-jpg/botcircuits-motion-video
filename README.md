# botcircuits-motion-video

BotCircuits CX product explainer, built with Remotion (TypeScript, 1920x1080, **60 fps**).

```bash
npm install
npm run dev      # Remotion Studio preview
npx remotion render src/index.ts FullVideo out/preview_scenes_1_to_9_v7.mp4 --codec=h264 --crf=18
```

## Compositions
- `FullVideo` (main, 55.5 s): scenes 1-3 (16 s) + build stage scenes 4-9 (3.5/7/10.5/8/6/7 s, overlapping 0.5 s)
- `ProblemSequence` (16 s): scenes 1-3 only
- `Build-scenes/Scene04..08`: each Build scene on its own

## Timing
All timing goes through `sec(n)` (`src/timeline.ts`). Scenes 1-3 keep their 30 fps storyboard numbers via `f30(n) = sec(n / 30)`.
Scenes 4-8 author keyframes in seconds with `kf(frame, [seconds], [values])` (`src/theme.ts`).

## Structure
- `src/theme.ts` tokens (lime is a single constant), fonts, easing helpers
- `src/timeline.ts` fps, `sec`, scenes 1-3 bounds and beats
- `src/v7.ts` build-stage timeline (scenes 4-9, 0.5 s overlaps), stage world (chat card + app shell), camera views, `WHATSAPP_CARD_FINAL` for scene 10
- `src/scenes/` scenes 1-3 (+ `ThreadStage`), and Scene04Intro ... Scene09Publish. Each build scene renders three layers (bg, shell, fg) that FullVideo stacks, so outgoing content blur-dissolves above the persistent shell/chat.
- `src/ui/` product UI rebuilt from `public/reference/*.png`: tokens (Plus Jakarta Sans), AppShell, ConsoleCard, Procedure (StepsCard, StepRow, TypeTag), ChatCard (ChatBubble, ResultChip, SourceChip), Panels (SourceRow, TracePanel, FlipCounter, TestResultCard, PublishButton, Spinner), ChannelCard
- `src/components/` Orb (iridescent), CameraRig, Cursor, Backdrop, ProceduralSky, CircleReveal, StrokeLine, logos, TypedLine, ...
- `public/backdrops/`, `public/logos/` (optional official SVGs), `public/reference/` (screenshots, reference only)
- `scripts/stills.mjs` renders FullVideo stills

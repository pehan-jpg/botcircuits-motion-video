# botcircuits-motion-video

BotCircuits CX product explainer, built with Remotion (TypeScript, 1920x1080, **60 fps**).

```bash
npm install
npm run dev      # Remotion Studio preview
npx remotion render src/index.ts FullVideo out/preview_scenes_1_to_13_v15.mp4 --codec=h264 --crf=18
```

## Compositions
- `FullVideo` (main, 127.4 s): scenes 1-3 (16 s) + scenes 4-13 with seven TextBeats. Scene lengths are derived in `src/pacing.ts` (chat pacing: character typewriter at TYPE_CPS 32 / REPLAY_CPS 70, HOLD, replay mode) and assembled in `src/v7.ts`.
- `ProblemSequence` (16 s): scenes 1-3 only
- `Build-scenes/Scene04..13`: each Build scene on its own

## Timing
All timing goes through `sec(n)` (`src/timeline.ts`). Scenes 1-3 keep their 30 fps storyboard numbers via `f30(n) = sec(n / 30)`.
Scenes 4-8 author keyframes in seconds with `kf(frame, [seconds], [values])` (`src/theme.ts`).

## Structure
- `src/theme.ts` tokens (lime is a single constant), fonts, easing helpers
- `src/timeline.ts` fps, `sec`, scenes 1-3 bounds and beats
- `src/v7.ts` build-stage timeline (scenes 4-9, 0.5 s overlaps), stage world (chat card + app shell), camera views, `WHATSAPP_FINAL` (solid green + centred logo) for scene 10
- `src/scenes/` scenes 1-3 (+ `ThreadStage`), and Scene04Intro ... Scene09Publish. Each build scene renders three layers (bg, shell, fg) that FullVideo stacks, so outgoing content blur-dissolves above the persistent shell/chat.
- `src/ui/` product UI rebuilt from `public/reference/*.png`: tokens (Plus Jakarta Sans), AppShell, ConsoleCard, Procedure (StepsCard, StepRow, TypeTag), ChatThread (autosizing chat with header, avatars, timestamps, chips), Panels (SourceRow, TracePanel, FlipCounter, TestResultCard, PublishButton, Spinner), ChannelLogo (standalone brand glyph, glow, badge)
- `src/components/` Orb (soft green gradient; grey when untrained), SafeAreaGuard (dev only), CameraRig, Cursor, Backdrop, ProceduralSky, CircleReveal, StrokeLine, logos, TypedLine, ...
- `public/backdrops/`, `public/logos/` (optional official SVGs), `public/reference/` (screenshots, reference only)
- `scripts/stills.mjs` renders FullVideo stills
- `scripts/qa.mjs` (`npm run qa`) renders a still every 0.5 s with `qa: true` into `out/qa/`, writes `out/qa/safe-area-report.txt` and exits non-zero on any safe-area violation (the app window itself included)

- `src/constants.ts`: `TAGLINE` (scene 13 end line) and `URL` (typed under the end lockup when non-empty)
- Scenes 10-13: `Scene10WhatsApp` (frozen 9:02 AM clock callback), `Scene11Voice` (call card, waveform ring, teammate joins), `Scene12Loop` (Conversations, take over / hand back, loop ring), `Scene13End` (end line, lockup)
- `src/ui/FlyChip.tsx`: shared-element chip that lifts out of one card and lands as another (scene 6 and 7 proofs)
- `src/ui/TextBeat.tsx` + `src/scenes/Beats.tsx`: the seven TextBeats (typed line, lime underline that the next scene morphs into its key shape); `src/components/Morph.tsx` (RectMorph, LineToCircle)
- `src/pacing.ts`: chat pacing constants, `chatTimeline()`, the chat sequences, the scene 11 voice slots, derived scene lengths, ReadabilityGuard and assertGaps; `npm run guards` (also run first by `npm run qa`)
- `src/ui/typewriter.ts`: deterministic character typewriter (jitter, punctuation pauses, 70 ms fade) shared by pacing and rendering

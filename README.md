# botcircuits-motion-video

BotCircuits CX product explainer, built with Remotion (TypeScript, 1920x1080, 30 fps).

```bash
npm install
npm run dev      # Remotion Studio preview
npm run render   # -> out/problem_sequence.mp4
```

## Structure
- `src/theme.ts` colour tokens, fonts (bundled in `public/fonts`), easing helper
- `src/timeline.ts` scene bounds, `SCENE_DURATIONS`, transition length, key beats
- `src/layout.ts` world layout of the chat window and the `PILL` hand-off coordinates for scene 4
- `src/camera.ts` keyframed camera (push / pan / zoom / rotate)
- `src/components/` `ChatWindow`, `Bubble` (+ `Avatar`, `BubbleMeta`, `Checks`), `Roll`, `Atmosphere`
- `src/scenes/Scene01-03.tsx` per-scene background + HUD layers (in a `TransitionSeries`)
- `src/scenes/ThreadStage.tsx` the persistent conversation, rendered once across scenes 1-3
- `src/ProblemSequence.tsx` composition (480 frames)

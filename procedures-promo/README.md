# BotCircuits Procedures — Promo Video

Remotion project for the "BotCircuits Procedures" SaaS promo (1920×1080, 60 fps, 45.1 s, no audio).

```bash
npm i
npm run dev                       # open Remotion Studio
npx remotion render ProceduresPromo out/botcircuits-procedures-promo.mp4
```

## Structure

- `src/ProceduresPromo.tsx` — master timeline (TransitionSeries of the 8 scenes)
- `src/scenes/` — one file per scene; each is also registered on its own under **Scenes** in Studio
- `src/components/ProcedureEditor.tsx` — the Procedures UI (shared by scenes 5–7)
- `src/editorTimeline.ts` — frame-accurate editor state for scenes 5–7 (typing, clicks, branch cascade, traversal)
- `src/theme.ts` — design system: colours, Inter 400/500, easing, copy

## Design system

- Canvas `#F9FAFB`, ink `#111827`, grey `#6B7280`, accent Pigmented Lime `#D2F800` (used sparingly)
- Inter Regular (400) and Medium (500) only, bundled locally in `public/fonts`
- Layout is authored on a 960×540 logical stage and scaled 2× to 1080p, so spec sizes (e.g. 32px) map directly
- Exponential ease-out `cubic-bezier(0.16, 1, 0.3, 1)` for reveals; springs for pops

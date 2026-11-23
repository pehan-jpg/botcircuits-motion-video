# cx-capability-animations

Six looping micro animations for the capability section of the BotCircuits CX
product page, built with Remotion. Only **Build** exists so far.

| Setting | Value |
| --- | --- |
| Canvas | 1600 x 1000, 60 fps, 8 s (480 frames), set in `src/config.ts` |
| Loop | Frame 0 and frame 479 are both blank white and decode bit identical |
| Font | Inter 400, 500 and 600, loaded locally from `public/fonts` |
| Easing | `Easing.bezier(0.22, 1, 0.36, 1)` everywhere (`tokens.ts`) |

## Structure

```
src/
  config.ts              width, height, fps, duration
  tokens.ts              colours, shadow, radii, easing (shared by all six)
  fonts.ts               local Inter loader
  motion.ts              eased progress helper
  components/
    Card.tsx             white card with border and shadow
    Chip.tsx             grey pill (also tags and the lime status pill)
    Icons.tsx            14px line icons, 1.5px stroke, and the drawn tick
    TypedText.tsx        typing with the newest word on a lime tint highlight
    StepRow.tsx          numbered procedure row with tag, indent and typing
    Veil.tsx             the soft dissolve used for every state change
  compositions/build/
    timeline.ts          every scene time, in seconds (retime here)
    content.ts           on screen copy
    Build.tsx            the scene
```

To add the next animation, create `src/compositions/<name>/` with its own
`timeline.ts`, `content.ts` and scene, then register it in `src/Root.tsx`.

## Commands

```bash
npm install
npm run studio          # interactive preview
npm run stills:build    # review stills into out/stills/build
npm run preview:build   # half resolution motion check into out/preview
npm run render:build    # out/build.mp4, out/build.webm, out/build-poster.png
```

Set `REMOTION_BROWSER` to a Chrome headless shell path to use a preinstalled
browser instead of Remotion's download.

## Deviations from the brief

* **Prompt pill width is 900px, not 760px.** The prompt at Inter Medium 30px
  renders about 784px wide, which cannot fit inside a 760px pill with 28px
  text padding and the 44px send button. The type size was kept and the
  pill widened. Change `PILL.width` in `Build.tsx` if you prefer a smaller
  type size instead.
* **Avatar.** `public/assets/logo.svg` is picked up automatically when it
  exists. It is not in the repository yet, so a neutral grey circle is shown.
* **Veil bounds.** The wash sits on the outgoing element's bounds while it
  rises, then reshapes to the incoming element's bounds as it falls away.

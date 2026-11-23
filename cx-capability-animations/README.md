# cx-capability-animations

Six looping micro animations for the capability section of the BotCircuits CX
product page, built with Remotion. Built so far: **Build** and **Integrate**.

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
    Chip.tsx             pill used for labels, tags and the lime status pill
    Icons.tsx            14px line icons, 1.5px stroke, and the drawn tick
    TypedText.tsx        typing with the newest word on a lime tint highlight
    StepRow.tsx          numbered procedure row with coloured 96px tag, indent and typing
    Orb.tsx              counter rotating gradient orb, one turn per loop
    SystemTile.tsx       connected system tile with icon, name, detail and status
    StatusPill.tsx       Connect, spinner and Connected states, crossfaded
    Spinner.tsx          quarter arc loading ring, frame driven
    ConnectionLine.tsx   curved fan line drawn by dashoffset, with arc length helpers
    Pulse.tsx            lime dot that travels along a ConnectionLine
    Veil.tsx             the soft dissolve used for every state change
  compositions/build/
    timeline.ts          every scene time, in seconds (retime here)
    content.ts           on screen copy
    Build.tsx            the scene
  compositions/integrate/
    timeline.ts          every scene time, in seconds
    content.ts           systems, counter text and actions
    Integrate.tsx        the scene (all tile state derived from the frame)
```

To add the next animation, create `src/compositions/<name>/` with its own
`timeline.ts`, `content.ts` and scene, then register it in `src/Root.tsx`.

## Commands

```bash
npm install
npm run studio          # interactive preview
npm run stills:build    # review stills into out/stills/build
npm run preview:build   # half resolution motion check into out/preview
npm run render:build    # out/build-v2.mp4, out/build-v2.webm, out/build-v2-poster.png
npm run stills:integrate
npm run preview:integrate
npm run render:integrate   # out/integrate-v1.mp4, .webm and -poster.png
```

Set `REMOTION_BROWSER` to a Chrome headless shell path to use a preinstalled
browser instead of Remotion's download.

## Deviations from the brief

* **Prompt pill width is 900px, not 760px.** The prompt at Inter Medium 30px
  renders about 784px wide, which cannot fit inside a 760px pill with 28px
  text padding and the 44px send button. The type size was kept and the
  pill widened. Change `PILL.width` in `Build.tsx` if you prefer a smaller
  type size instead.
* **Tool tag colour.** The requested `#a85a10` on `#fdecd8` measured 4.39 to 1,
  so the text was darkened to `#a05510` (4.78 to 1). All tag pairs live in
  `tagColours` in `tokens.ts` with their measured ratios.
* **Veil bounds.** The wash sits on the outgoing element's bounds while it
  rises, then reshapes to the incoming element's bounds as it falls away.

## Renders

| Version | Files | Changes |
| --- | --- | --- |
| v1 | `out/build.*` | First cut |
| v2 | `out/build-v2.*` | Coloured 96px tags, aligned row text, animated orb avatar |
| Integrate v1 | `out/integrate-v1.*` | First cut |

## Integrate notes

* The shared orb carries lime in its gradient, so on Integrate lime appears
  in the orb as well as the Connected pills, the pulse dot and the result
  highlight.

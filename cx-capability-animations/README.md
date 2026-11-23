# cx-capability-animations

Six looping micro animations for the capability section of the BotCircuits CX
product page, built with Remotion. Built so far: **Build**, **Integrate**, **Simulate** and **Publish**.

| Setting | Value |
| --- | --- |
| Canvas | 1600 x 1000, 60 fps, 8 s (480 frames), set in `src/config.ts`. Publish runs 12 s (720 frames), set in `publish/timeline.ts` |
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
    TestRow.tsx          test scenario row that grows to show a reason and fix
    StatusIcon.tsx       idle, running, passed and failed states, crossfaded
    ResultPill.tsx       Passed or Failed pill
    ProgressBar.tsx      thin lime progress bar
    Counter.tsx          rolling number with label crossfade and highlight
    FixBlock.tsx         divider, label and one typed procedure step
    ChannelRow.tsx       channel row that morphs into a mockup card (one rectangle)
    ChannelGlyph.tsx     generic 1.75px channel glyphs and the grey icon box
    PublishButton.tsx    Publish button that becomes the Published pill
    ContextBar.tsx       customer and booking pill, plus initials avatar
    ChatBubble.tsx       fixed size message bubble whose text types in
    MockShared.tsx       exchange timing, time label and ticks for the mockups
    WhatsAppMock.tsx     generic messaging chat mockup
    InstagramMock.tsx    generic direct message mockup
    VoiceMock.tsx        call screen with timer, waveform and captions
    Waveform.tsx         frame driven voice waveform
    Veil.tsx             the soft dissolve used for every state change
  compositions/build/
    timeline.ts          every scene time, in seconds (retime here)
    content.ts           on screen copy
    Build.tsx            the scene
  compositions/integrate/
    timeline.ts          every scene time, in seconds
    content.ts           systems, counter text and actions
    Integrate.tsx        the scene (all tile state derived from the frame)
  compositions/simulate/
    timeline.ts          every scene time, in seconds
    content.ts           test scenarios, failure reason and fix step
    Simulate.tsx         the scene (all row state derived from the frame)
  compositions/publish/
    timeline.ts          every scene time in seconds, plus the 12 s length
    content.ts           channels, customer and the three conversations
    Publish.tsx          the scene
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
npm run stills:simulate
npm run preview:simulate
npm run render:simulate    # out/simulate-v1.mp4, .webm and -poster.png
npm run stills:publish
npm run preview:publish
npm run render:publish     # out/publish-v2.mp4, .webm and -poster.png
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
| Simulate v1 | `out/simulate-v1.*` | First cut |
| Publish v2 | `out/publish-v2.*` | First cut (named v2 as requested) |

## Integrate notes

* The shared orb carries lime in its gradient, so on Integrate lime appears
  in the orb as well as the Connected pills, the pulse dot and the result
  highlight.

## Simulate notes

* The card's top edge is fixed at y 180, so the card at its tallest (fix
  open, 640px) is centred. It only grows and shrinks downward.
* The counter rolls 20 points over 0.4s starting the moment each test
  passes (0.5s for the rerun), so frames caught mid roll show values
  between the steps.
* Normal test rows have a white fill and the shared 1px border, which is
  what the failed row fades back to.

## Publish notes

* Channel names appear as text only. All glyphs are generic line drawings in
  charcoal; no logos or brand colours.
* The More channels row never goes live, so it has no connection line.
* The veil spans the whole scene here, so its peak is 0.45 instead of
  Build's 0.8 (`transition.veilPeak`) to keep it a soft dissolve.
* Part 2 follows the brief's positions (bar centred at y 40, cards 90 to
  730), which leaves 270px of white below the cards. Adjust `MOCK.top` and
  `BAR.centreY` in `Publish.tsx` to rebalance.

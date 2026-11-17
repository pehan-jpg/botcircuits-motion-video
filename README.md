# botcircuits-motion-video

Remotion project for BotCircuits motion pieces.

## ConciergeTitleCard (v2)

An 8.0s chat micro animation (1920x1080, 60 fps, 480 frames, no audio). A customer asks the Card Services Agent to block a lost card, and the agent does it. The customer then accepts a replacement card, and the agent orders it. The clip ends on the resolved chat.

```bash
npm install
npm run dev                 # Remotion Studio
npm run render:concierge    # MP4, WebM, poster and stills into /out
```

Flags for `node scripts/render-concierge.mjs`:
- `--end-mark=symbol`: in the last 0.8s, the card collapses into the orb and morphs into the BotCircuits symbol (the default is `none`).
- `--loop`: the thread fades out in the last 0.4s, so the clip returns to the empty card.
- `--stills-only`: renders only the stills.

The defaults (`END_MARK`, `LOOP`, `DURATION`) live in `src/constants.ts`.

The outputs go to `/out`: `concierge_title_card.mp4` (H.264, CRF 16, yuv420p), `concierge_title_card.webm` (VP9), `concierge_title_card_poster.png` (last frame) and `concierge_stills/` (one PNG every 0.25s).

### Brand assets

Put `botcircuits-logo.svg` (symbol) and `botcircuits-wordmark.svg` (wordmark, ink) in `/public`. If either file is missing, a labelled dashed placeholder is drawn instead. The symbol is used only by the optional end mark, and it is tinted ink with a mask.

`BRAND_LIME` in `src/constants.ts` is a placeholder hex.

### Fonts

Plus Jakarta Sans (500, 600) and JetBrains Mono come from Google Fonts. The files are vendored into `public/fonts` (run `node scripts/vendor-fonts.mjs` to refresh them), so renders do not need network access.

### Guards

Both guards run on every rendered frame when the `guards` prop is true (the default).

- `SafeAreaGuard` fails the render when an element leaves the 96px safe area or the centre 60 percent of the frame.
- `ReadabilityGuard` fails the render when:
  - a message shows a character before it starts typing,
  - a bubble's width changes,
  - an empty bubble is taller than one line, or a bubble runs more than one line ahead of its text,
  - typing exceeds 40 characters per second,
  - chip text contrast drops below 4.5:1.

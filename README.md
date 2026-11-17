# botcircuits-motion-video

Remotion project for BotCircuits motion pieces.

## ConciergeTitleCard

A 5.6s homepage title card (1920x1080, 60 fps, 336 frames, no audio). A customer asks for something in a chat, the agent does it, then the title appears.

```bash
npm install
npm run dev                 # Remotion Studio
npm run render:concierge    # MP4, WebM, poster and stills into /out
```

Use `node scripts/render-concierge.mjs --loop` to render the looping version.

The outputs go to `/out`: `concierge_title_card.mp4` (H.264, CRF 16, yuv420p), `concierge_title_card.webm` (VP9), `concierge_title_card_poster.png` (last frame) and `concierge_stills/` (one PNG every 0.25s).

### Brand assets

Put `botcircuits-logo.svg` (symbol) and `botcircuits-wordmark.svg` (wordmark, ink) in `/public`. If either file is missing, a labelled dashed placeholder is drawn instead. The symbol is tinted ink with a mask. The wordmark width follows the SVG `viewBox` ratio, and the lockup re-centres itself automatically.

`BRAND_LIME` in `src/constants.ts` is a placeholder hex.

### Fonts

Plus Jakarta Sans (500, 600) and JetBrains Mono come from Google Fonts. The files are vendored into `public/fonts` (run `node scripts/vendor-fonts.mjs` to refresh them), so renders do not need network access.

### Guards

`SafeAreaGuard` runs on every rendered frame when the `guards` prop is true (the default). It fails the render when an element leaves the 96px safe area or the centre 60 percent of the frame. It also fails when the title box moves, resizes or wraps, or when a title character is visible on the title's first frame.

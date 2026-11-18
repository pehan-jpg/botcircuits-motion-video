# botcircuits-motion-video

Remotion project for BotCircuits motion pieces.

## ConciergeTitleCard (v3)

A 10.0s piece (1920x1080, 60 fps, 600 frames, no audio). A WhatsApp-style conversation runs on the left. Each action the agent completes lifts out of the chat as a receipt card and lands on a rail on the right: Card blocked, New card ordered, Delivery address confirmed.

```bash
npm install
npm run dev                 # Remotion Studio
npm run render:concierge    # MP4, WebM, poster and stills into /out
```

Flags for `node scripts/render-concierge.mjs`:
- `--end-mark=symbol`: the clip becomes 10.8s, and the stage contents collapse into the BotCircuits symbol (0.2s), which then holds for 0.6s.
- `--loop`: the stage contents fade in the last 0.4s, back to the empty chat and slots.
- `--stills-only`: renders only the stills.

The defaults (`END_MARK`, `LOOP`, `PAGE_BG`, `DURATION`, `CHAT_CPS`) live in `src/constants.ts`.

The outputs go to `/out`: `concierge_title_card.mp4` (H.264, CRF 16, yuv420p), `concierge_title_card.webm` (VP9), `concierge_title_card_poster.png` (last frame) and `concierge_stills/` (one PNG every 0.25s).

### Brand assets

Put the WhatsApp logo at `/public/logos/whatsapp.svg` and the BotCircuits symbol at `/public/botcircuits-logo.svg`; the symbol is used only by the optional end mark, where it is tinted ink with a mask. Any missing file is replaced by a neutral labelled placeholder. Logos are never redrawn.

`BRAND_LIME` in `src/constants.ts` is a placeholder hex.

### Fonts

Plus Jakarta Sans (500, 600) and JetBrains Mono come from Google Fonts. The files are vendored into `public/fonts` (run `node scripts/vendor-fonts.mjs` to refresh them), so renders do not need network access.

### Guards

Both guards run on every rendered frame when the `guards` prop is true (the default).

- `SafeAreaGuard` fails the render when an element leaves the 96px safe area.
- `ReadabilityGuard` fails the render when:
  - a message shows a character before it starts typing,
  - a bubble's width changes,
  - an empty bubble is taller than one line, or a bubble runs more than one line ahead of its text,
  - typing exceeds 40 characters per second,
  - any marked text drops below 4.5:1 contrast,
  - chips, receipts and slots overlap each other or the chat window. A receipt may cover its own slot, and a receipt in flight may cross the chat window.

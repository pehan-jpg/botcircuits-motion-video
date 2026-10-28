# botcircuits-motion-video

Remotion project for BotCircuits product motion videos.

## PaymentsUseCase

A 27.35 second, silent, vertical (1080 x 1920, 60 fps) video about B2B
payments, made easier: an explainer intro, an iOS style Chats list where the
user opens a fictional payments agent (Northbridge Payments), then the agent
pays a supplier invoice inside the chat, handles four related scenarios
(status, bulk, duplicate, scheduled), and the video closes on the BotCircuits
logo on pure white.

All copy, names, amounts and timings (in seconds) live in `src/content.ts`.
Design tokens and easings live in `src/theme.ts`.

```bash
npm i
npx remotion studio
```

Render:

```bash
npx remotion render src/index.ts PaymentsUseCase out/payments-usecase.mp4 --muted --codec h264 --crf 16
```

Review stills (bundles once, renders any frames):

```bash
node scripts/stills.mjs out/stills 60 300 880
scripts/contact-sheet.sh out/stills out/sheet.png 5
```

### Layout

| Path | Purpose |
|---|---|
| `src/content.ts` | Copy, placeholders, scene and camera timings |
| `src/PaymentsUseCase.tsx` | Camera, glass phone rise (T1), list push, blur through screens, phone fade out (T6), motion blur |
| `src/components/WhatsAppChat.tsx` | Phone screen, conversation screen and message parts |
| `src/components/Icons.tsx` | Original UI icons and the Northbridge Payments avatar |
| `src/scenes/ChatsList.tsx` | Chats list with tap and tab bar |
| `src/components/PaymentRoute.tsx` | Payment route, stepper and Paid chip |
| `src/components/Background.tsx` | Flat white with two brief pale atmosphere moments |
| `src/scenes/` | Intro, main conversation, scenarios, closing logo |

### Notes

1. Inter (SIL Open Font License) is bundled in `public/fonts` so renders work offline.
2. The closing logo is `public/botcircuits-logo.png`, used unaltered.
3. All chat names are fictional and avatars are initials or original drawings.
   No photographs and no official messaging app logo are used.

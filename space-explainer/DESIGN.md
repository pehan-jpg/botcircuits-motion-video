# Space by BotCircuits: explainer design rules

Read this before building or changing any scene. It captures the brief for the
whole video so later sessions follow the same rules. Code paths are relative to
this project (`space-explainer/`).

Video: 1920x1080, 60 fps, 122 s (2:02). Product: **Space by BotCircuits**, an
agent workspace where agents prepare and people decide.

## 0. Assets and rules

- Logo: `public/logo.png` (supplied PNG, black on transparent; briefs may call
  it `logo.svg`). Use exactly as supplied. Never redraw or recolour it. If it
  is missing, stop and ask.
- Product name: always the `SpaceByLockup` component ("Space by", optional
  prefix such as "Introducing ", then the logo at cap height plus descender,
  baseline aligned, 0.25em gap; weight and tracking are props). Never type
  "BotCircuits" or "by BotCircuits" as text. Use the lockup wherever the
  product name appears, including the Scene 11 end card. `logoMode="assemble"`
  flies the logo's dots in: `public/logo-parts/` holds pixel exact crops of
  `logo.png` (recomposition verified to 0 differing pixels) and the finished
  frame shows the untouched `logo.png`.
- Third party logos: `public/logos/` (Gmail, Google Drive, Google Sheets,
  Slack), unmodified, sources in `public/logos/SOURCES.md`. They are third party
  copies (Wikimedia Commons) pending verification against official media kits.
  Never redraw a real logo. Tag them `data-guard="brand"`; the PDF icon is an
  original drawing (`PdfIcon`).
- UI references in `reference/ui/`: 01-chat (still to be added as a file),
  02-control-room-office, 03-control-room-dashboard, 04-agents, 09-integrations.
- Chat UI reference: `reference/ui/01-chat.png` (1875x895). Scene 3 rebuilds it
  as `src/components/chat/ChatScreen.tsx` at native size, scaled 0.8 into the frame.
- Plates: `public/backgrounds/01-dawn-meadow.jpg`, `02-morning-field.jpg`,
  `03-day-hills.jpg`, `04-dusk-horizon.jpg` (1672x941 originals upscaled to
  1920x1080). If a plate is missing, `PlateBackground` falls back to a
  procedural sky gradient with soft hills in the same palette and logs a warning.
- Fonts are vendored in `public/fonts` (Fontsource, OFL) so renders never need
  the network.
- `/reference/video/` (motion references, when present): study motion only.
  Never reuse footage or recreate specific shots.
  - Scenes morph into each other instead of cutting. The first frame of a scene
    matches the last frame of the one before.
  - Text blurs in from 24px with a 20px rise over 0.7 s (`BlurText`).
  - A button can turn into a status orb. A headline can shrink into an input pill.
  - Average shot length about 3 s. Hold longer on the one idea that matters.
- `/reference/docs/` (Space docs digest and designer brief, when present): use their terms.
- Copy rules
  - Never the word "workflow". Use "Playbook".
  - No hyphens or dashes used as dashes.
  - Direct, concise, unexaggerated. Never claim AI output is always correct.
  - American English spelling on screen.
- Every name, amount and ID shown on screen lives in `src/placeholders.ts`.

## Delivery: one video that grows

- The deliverable is ONE file, `out/space_video.mp4`, rendered from the
  `SpaceVideo` composition with `npm run render:video`.
- `src/timeline.ts` has a `built` flag per scene. SpaceVideo plays only built
  scenes, back to back: no gaps, no placeholders, no black frames. To add a
  scene: build it, register it in `src/scenes/index.tsx` (`SCENE_COMPONENTS`),
  flip `built` to true, re-render the same file.
- Continuity: the first frame of each scene equals the last frame of the
  previous one. Share layout constants across the boundary (see
  `src/scenes/shared/intro.tsx`) and continue background state with
  `PlateBackground` `kbFrom`, `kbTo` and `timeOffset`, and orbs with `timeOffset`.
- `npm run check` runs every check; `scripts/check-video.py` verifies duration,
  black frames, motion gaps and boundary similarity (PSNR per boundary).

## 1. Design system (`src/theme.ts`)

| Token | Value |
| --- | --- |
| Ink | `#0D1224` |
| Muted ink | Ink at 60 percent |
| Fonts | Plus Jakarta Sans, JetBrains Mono |
| EASE | `cubic-bezier(0.22, 1, 0.36, 1)`; `EASE_SETTLE` overshoots at most 4 percent |
| Typing | `HEADLINE_CPS` 20, `CHAT_CPS` 32, `REPLAY_CPS` 70 |

Backgrounds by scene: Scene 1 `ProblemBackdrop`: base #F2F3F8 with large
blurred blobs (blur 160px): lilac #DAD6F3 at 55 percent bottom left, cool blue
grey #D6E2F0 at 55 percent top right, faint peach #F6E3D9 at 40 percent bottom
right, drifting at most 3 percent, 3 percent grain. Soft and cool, never flat. Scenes 2 to 9 photographic plates. Scene 10 neutral
pale `#F4F6F8`. Scene 11 pure white.

**Product frame** (from Scene 3), `ProductWindow`: dark app window, 24px
radius, soft shadow, 1500x716 at (210, 210). Product screens are authored at
the screenshots' native size (1875x895) and scaled 0.8.

**Camera rule.** In UI scenes, focus zooms up to 1.8x are allowed, eased, with
pans to the area being explained, so any text meant to be read is at least
28px equivalent on screen. Zoom out again before each scene ends so scene
boundaries still match. Never a hard cut inside a scene. While zoomed, the
product window and its UI may cross the frame edge (the guard treats them as
background); story text meant to be read stays inside the safe area.

**Space orb** (`SpaceOrb`, palette `ORB_PALETTE` in `src/theme.ts`): a knob
style violet sphere. Conic gradient from 210deg: #1B1048 0deg, #3F28B0 70deg,
#A89BFF 120deg (bright streak), #5B3FD6 170deg, #22136A 240deg, #4A32C4 300deg,
#1B1048 360deg, with a brushed metal sheen that turns once per 14s. Layers: a
radial highlight at 35% 30% (white 28 percent to transparent by 45 percent),
edge darkening, a blurred white ellipse highlight upper left (28 percent of the
diameter, 35 percent opacity), a 1px inner rim (white 18 percent) and a drop
shadow 0 24px 48px rgba(60,40,140,0.28). Props: `size`, `ticks`, `pulse`,
`timeOffset`. Tick ring: 56 radial ticks, 2px, round caps, #9AA1B5 at 70
percent, starting 12 percent of the diameter outside the edge, length 5 to 12
percent from slow deterministic noise (3s), so it breathes. **No grey, blue or
green orb anywhere.** The old ringed `AgentOrb` is removed. Use `timeOffset`
when an orb crosses a scene boundary.

**Human glyph** (`HumanGlyph`): amber `#F2A43A` with halo `#FFE2B3`, head circle
and rounded shoulders, 64px, always on a white glass disc. **Amber appears ONLY
where a person decides.**

**Typewriter** (`Typewriter`, `lib/typewriter.ts`): 70ms fade per character,
deterministic jitter of plus or minus 10 percent, 140ms pause on commas, 260ms
on full stops, 2px caret at 70 percent opacity blinking at 1.1 Hz, caret fades
0.3 s after the last character. Lines are given explicitly and laid out in full
(invisibly) before typing, so text never reflows.

**TextBeat**: a short headline typed top left inside the safe area, 56px. Holds
2.5 s, or longer when the ReadabilityGuard needs it, then blurs out.

**Status pill** (`StatusPill`): frosted glass pill, small spinner, 28px label.

**Cursor** (`Cursor`): standard arrow with a soft click ripple, moving on eased,
gently curved paths.

**Guards**
- SafeAreaGuard: nothing within 96px of the edge except backgrounds.
- ReadabilityGuard: text at least 28px; held at least 1.2 s plus 0.25 s per word
  after typing ends; contrast at least 4.5:1 against the sampled background.
  Fix by adding or strengthening a glass panel, never by changing copy.
- assertGaps: no stretch over 0.4 s without motion.
- LogoGuard: logos on white, at least 28px high.

How they run: `GuardLayer` (in every scene) measures `data-guard` elements each
frame; `scripts/stills.mjs` renders stills plus a text hidden background pass;
`scripts/check.py` checks safe area, size, contrast, logo, copy rules, green
orb pixels and stray amber; `scripts/check-timing.ts` checks reading time and
timeline consistency; ffmpeg `freezedetect` checks motion gaps on the MP4s.
Tag new text with `data-guard="text"` and new non-text elements with
`data-guard="box"`. Product UI chrome (sidebar, chips, labels) is drawn at the
screenshot's size and is not held to 28px; story text inside the product
(prompt, messages, pills, answer, source card) is 35px native, 28px on screen.
Font size is measured after scaling.

## 1A. Plate background system (`src/backgrounds`)

- `PlateBackground` shows one plate, or crossfades between two (1.5 s unless
  stated), with a Ken Burns of at most 4 percent and a soft gradient overlay
  for legibility. 6 to 10 floating soft dots (8 to 14px, 40 percent opacity)
  drift slowly, plus 3 percent film grain (also dithers gradients against banding).
- Frosted glass panels (`GlassPanel`: white at 60 percent, 24px backdrop blur,
  1px white border) sit behind every status pill and card that lies on a plate.
- `NightGrade` (plate 04, Scene 7 only): a time value 0 to 1. Brightness down to
  0.35, saturation 0.8, `#0F1A33` multiply tint up to 70 percent, 60 original
  SVG stars with slow deterministic twinkle, one original crescent moon on a
  gentle arc. Stars and moon avoid text zones (`DEFAULT_TEXT_ZONES`, overridable).
  Test bench: `NightGradeTest` composition; stills in `out/stills/nightgrade`.

Plate mapping: Scene 2 uses 01. Scenes 3 and 4 use 02. Scenes 5 and 9 use 03.
Scene 7 uses 04 with NightGrade, then crossfades to 01. Scene 8 starts on 01 and
crossfades to 02. Scene 6 is not in the brief's mapping; the placeholder uses 03
(continuing from Scene 5) until decided.

## 2. Project structure

- `src/timeline.ts`: scene starts and ends in seconds and named events. Read
  events with `local()` / `localF()`. Scenes: 1 0 to 15, 2 15 to 20, 3 20 to 32,
  4 32 to 46, 5 46 to 56, 6 56 to 71, 7 71 to 80, 8 80 to 96, 9 96 to 108,
  10 108 to 114, 11 114 to 122.
- `src/scenes/SceneNN*.tsx`, one per built scene.
- `SpaceVideo` plays the built scenes; `Scene01`, `Scene02`... render one built scene alone.

## 3. The story

Claim **CL-7305**, insured **James Whitfield**, policy **HL-20418**, kitchen
water damage, estimated repair **$1,840**, excess **$250**. Claims Officer:
**Emily Carter**. Agents: **Iris** (Front Desk, from the real product), **Nora**
(Intake), **Theo** (Policy), **Owen** (Evidence). Policy source: "Home Policy
Wording 2026", Section 4.2 Accidental water damage, page 12 **[S1]**. Excess
table **[S2]**. Evidence: 3 photos and 1 plumber invoice. One flag: the invoice
date does not match the reported date of loss, so a person should check it.
State it as a flag, never as an accusation.

### Scene 1, Problem (0:00 to 0:15), built
ProblemBackdrop. Claim card lands in the Inbox, hops to Sheet, Chat and PDF,
leaving a dashed stray copy (v1, v2, v2 final, v3) at each hop. Tab icons at
35px: Gmail, Google Sheets, Slack logos and an original PDF icon. Headline "Work
moves between people, tools and inboxes." Chips one at a time. Row and orb group
scaled 1.25x, centred. The card morphs into the SpaceOrb (ticks, pulse); "Sent"
and "Paid" stamp themselves; a dashed empty slot shows where a person would be
(grey, no amber). Headline "AI can do the work. But who checks it?". "No record
of who decided." then "No one deciding." The orb ends centred at 187.5px.

### Scene 2, Intro (0:15 to 0:20), built
First frame equals Scene 1's last. Over the first 1s the orb dissolves (scale
1 to 0.7, opacity to 0, soft bloom) while the backdrop dissolves into plate 01.
One line only, centred: "Introducing Space by" plus the logo, Plus Jakarta Sans
Medium 84px, ink, -0.02em. Types at HEADLINE_CPS from 1.0s; the logo's dots
assemble over 0.9s while the wordmark blurs in. A very soft radial light behind
the line (white 45 percent, feathered). Holds about 1.8s.

### Scene 3, Chat (0:20 to 0:32), built
The line blurs out over 0.4s; the dark product frame rises from the centre
(scale 0.92 to 1, opacity 0 to 1) over 0.8s; plate 01 crossfades to 02 over
1.5s. Hero, subtitle, input and chips are in by 21.2s; typing starts at 21.8s.
Send at 24.5s (the send button becomes a small SpaceOrb), pills at 24.8, 25.4
and 26.0s, the answer from 26.8s, click on [S1] at 29.45s, the source card open
from 29.5s and held about 2.5s. Workspace name "Northfield". Slow 3.5 percent
push. The state function `chatStateAt` lets Scene 4 open on the same frame.

### Scene 4, Agents and Control Room (0:32 to 0:46), built
TextBeat "Give every agent a job" (on glass). Opens on Scene 3's last frame;
the source card closes in 0.5s. The cursor clicks Agents; the Agents page
(rebuilt from 04-agents.png) shows Iris (Personal assistant, Default). The
camera zooms 1.7x and three agents are created through the "+ New agent" card:
Nora (Intake), Theo (Policy), Owen (Evidence), each "Works with Emily's access".
Zoom out, click Control Room, blur through. The office (SVG rebuild of
02-control-room-office.png, see `src/components/office/Office.tsx`): Iris gets
the claim at the front desk, Nora, Theo and Owen pop in, counters tick to
Agents 4 and Active tasks 1, Iris says "Claim CL-7305 is with the team." in
the chat panel. A dashed path with a travelling dot runs Iris, Nora, Theo,
Owen; each agent links to Gmail, Google Drive and Google Sheets in turn and the
pedestal pulses; status lines change to "Reading claim", "Checking policy",
"Matching evidence". Camera zooms 1.8x on the desks (plates 28.8px), pans along
the path, and is back to the full room before 46s. The last frame is Scene 5's
first frame. The Dashboard cutaway was not used.

## Commands

```bash
npm run dev                                   # Studio
npm run render:video                          # out/space_video.mp4 (the deliverable)
npx remotion render Scene03 out/scenes/scene-03.mp4 --crf=16   # one scene, for debugging
npm run check                                 # all checks
node scripts/stills.mjs Scene01 Scene02       # stills + guard report
python3 -I scripts/check.py                   # guard checks on the report
npx tsx scripts/check-timing.ts               # reading time and timeline
```

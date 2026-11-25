# Space by BotCircuits: explainer design rules

Read this before building or changing any scene. It captures the brief for the
whole video so later sessions follow the same rules. Code paths are relative to
this project (`space-explainer/`).

Video: 1920x1080, 60 fps, 167 s (2:47). Product: **Space by BotCircuits**, an
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
  Slack), unmodified, sources in `public/logos/SOURCES.md` (also used in the
  Scene 1 window headers). They are third party
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

**Product frame** (from Scene 3), `ProductWindow`: a white rounded card (24px
radius, shadow 0 40px 120px rgba(20,24,60,0.18)) sitting on the plate, no dark
frame anywhere, 1728x825 at (96, 128). Product screens are authored at
the screenshots' native size (1875x895) and scaled 0.9216 (`PRODUCT` in
`theme.ts`), which keeps real product proportions: 15px native reads as 14px.

**Light product theme** (`PRODUCT_THEME_LIGHT` in `theme.ts`, mapped to `UI`
in `chat/Sidebar.tsx`; reference `reference/ui/11-playbook-graph.png`). Every
product screen uses it: window and panels #FFFFFF, sidebar #F7F8FC, app
background #F7F8FB, borders #E7E9F2, ink #0D1224, secondary text #5B6478, muted
#8A91A5 (placeholders only), selected nav item #EEF0FA, primary buttons ink
with white text, secondary buttons and chips white with a #E7E9F2 border,
Default chip and highlights soft lilac (#ECE8FF, text #4B34C7), citation
highlight #EDE9FF, input focus ring violet (#7C62F0 at 35 percent); status
green dots stay. Typed text and carets are ink. Text passes 4.5:1.

**UI type scale** (`UI_TYPE_PX`, on-screen px at 1x camera; `UIN` holds the
native values components set): chat input 18, user message 17, assistant answer
18, citation chips 14 (brief: 13, raised to the 14px minimum), source card title
20, source card body 16, sidebar and tabs 14, buttons 14, helper text 14 (brief:
13, raised to the minimum), page titles 22. **No UI text above 22px at 1x, none
under 14px.** Never enlarge UI text to make it readable: use the camera.

**Camera rule.** In UI scenes, focus zooms up to 1.6x are allowed, eased, with
pans to the area being explained, so text meant to be read is at least 20px
effective (current zooms: 1.25 on chat input, answer and source card; 1.18 on
the thread; 1.3 on the creation panel; 1.35 on agent cards; 1.4 on desks; 1.5
along the path). `camAt` with `lin` keys keeps slow drifts moving through holds.
Never a hard cut inside a scene. While zoomed, the product window and the UI
inside it may meet the frame edge (they act as background); overlays stay in
the safe area.

**FeatureTitle** (`FeatureTitle`, replaces TextBeat in UI scenes): the title
appears alone on the plate, centred, Plus Jakarta Sans SemiBold 88px, ink,
-0.03em, max width 1400px, no box. Soft radial light behind it (white 45
percent, feathered). Words blur in (14px to 0, 18px rise, 0.7s, EASE, 90ms
stagger). Hold at least 1.2s after the last word, and the whole title stays up
long enough to read from its first word (1.2s plus 0.25s per word). Exit: words
drift up 24px, blur and fade over 0.5s. The product frame then rises (scale
0.94 to 1, translateY 40 to 0, opacity 0 to 1, 0.9s EASE), starting 0.3s before
the title has left; its opacity eases in later than its move so the title never
shows over UI. About 2.8s in all. Scene 1 keeps its typed top left headlines
(it is not a UI scene).

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

**Agent avatars** (exception to the single orb colour): small `SpaceOrb`s with
no ticks, `palette` from `ORB_PALETTES`, same conic structure with the hue
changed: Iris violet (the lead palette), Nora rose (#D6457A family), Theo teal
(#1FA3A0 family), Owen coral red (#E4572E family), plus a fifth "plum" swatch
for the avatar picker. No grey, green, blue or amber. Used on agent cards, name
plates, the creation panel, the chat panel and output cards; never letter
circles.

**Human glyph** (`HumanGlyph`): amber `#F2A43A` with halo `#FFE2B3`, head circle
and rounded shoulders, 64px, always on a white glass disc. **Amber appears ONLY
where a person decides.**

**Typewriter** (`Typewriter`, `lib/typewriter.ts`): 70ms fade per character,
deterministic jitter of plus or minus 10 percent, 140ms pause on commas, 260ms
on full stops, 2px caret at 70 percent opacity blinking at 1.1 Hz, caret fades
0.3 s after the last character. Lines are given explicitly and laid out in full
(invisibly) before typing, so text never reflows.

**TextBeat** (Scene 1 only): a short headline typed top left inside the safe
area, 56px. Holds 2.5 s, or longer when the ReadabilityGuard needs it.

**Status pill** (`StatusPill`): frosted glass pill, small spinner, 28px label.

**Cursor** (`Cursor`): a black arrow with a 1.5px white outline, moving on
eased, gently curved paths. The click ripple is violet (#7C62F0 at 25 percent), 0.45s, centred on the arrow's
hotspot (the tip). After every click the cursor dwells on the hotspot until its
ripple has finished, so the ripple never trails behind a moving cursor.
`cursorClickReport` checks every frame of every ripple (scripts/check-timing.ts)
and check.py measures ripple and cursor in the stills.

**Guards**
- SafeAreaGuard: nothing within 96px of the edge except backgrounds (and the
  zoomed product frame, which acts as background).
- ReadabilityGuard: the 28px minimum applies to FeatureTitle, overlay pills and
  other overlay text (`data-guard="text"`). Product UI text must be at least 14px
  and at most 22px at 1x, and text meant to be read (`data-guard="uitext"`
  with `data-guard-read="1"`) must reach at least 20px effective after camera
  zoom. Reading time: 1.2s plus 0.25s per word once readable; timings the brief
  fixes shorter are reported as exceptions. Contrast at least 4.5:1 against the
  sampled background. Fix contrast with a glass panel or light, never by
  changing copy.
- assertGaps: no stretch over 0.4 s without motion.
- LogoGuard: logos on white or sampled at 7:1 against the plate, at least 28px.
- Cursor: ripple centred on the hotspot at every click.

How they run: `GuardLayer` (in every scene) measures `data-guard` elements each
frame (on-screen size, CSS size, visible text inside the product frame);
`scripts/stills.mjs` renders a still every 1s plus a text hidden background
pass; `scripts/check.py` checks safe area, sizes, contrast, logo, cursor, copy
rules, green orb pixels and stray amber; `scripts/check-timing.ts` checks
reading time, scene start times and cursor clicks; `scripts/check-video.py`
checks duration, black frames, motion gaps and scene boundaries.

**Motion rules (Remotion).** Everything is derived from `useCurrentFrame` and
`interpolate`: no CSS transitions, CSS animations or state driven motion, and
no pixel rounding of positions. Camera blends that start or stop a follow use
a symmetric smoothstep (zero speed at both ends) so the camera never jumps.

**Meaningful transitions.** Every scene boundary has a cause: a cursor click,
a shared element or a time cue. Plain dissolves are used only for plate changes
tied to time of day. Each boundary is one continuous motion with no blank frame.
- 1 to 2: the lone orb dissolves into the lockup. 2 to 3: the lockup blurs
  out, the FeatureTitle arrives, the window rises.
- 3 to 4: the cursor clicks the chip "Create agents for this claim"; the chat
  sinks away and the Agents page rises under Scene 4's title. 4A to 4B: click
  Control Room.
- 4 to 5: the cursor clicks [S1] in Theo's result card; the chip dissolves
  with its page; the S1 tag appears in the Brain file row 0.5s after the rise.
- 5 to 6: "Use in playbook" on Claims knowledge; the chip dissolves with its
  page and appears inside the Theo node.
- 6 to 7: Save & activate makes the playbook Active; the claim email arrives
  (6:42 PM inside the card) and the run starts.
- 7 to 8: night crossfades to morning, "Next morning", and the Slack
  notification "Claim CL-7305 needs your review" arrives; Scene 8 clicks it.
- 8 to 9: the toast "Approved. View record" is clicked and opens Records.
- 9 to 10: after the replay the cursor clicks Pages in the sidebar.
- 10 to 11: the "Time to prepare" KPI tile is clicked and expands to a white
  frame, which becomes the Before and With Space contrast.
- 11 to 12: the With Space card expands to white; the end card starts white.

**Clean title rule.** From the moment a FeatureTitle starts until the frame
starts rising, only the plate, the glow and the title words are visible: no
chips, cursors, tags, pills or partial UI. Elements belong to their page and
dissolve with it. `scripts/clean-title-test.mjs` samples every 6th frame of
each window in Scenes 4 to 10, renders it as is and with `cleanRef` (every
layer except `data-layer="plate"` and `data-layer="title"` hidden), and fails
on any pixel difference.

**No persistent clock.** No scene shows a clock widget or time ribbon. Times
appear only inside the content they belong to (an email card, a notification,
a record row); elapsed effort is shown as a stopwatch chip.

**No people on screen in Scene 1.** No figures, avatars, initials, silhouettes
or photos; the cursor is the only actor. `data-person` markers fail check.py.

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

- `src/timeline.ts`: authored scene durations; starts and ends are computed,
  so a scene that grows pushes the rest along. Events are written relative to
  their scene. Durations: 15, 5, 18, 40, 14, 19, 10, 17, 16, 6, 7 seconds.
  Starts: Scene 1 0s, 2 15s, 3 20s, 4 38s, 5 78s, 6 92s, 7 111s, 8 121s,
  9 138s, 10 154s, 11 160s (total 167s, 10020 frames).
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

Scene start times (179s, 10,740 frames at 60fps): S1 0:00, S2 0:19, S3 0:24,
S4 0:42, S5 1:22, S6 1:36, S7 1:55, S8 2:06, S9 2:23, S10 2:32, S11 2:44,
S12 2:52.

### Scene 1, One claim, five places (0:00 to 0:19), built
An employee's screen; **no people on screen** (the cursor is the only actor;
names only as plain text inside content). No opening title and never an empty
frame. ProblemBackdrop, light theme, black arrow cursor with a neutral ripple.
Windows (`components/desktop/Desktop.tsx`) are white, 640x420, official logos in
the header (Gmail, Google Drive, Google Sheets, Slack). HUD inside the 96px safe
area: the task card "Prepare claim CL-7305 for review" top left, chips "Open
tabs" and the clock top right.
- 0 to 0.9s HUD in; Gmail opens 0.3 to 1.2s. 1.2 to 4.2s the attachments are
  dragged to Downloads (tabs 2).
- 4.2 to 7.6s Drive: "home policy" typed, three results, the 2026 file opens,
  page 12, Section 4.2 highlighted (tabs 3 to 4). 5.0s "The information is
  everywhere." at 64px.
- 7.6 to 10.2s Sheets: the matching row highlighted (tabs 5, 10:12).
- 10.2 to 12.6s Slack: question typed and sent, typing indicator, badge to 12
  (tabs 8, 11:20).
- 12.6 to 13.6s pull back (tabs 9, 11, 14; 11:48); the Review summary behind.
- 13.6 to 15.2s morph: HUD, line and summary fade first; the windows shrink to
  the centre (0.12, slight rotation), their logos detach and stream in; a violet
  glow gathers; the SpaceOrb grows from scale 0 once the windows are under 30
  percent; tabs tick down to 0 and fade.
- 15.2 to 18.2s chips "Claim read", "Policy checked", "Evidence matched",
  "Review pack drafted" 0.5s apart; "What if agents did the work?" at 15.4s;
  the complete frame holds at least 1.2s.
- 18.2 to 19.0s chips and line fade; the lone orb equals Scene 2's first frame.
The camera keeps every visible window's move under 14px per frame.
**Layers and caption lane.** Scene 1 is two layers. The HUD layer is fixed and
never transformed by the camera: the task card (top left) and the Open tabs and
clock chips (top right) at y 98, and the caption below them, centred at y 205
in 56px (64px for "What if agents did the work?", after the lane is released).
The caption lane runs from y 96 to 236. The STAGE layer (windows, cursor,
Downloads tray, Review summary) is the only layer under the camera; it is
clipped below the lane with a rounded mask feathered over 24px. The camera zoom
is capped at 1.25 and every key is clamped so the cascade's top edge stays at or
below y 266 and its bottom at or above y 1032; the cascade keeps scale 1.0 (window
text 18px at 1x). From 13.6s the clip is released over 0.4s, so the morph, the
orb and the four chips use the full frame. `scripts/check-timing.ts` checks the
stage top edge every frame; `scripts/s1-lane-test.mjs` renders frames without
the HUD against the backdrop alone and fails on any stage pixel in the lane, on
a HUD element outside the safe area, or on a caption within 24px of the card or
chips.

### Scene 2, Intro (0:19 to 0:24), built
First frame equals Scene 1's last. The orb dissolves while the backdrop
dissolves into plate 01. "Introducing Space by" plus the logo, 84px; the logo's
dots assemble over 0.9s. Holds about 1.8s.

### Scene 3, Chat (0:24 to 0:42), built
FeatureTitle (standard) "Ask, or tell it what to do". Connect your apps shows
the official Gmail, Drive, Sheets and Slack logos at 22px. Turn 1: the cited
answer with [S1] [S2]; [S1] opens the source card. Turn 2, an action: "2 changes
made" (Scheduled task; Notification rule with the Slack logo). The chip "Create
agents for this claim" is clicked at 17.5s.

### Scene 4, Agents and Control Room (0:42 to 1:22), built
4A (0 to 10s): the Agents page; the New agent panel creates Nora, Theo and Owen
(no avatar picker: orb colours are assigned automatically).
4B (10 to 40s): the Control Room heroes, walks, thought bubbles and result
cards as before; the cursor clicks [S1] at 39.3s. `scripts/motion-test.mjs`
fails above 14px per frame at 1x outside a hero, or on a duplicate copy.

### Scenes 5 to 10: compact FeatureTitle
Compact titles (about 2.4s, 0.9s hold); Scene 7 uses the onDark variant.

### Scene 5, Brain (1:22 to 1:36), built
"Ground it in your own sources". The S1 tag appears in the file row 0.5s after
the rise. Connect data tiles, sources added in turn, Claims knowledge with its
Graph view; "Use in playbook" clicked.

### Scene 6, Playbook graph (1:36 to 1:55), built
"Define the process once". The playbook graph: trigger, ASK, AGENT Nora, AGENT
Theo (the Claims knowledge chip inside the node), AGENT Owen, PAGE, REVIEW with
Emily Carter (amber), branches; Check, then Save & activate.

### Scene 7, Run and wait (1:55 to 2:06), built
onDark "Let it run on its own"; no clock, no ribbon. 2.4 to 4.2s the email card
"New claim CL-7305, kitchen water damage" (6:42 PM inside it). 4.2 to 7.4s the
stopwatch chip in the playbook header counts "Run time 0:00" to 2:04 as Ask,
Nora, Theo, Owen and Page light (orbs pulse), then "Prepared in 2 min 4 s" with
a tick; REVIEW pulses amber, "Waiting for Emily". 7.4 to 9.0s "Waiting for a
person..." while dusk turns to night. 9.0 to 11.0s crossfade to morning, the
"Next morning" pill with a sun, the Slack notification (9:05 AM inside it).

### Scene 8, Morning review (2:06 to 2:23), built
The notification is clicked and opens Reviews under the title; the review;
the toast "Approved. View record", clicked at 16.2s.

### Scene 9, Records (2:23 to 2:32), built
"Every step on record". Rows from "Claim email received 6:42 PM" to "Slack
notified 9:12"; the approved row carries the note and the amber glyph. Replay
highlights each row, the approved row held 1.2s; the cursor clicks Pages.

### Scene 10, Pages and dashboards (2:32 to 2:44), built
"Build the views you need". A page from a prompt: table and bars, the claim row
pushes the rows below it down. A second prompt, "A weekly claims dashboard:
volume, time to prepare, and flags": KPI tiles (38, 2 min, 5, 7), a line chart,
"Flags by type". Zoom 1.4x while reading, out before the click. Pill "Pages and
dashboards on live data". The "Time to prepare" tile is clicked.

### Scene 11, Same claim, minutes not hours (2:44 to 2:52), built
The tile expands to white; "Same claim. Prepared in minutes." (64px). Before
(muted): ghost windows, "5 tools", "14 tabs", a stopwatch to "2 h 44 min". With
Space: the Review pack card ticks, "1 place", "0 tabs", a stopwatch to "2 min 4
s" with a tick, "Ready for review". Footnote "Illustrative example, placeholder
data." 20px #8A91A5. No amber. The last 1.2s expands the right card to white.

### Scene 12, End card (2:52 to 2:59), built
Starts from Scene 11's white frame: the three lines, the amber underline under
"People decide." with the glyph, then "Space by" with the logo assembling.

## Commands

```bash
npm run dev                                   # Studio
npm run render:video                          # out/space_video.mp4 (the deliverable)
npx remotion render Scene03 out/scenes/scene-03.mp4 --crf=16   # one scene, for debugging
npm run check                                 # all checks
node scripts/stills.mjs Scene01 Scene02       # stills + guard report
python3 -I scripts/check.py                   # guard checks on the report
npx tsx scripts/check-timing.ts               # reading time and timeline
node scripts/motion-test.mjs 10 40            # Scene 4B motion test, every frame
node scripts/clean-title-test.mjs             # clean title rule, Scenes 4 to 10
node scripts/s1-lane-test.mjs                 # Scene 1 caption lane and HUD
STILL_STEP=0.5 node scripts/stills.mjs Scene01  # stills every 0.5s
```

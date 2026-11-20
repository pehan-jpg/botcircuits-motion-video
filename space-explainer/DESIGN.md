# Space by BotCircuits: explainer design rules

Read this before building or changing any scene. It captures the brief for the
whole video so later sessions follow the same rules. Code paths are relative to
this project (`space-explainer/`).

Video: 1920x1080, 60 fps, 122 s (2:02). Product: **Space by BotCircuits**, an
agent workspace where agents prepare and people decide.

## 0. Assets and rules

- Logo: `public/logo.png` (supplied PNG, black on transparent). Use exactly as
  supplied. Never redraw or recolour it. If it is missing, stop and ask.
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

## 1. Design system (`src/theme.ts`)

| Token | Value |
| --- | --- |
| Ink | `#0D1224` |
| Muted ink | Ink at 60 percent |
| Fonts | Plus Jakarta Sans, JetBrains Mono |
| EASE | `cubic-bezier(0.22, 1, 0.36, 1)`; `EASE_SETTLE` overshoots at most 4 percent |
| Typing | `HEADLINE_CPS` 20, `CHAT_CPS` 32, `REPLAY_CPS` 70 |

Backgrounds by scene: Scene 1 flat pale grey `#EEF0F3`, no plate (the problem
is colourless on purpose). Scenes 2 to 9 photographic plates. Scene 10 neutral
pale `#F4F6F8`. Scene 11 pure white.

**Product frame** (from Scene 3), `ProductFrame` and `Camera`: dark app window,
24px radius, soft shadow, about 1500px wide, floating on the background. Camera
moves are slow, at most 6 percent scale (clamped in `Camera`), never a hard cut
inside a scene.

**Agent orbs** (`AgentOrb`): must not look like the Concierge video and must
never be green. Ringed orb, core radial gradient `#8CC8FF`, `#3B6FE0`,
`#1B2A6B`. A 2px halo ring at 60 percent opacity with soft glow, and one 10px
satellite dot orbiting every 6 s. The lead "Space" orb is 1.3x with a double
ring. Specialist orbs use the same form with a hue shift of at most 25 degrees
(clamped; current shifts: Nora -14, Theo +12, Owen +24, all away from green).
SVG, deterministic by frame. `nightGlow` adds a soft outer glow on the night
grade. `timeOffset` keeps the satellite continuous when an orb is carried across
a scene boundary.

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
`data-guard="box"`.

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
- `src/scenes/SceneNN*.tsx`, one per scene. Scenes 3 to 11 render
  `ScenePlaceholder` until built.
- `Preview` stitches all scenes; `Scene01` to `Scene11` render alone.

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
Claim card lands in the Inbox, hops to Sheet, Chat and PDF, leaving a dashed
stray copy (v1, v2, v2 final, v3) at each hop. Headline "Work moves between
people, tools and inboxes." Chips one at a time: "Who has it now?", "Who
approved it?", "Which version is right?". The card morphs into a lone,
colourless orb; "Sent" and "Paid" stamp themselves; a dashed empty slot shows
where a person would be (grey, no amber). Headline "AI can do the work. But who
checks it?". Strays and slot fade; "No record of who decided." then "No one
deciding." The orb moves to centre for Scene 2.

### Scene 2, Intro (0:15 to 0:20), built
Flat grey dissolves into plate 01 over 1 s as colour returns. The orb becomes
the lead Space orb (double ring) and rises; Nora, Theo and Owen settle around
it. "Introducing", then "Space by BotCircuits" typed large, the tagline under it,
and the logo small on a white pill, all on a glass panel. The title group is
still on screen at 20.0 s (`intro_handoff`): Scene 3 should open by morphing it
(for example, the headline shrinking into an input pill).

## Commands

```bash
npm run dev                                   # Studio
npx remotion render Scene01 out/scene-01.mp4 --crf=16
npx remotion render Preview out/preview.mp4 --crf=16
node scripts/stills.mjs Scene01 Scene02       # stills + guard report
python3 -I scripts/check.py                   # guard checks on the report
npx tsx scripts/check-timing.ts               # reading time and timeline
```

// ---------------------------------------------------------------------------
// Global timing (60 fps, 1920x1080). Every timing goes through sec(n).
// Scenes 1-3 were storyboarded in 30 fps frames; those numbers are kept
// verbatim and converted with f30(n) = sec(n / 30), so their real durations
// (and their look) are unchanged.
//
// Nominal scene boundaries (what the storyboard talks about):
//   Scene 1: 0   - 120  (4 s)
//   Scene 2: 120 - 270  (5 s)
//   Scene 3: 270 - 480  (7 s)
//
// Backgrounds cross-dissolve over TRANSITION_FRAMES centred on each boundary,
// so every <TransitionSeries.Sequence> is padded by half a transition on each
// side that touches another scene. Sum of durations minus overlaps = 480.
// ---------------------------------------------------------------------------
export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Seconds -> frames at the project frame rate. */
export const sec = (n: number): number => Math.round(n * FPS);
/** A storyboard frame number authored at 30 fps (scenes 1-3) -> frames. */
export const f30 = (n: number): number => sec(n / 30);

export const TRANSITION_FRAMES = sec(0.4); // 12 storyboard frames
const HALF = TRANSITION_FRAMES / 2;

/** Nominal (storyboard) scene windows in absolute frames. */
export const SCENE_BOUNDS = {
  scene01: {start: sec(0), end: sec(4)},
  scene02: {start: sec(4), end: sec(9)},
  scene03: {start: sec(9), end: sec(16)},
} as const;

/**
 * Durations of each <TransitionSeries.Sequence>. Use these when inserting
 * morph transitions later. Scene 3 is padded only at its head; when scene 4 is
 * appended with a transition, add HALF to scene03 so the boundary stays at 480.
 */
export const SCENE_DURATIONS = {
  scene01: sec(4) + HALF, // 4.2 s
  scene02: sec(5) + 2 * HALF, // 5.4 s
  scene03: sec(7) + HALF, // 7.2 s
} as const;

/** Absolute frame at which each sequence starts inside the TransitionSeries. */
export const SEQUENCE_STARTS = {
  scene01: 0,
  scene02: SCENE_DURATIONS.scene01 - TRANSITION_FRAMES, // 114
  scene03:
    SCENE_DURATIONS.scene01 + SCENE_DURATIONS.scene02 - 2 * TRANSITION_FRAMES, // 264
} as const;

export const PROBLEM_SEQUENCE_DURATION =
  SCENE_DURATIONS.scene01 +
  SCENE_DURATIONS.scene02 +
  SCENE_DURATIONS.scene03 -
  2 * TRANSITION_FRAMES; // 16 s

// ---------------------------------------------------------------------------
// Key beats (absolute frames; storyboard numbers at 30 fps via f30)
// ---------------------------------------------------------------------------
export const BEATS = {
  // Scene 1
  windowIn: f30(0), // 0-14 window fades + rises 24px
  mayaTyping: f30(14), // 14-34 typing dots
  mayaMorph: f30(34), // 34-44 dots -> bubble
  mayaWords: f30(44), // 44-64 words, 2 frames apart
  mayaTime: f30(56), // 9:02 AM
  mayaDelivered: f30(64), // "Delivered"
  mayaCheck: f30(66), // check stroke, 10 frames
  dimStart: f30(108), // last 12 frames of scene 1: -6% brightness
  // Scene 2
  agentTyping: f30(122),
  agentMorph: f30(130),
  agentWords: f30(138),
  seen: f30(144), // Delivered -> Seen
  silence: f30(164), // away, timeline, clock, gap growth
  away: f30(164),
  clockSwaps: [f30(164), f30(208), f30(238), f30(256)], // 9:02, 9:14, 9:41, 10:05 (accelerating)
  // Scene 3
  followUps: [f30(290), f30(330), f30(370)], // scene-3 local 20, 60, 100
  compress: f30(430), // scene-3 local 160: stack -> pill
  settle: f30(470), // last 10 frames held still
} as const;

export const CLOCK_TIMES = ['9:02 AM', '9:14 AM', '9:41 AM', '10:05 AM'] as const;

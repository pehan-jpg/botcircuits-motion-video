// ---------------------------------------------------------------------------
// Global timing for the problem sequence (30 fps, 1920x1080).
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
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const TRANSITION_FRAMES = 12;
const HALF = TRANSITION_FRAMES / 2;

/** Nominal (storyboard) scene windows in absolute frames. */
export const SCENE_BOUNDS = {
  scene01: {start: 0, end: 120},
  scene02: {start: 120, end: 270},
  scene03: {start: 270, end: 480},
} as const;

/**
 * Durations of each <TransitionSeries.Sequence>. Use these when inserting
 * morph transitions later. Scene 3 is padded only at its head; when scene 4 is
 * appended with a transition, add HALF to scene03 so the boundary stays at 480.
 */
export const SCENE_DURATIONS = {
  scene01: 120 + HALF, // 126
  scene02: 150 + 2 * HALF, // 162
  scene03: 210 + HALF, // 216
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
  2 * TRANSITION_FRAMES; // 480

// ---------------------------------------------------------------------------
// Key beats (absolute frames)
// ---------------------------------------------------------------------------
export const BEATS = {
  // Scene 1
  windowIn: 0, // 0-14 window fades + rises 24px
  mayaTyping: 14, // 14-34 typing dots
  mayaMorph: 34, // 34-44 dots -> bubble
  mayaWords: 44, // 44-64 words, 2 frames apart
  mayaTime: 56, // 9:02 AM
  mayaDelivered: 64, // "Delivered"
  mayaCheck: 66, // check stroke, 10 frames
  dimStart: 108, // last 12 frames of scene 1: -6% brightness
  // Scene 2
  agentTyping: 122,
  agentMorph: 130,
  agentWords: 138,
  seen: 144, // Delivered -> Seen
  silence: 164, // away, timeline, clock, gap growth
  away: 164,
  clockSwaps: [164, 208, 238, 256], // 9:02, 9:14, 9:41, 10:05 (accelerating)
  // Scene 3
  followUps: [290, 330, 370], // scene-3 local 20, 60, 100
  compress: 430, // scene-3 local 160: stack -> pill
  settle: 470, // last 10 frames held still
} as const;

export const CLOCK_TIMES = ['9:02 AM', '9:14 AM', '9:41 AM', '10:05 AM'] as const;

/**
 * Optimize scene timing, in seconds. Retime the animation by editing only
 * this object; every frame number in the scene is derived from it.
 *
 * Optimize runs 10 seconds, so its length lives here rather than in config.ts.
 */
export const OPTIMIZE_DURATION_SECONDS = 10;

export const OPTIMIZE_TIMELINE = {
  /* Part 1: insights */
  topicsIn: {start: 0.0, end: 0.5},
  /** Bubbles appear largest first. */
  bubblesIn: {start: 0.5, stagger: 0.12, duration: 0.3},
  /** Refunds bubble turns amber. */
  refundsAlert: {start: 1.6, duration: 0.4},
  /** Alert card rises in; its five blocks follow top down. */
  alertIn: {start: 2.2, duration: 0.4, blocksStart: 2.3, blockStagger: 0.1, blockDuration: 0.3},
  /** Line from the Refunds bubble to the alert card. */
  alertLine: {start: 2.6, duration: 0.4},
  /** Apply suggestion presses: to #333 and back. */
  applyPress: {start: 3.2, down: 0.1, up: 0.2},

  /* Part 2: fix */
  veilToProcedure: {start: 3.6, duration: 0.45},
  rows: {start: 4.2, stagger: 0.15, enter: 0.3},
  /** Fourth row typing, fitted to end at `typeEnd`. */
  newRow: {typeDelay: 0.08, typeEnd: 5.25, tintFade: 0.3, chipFade: 0.2},
  /** Header chip Draft to Saved, when typing ends. */
  savedSwap: 0.2,

  /* Part 3: test */
  veilToBoard: {start: 5.4, duration: 0.5},
  /** Board fades in with a 12px rise as the veil falls away. */
  boardIn: {start: 5.65, duration: 0.5},
  trafficBar: {start: 5.9, duration: 0.4},
  panels: {start: 5.9, stagger: 0.1, duration: 0.3},
  /** Percentages roll and bars fill together. */
  results: {start: 6.4, duration: 1.2},
  winner: {start: 7.8, duration: 0.4},
  /** Split moves to 100 / 0; header text crossfades. */
  rollout: {start: 8.4, duration: 0.5, labelFade: 0.15, pill: 0.4, tickDelay: 0.15},

  /** Peak veil opacity (both dissolves span large areas, as in Publish). */
  veilPeak: 0.45,
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 9.5, end: 10.0},
} as const;

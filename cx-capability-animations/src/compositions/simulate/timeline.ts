/**
 * Simulate scene timing, in seconds. Retime the animation by editing only
 * this object; every frame number in the scene is derived from it.
 */
export const SIMULATE_TIMELINE = {
  /** Card fades in with a 12px rise. */
  cardIn: {start: 0.0, end: 0.5},
  /** Rows appear one after another with an 8px rise and fade. */
  rowsIn: {start: 0.3, stagger: 0.08, duration: 0.28},
  /** First runs. Each test: spinner, then its result. */
  runs: [
    {test: 0, start: 0.9, spinner: 0.25, outcome: 'pass'},
    {test: 1, start: 1.3, spinner: 0.25, outcome: 'pass'},
    {test: 2, start: 1.7, spinner: 0.25, outcome: 'pass'},
    {test: 3, start: 2.1, spinner: 0.25, outcome: 'fail'},
    {test: 4, start: 2.55, spinner: 0.25, outcome: 'pass'},
  ],
  /** Passed pill fade in after a pass; also the tick draw time. */
  passPill: 0.15,
  /** Counter roll after each pass. */
  counterRoll: 0.4,
  /** Failed treatment: rose fade, reason line and row growth. */
  failReveal: 0.25,
  /** Failed row grows further; divider and label fade in. */
  fixOpen: {start: 3.5, end: 3.7},
  /** Fix step: tag fades in first, then the text types. */
  fixTag: {start: 3.7, duration: 0.15},
  fixTypeStart: 3.78,
  fixCps: 70,
  /** Highlight holds this long after typing ends, then fades. */
  highlightHold: 0.3,
  /** Test 4 reruns. */
  rerun: {
    start: 4.9,
    /** Failed state crossfades to the spinner. */
    toSpinner: 0.1,
    spinner: 0.3,
    /** Row shrinks back; rose, reason and fix fade out. */
    shrink: 0.3,
    /** Counter rolls 80 to 100. */
    counterRoll: 0.5,
  },
  /** All passed: counter highlight and label change. */
  complete: {highlight: 0.3, label: 0.15},
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 7.5, end: 8.0},
} as const;

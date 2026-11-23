/**
 * Monitor scene timing, in seconds. Retime the animation by editing only
 * this object; every frame number in the scene is derived from it.
 *
 * Monitor runs 10 seconds, so its length lives here rather than in config.ts.
 */
export const MONITOR_DURATION_SECONDS = 10;

export const MONITOR_TIMELINE = {
  /** Left card fades in with a 12px rise. */
  leftIn: {start: 0.0, end: 0.5},
  /** Rows appear one after another; durations tick from each row's arrival. */
  rowsIn: {start: 0.5, stagger: 0.09, duration: 0.3},
  /** Counter rolls 6, 12, 18, 24 while the list drifts up. */
  counterRoll: {start: 1.3, step: 0.3},
  listDrift: {start: 1.3, end: 2.2, distance: 36, backStart: 2.2, backEnd: 2.5},
  /** Row 1 needs attention. */
  attention: {start: 2.2, snippetFade: 0.15, highlight: 0.3, pillStart: 2.35, pillFade: 0.25},
  /** Right card fades in with a 12px rise. */
  rightIn: {start: 2.8, end: 3.3},
  /** Transcript, top down. */
  customer1: {start: 3.5, cps: 45},
  agentOrb: {start: 4.1, duration: 0.15},
  traces: {start: 4.2, stagger: 0.2, duration: 0.25},
  /** Agent reply typing is fitted to its window. */
  agentReply: {start: 4.8, end: 5.3},
  customer2: {start: 5.3, end: 5.5},
  notice: {start: 5.45, duration: 0.2},
  /** Take over. */
  takeOver: {start: 5.5, duration: 0.3, press: 5.95, pressDuration: 0.1, doneDuration: 0.2},
  /** Header badge and row 1 badge change together. */
  statusSwap: {duration: 0.25},
  /** Context card rises in; chips follow one after another. */
  contextCard: {start: 6.2, duration: 0.3, chipsStart: 6.55, chipStagger: 0.1, chipDuration: 0.2},
  /** Daniel's reply, fitted to its window. */
  danielReply: {start: 7.4, end: 8.8},
  /** Transcript items rise this long as they arrive. */
  itemIn: 0.25,
  /** Auto scroll easing when a new item pushes the transcript up. */
  scrollEase: 0.5,
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 9.5, end: 10.0},
} as const;

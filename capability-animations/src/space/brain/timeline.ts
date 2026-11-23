/**
 * SpaceBrain timing, in seconds. Retime the animation by editing only this
 * object; every frame number in the scene is derived from it.
 *
 * SpaceBrain runs 12 seconds, so its length lives here.
 */
export const SPACE_BRAIN_DURATION_SECONDS = 12;

export const SPACE_BRAIN_TIMELINE = {
  /** Sources card fades in with a 12px rise. */
  sourcesIn: {start: 0.0, end: 0.5},
  /** Six rows, 0.15s apart; rows 1 to 5 show a spinner as they arrive. */
  rowsIn: {start: 0.5, stagger: 0.15, duration: 0.3},
  /** Item counter rolls up while the sources index. */
  counter: {start: 0.8, end: 2.4},
  ticks: [1.3, 1.5, 1.7, 1.9, 2.1],
  tickFade: 0.15,
  /** Answer card fades in (header and reserved layout only). */
  answerIn: {start: 2.6, end: 3.1},
  /** Question types at about 28 characters per second. */
  question: {start: 3.1, cps: 28},
  /** Search: lines from rows 1 to 3 draw, those rows outline, the orb appears. */
  search: {start: 4.35, lines: 0.4, outline: 0.25, orbStart: 4.45, orbEnd: 4.8},
  /** Answer typing, fitted to its window (about 45 characters per second). */
  answer: {start: 4.8, end: 7.0},
  /** Lines and outlines fade out as the answer finishes. */
  searchOut: {start: 6.7, duration: 0.3},
  /** Citation chips fade in one after another. */
  chipsIn: {start: 7.0, stagger: 0.1, duration: 0.2},
  /** Each chip activates, then its preview opens and its highlight draws. */
  reveals: [
    {chip: 7.4, preview: 7.7, highlight: 7.95, highlightDuration: 0.4},
    {chip: 8.3, preview: 8.6, highlight: 8.8, highlightDuration: 0.3},
    {chip: 9.2, preview: 9.5, highlight: 9.7, highlightDuration: 0.3},
  ],
  chipActivate: 0.2,
  previewIn: 0.4,
  /** "Text read from image" chip on the third preview. */
  textReadChip: {start: 10.0, duration: 0.2},
  /** Permission footer chip. */
  footer: {start: 10.3, end: 10.7},
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 11.5, end: 12.0},
} as const;

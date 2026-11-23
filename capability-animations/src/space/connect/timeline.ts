/**
 * SpaceConnect timing, in seconds. Retime the animation by editing only
 * this object; every frame number in the scene is derived from it.
 *
 * SpaceConnect runs 12 seconds, so its length lives here.
 */
export const SPACE_CONNECT_DURATION_SECONDS = 12;

export const SPACE_CONNECT_TIMELINE = {
  /* Part 1: connections */
  spaceIn: {start: 0.0, end: 0.5},
  tilesIn: {start: 0.5, stagger: 0.12, duration: 0.3},
  /** Each connection: line, spinner, then Connected. */
  connect: {start: 1.3, stagger: 0.3, line: 0.3, spinner: 0.25, connected: 0.2, countFade: 0.15},
  tools: {start: 3.0, stagger: 0.15, duration: 0.3},
  accessIn: {start: 3.8, end: 4.4},

  /* Veil between the parts */
  veil: {start: 4.4, duration: 0.45, peak: 0.45},

  /* Part 2: privacy */
  recordIn: {start: 5.0, end: 5.5},
  maskPillIn: {start: 5.3, end: 5.6},
  modelIn: {start: 5.5, end: 6.0},
  lines: {start: 5.7, duration: 0.3, secondDelay: 0.1},
  /** Each row masks in turn; its dot then travels to the Model card. */
  mask: {start: 6.1, stagger: 0.5, fade: 0.2},
  /** Dot travel time: arrives as the Model card row appears. */
  dotTravel: 0.9,
  dotFade: 0.08,
  modelRows: {start: 7.0, stagger: 0.5, duration: 0.3},
  summary: {start: 8.8, end: 9.3},
  audit: {start: 9.4, end: 10.1},

  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 11.5, end: 12.0},
} as const;

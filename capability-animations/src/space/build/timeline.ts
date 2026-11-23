/**
 * SpaceBuild timing, in seconds. Retime the animation by editing only this
 * object; every frame number in the scene is derived from it.
 *
 * SpaceBuild runs 10 seconds, so its length lives here.
 */
export const SPACE_BUILD_DURATION_SECONDS = 10;

export const SPACE_BUILD_TIMELINE = {
  /** Playbook card fades in with a 12px rise. */
  playbookIn: {start: 0.0, end: 0.5},
  /** Rows: number and tag first, then the text types. */
  rows: {start: 0.5, stagger: 0.3, enter: 0.3, typeDelay: 0.12, cps: 40},
  /** Variables card and its rows. */
  variablesIn: {start: 2.4, duration: 0.5},
  variableRows: {start: 2.6, stagger: 0.15, duration: 0.3},
  /** Checks card. */
  checksIn: {start: 3.4, end: 4.0},
  /** Check rows appear, spin for 0.3s, then tick. */
  checkRows: {appear: [4.0, 4.25, 4.5], ticks: [4.45, 4.7, 4.95], spinner: 0.3, fade: 0.25},
  /** Run test presses: to #333 and back. */
  runPress: {start: 5.0, down: 0.1, up: 0.2},
  /** Test run windows per row (start, end); row 4.1 is the review pause. */
  run: [
    [5.4, 5.8],
    [5.8, 6.2],
    [6.2, 6.7],
    [6.7, 7.0],
    [7.0, 7.6],
    [7.6, 8.0],
  ],
  /** Highlight fade and move duration. */
  highlightFade: 0.15,
  tickFade: 0.15,
  /** Result. */
  ready: {start: 8.0, duration: 0.25},
  testPassed: {start: 8.0, duration: 0.4},
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 9.5, end: 10.0},
} as const;

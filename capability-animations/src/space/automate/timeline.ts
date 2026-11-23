/**
 * SpaceAutomate timing, in seconds. Retime the animation by editing only
 * this object; every frame number in the scene is derived from it.
 *
 * SpaceAutomate runs 10 seconds, so its length lives here.
 */
export const SPACE_AUTOMATE_DURATION_SECONDS = 10;

export const SPACE_AUTOMATE_TIMELINE = {
  /** Triggers card and its rows. */
  triggersIn: {start: 0.0, end: 0.5},
  triggerRows: {start: 0.4, stagger: 0.15, duration: 0.35},
  /** Table row added fires: outline, event chip slides right, line draws. */
  fire: {outline: 1.2, outlineDuration: 0.25, chipIn: 1.2, chipFade: 0.15, chipMove: {start: 1.35, duration: 0.4}, chipOut: 2.3},
  line: {start: 1.5, end: 1.9},
  /** Control Room card. */
  controlIn: {start: 1.7, end: 2.3},
  /** Run rows 1 to 4: [appear, tick]; each spins for 0.3s first. */
  steps: [
    [2.3, 2.6],
    [2.7, 3.0],
    [3.1, 3.4],
    [3.6, 3.9],
  ],
  rowIn: 0.25,
  tickFade: 0.15,
  /** Row 5 waits for review. */
  review: {appear: 3.9, chipFade: 0.2},
  /** Waiting: header status, rolling elapsed counter. */
  waiting: {start: 4.0, statusFade: 0.2, counterEnd: 5.6, minutes: 200},
  /** Restart notice slides in, pushing later rows down. */
  notice: {start: 4.8, end: 5.3},
  /** Approval arrives: chip to tick, time to 13:24, status back to Running. */
  resume: {start: 5.6, duration: 0.2},
  /** Row 7 with one retry. */
  pay: {appear: 6.1, retryIn: 6.5, retryOut: 7.2, chipFade: 0.2},
  /** Completed. */
  completed: {start: 7.5, statusFade: 0.25, pill: 0.4},
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 9.5, end: 10.0},
} as const;

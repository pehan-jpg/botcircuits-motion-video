/**
 * Integrate scene timing, in seconds. Retime the animation by editing only
 * this object; every frame number in the scene is derived from it.
 */
export const INTEGRATE_TIMELINE = {
  /** Agent card fades in with a 12px rise. */
  agentIn: {start: 0.0, end: 0.5},
  /** Tiles appear one after another with a 12px rise and fade. */
  tilesIn: {start: 0.5, stagger: 0.15, duration: 0.3},
  /** Connections run tile 1 to tile 4. */
  connect: {
    start: 1.1,
    stagger: 0.3,
    /** Line draws from the agent card to the tile. */
    line: 0.35,
    /** Pill shows the spinner. */
    spinner: 0.25,
    /** Spinner changes to Connected. */
    connected: 0.2,
    /** Agent counter crossfade when a tile connects. */
    counterFade: 0.15,
  },
  /** First action: update the booking. */
  action1: {
    chipIn: {start: 3.3, end: 3.6},
    pulse: {start: 3.6, duration: 0.6},
    result: {start: 4.3, duration: 0.25},
    chipOut: {start: 5.0, end: 5.2},
  },
  /** Second action: collect the payment. */
  action2: {
    chipIn: {start: 5.2, end: 5.5},
    pulse: {start: 5.5, duration: 0.6},
    result: {start: 6.2, duration: 0.25},
    chipOut: {start: 6.9, end: 7.1},
  },
  /** Pulse dot fades in and out at the ends of its run. */
  pulseFade: 0.1,
  /** Result highlight holds this long after the crossfade, then fades. */
  highlightHold: 0.8,
  highlightFade: 0.3,
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 7.4, end: 8.0},
} as const;

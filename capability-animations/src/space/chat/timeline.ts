/**
 * SpaceChat timing, in seconds. Retime the animation by editing only this
 * object; every frame number in the scene is derived from it.
 */
export const SPACE_CHAT_TIMELINE = {
  /** Composer fades in at centre with a 12px rise. */
  composerIn: {start: 0.0, end: 0.4},
  /** Prompt types at about 26 characters per second. */
  prompt: {start: 0.4, cps: 26, placeholderFade: 0.1},
  /** Send presses: to #333 and back. */
  send: {start: 1.6, down: 0.1, up: 0.2},
  /** Composer text becomes the user bubble; a new composer fades in below. */
  morph: {start: 1.9, end: 2.5},
  /** Reply row: orb first, then text. */
  reply: {orb: 2.5, text: 2.65, duration: 0.25},
  /** Plan card build. */
  plan: {
    card: {start: 2.9, end: 3.2},
    startNode: 3.0,
    inLines: {start: 3.1, duration: 0.3},
    agents: [3.2, 3.3, 3.4],
    ticks: [3.9, 4.15, 4.4],
    tickFade: 0.15,
    outLine: 0.3,
    result: 4.4,
    fade: 0.25,
  },
  /** Plan card dissolves into the result card. */
  veil: {start: 4.8, duration: 0.45},
  replyLabelFade: 0.15,
  /** Result card contents. */
  result: {header: 5.3, rowsStart: 5.5, stagger: 0.2, duration: 0.3, buttons: 6.1, buttonsDuration: 0.4},
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 7.5, end: 8.0},
} as const;

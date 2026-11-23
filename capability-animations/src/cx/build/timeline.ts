/**
 * Build scene timing, in seconds. Retime the animation by editing only this
 * object; every frame number in the scene is derived from it.
 */
export const BUILD_TIMELINE = {
  /** Empty prompt pill fades in with a 12px rise; caret blinks at 1Hz. */
  promptIn: {start: 0.0, end: 0.5},
  /** Prompt types. Speed is fitted to this window (about 32 characters per second). */
  promptTyping: {start: 0.5, end: 2.1},
  /** Send button turns lime, then holds. */
  send: {start: 2.1, end: 2.4},
  /** Veil: prompt pill dissolves into the procedure card. */
  veilToProcedure: {start: 2.4, end: 2.8},
  /** Procedure rows type in. */
  rows: {start: 2.8, end: 4.55},
  /** Delay between consecutive rows starting. */
  rowStagger: 0.22,
  /** Row typing speed in characters per second. */
  rowCps: 70,
  /** Seconds each row takes to enter, and the card takes to grow for it. */
  rowEnter: 0.3,
  /** Guardrails chip fades in under the card. */
  guardrails: {start: 4.55, end: 4.85},
  /** Hold on the full procedure. */
  holdProcedure: {start: 4.85, end: 5.45},
  /** Veil: procedure card dissolves into the agent card. */
  veilToAgent: {start: 5.45, end: 5.95},
  /** Agent card settles into place. */
  agentSettle: {start: 5.95, end: 6.3},
  /** Agent ready pill appears and its tick draws on. */
  ready: {start: 6.3, end: 6.7},
  /** Hold on the finished agent. */
  holdAgent: {start: 6.7, end: 7.5},
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 7.5, end: 8.0},
  /** Seconds a typing highlight holds after the next word starts. */
  highlightHold: 0.3,
} as const;

/**
 * SpaceAgents timing, in seconds. Retime the animation by editing only this
 * object; every frame number in the scene is derived from it.
 *
 * SpaceAgents runs 10 seconds, so its length lives here.
 */
export const SPACE_AGENTS_DURATION_SECONDS = 10;

export const SPACE_AGENTS_TIMELINE = {
  /** Start node fades in with a 12px rise. */
  startIn: {start: 0.0, end: 0.5},
  /** Lines from the start node, then the three agents (orb first, then text). */
  startLines: {start: 0.5, duration: 0.3},
  agentsIn: {start: 0.6, stagger: 0.12, duration: 0.3, textDelay: 0.1},
  /** Agent lines to the approval node, the node, then the payout line and agent. */
  approvalLines: {start: 1.5, duration: 0.3},
  approvalIn: {start: 1.6, duration: 0.3},
  payoutLine: {start: 1.8, duration: 0.3},
  payoutIn: {start: 1.9, duration: 0.3, dimmed: 0.5},
  /** Agents at work. */
  dotsToAgents: {start: 2.4, end: 2.8},
  spinners: 2.6,
  ticks: [3.2, 3.5, 3.8],
  tickFade: 0.15,
  /** Results flow to the approval node, which pulses once. */
  dotsToApproval: {start: 3.8, duration: 0.4},
  approvalPulse: {start: 4.1, duration: 0.3},
  /** Graph slides left as the detail card appears; Policy agent selected. */
  slide: {start: 4.4, duration: 0.6},
  selected: {start: 4.4, duration: 0.3},
  /** Detail card build. */
  detail: {header: 5.0, itemsStart: 5.15, stagger: 0.12, duration: 0.25, noteGap: 0.15},
  /** Approval and payout. */
  approve: {start: 6.4, duration: 0.3, labelFade: 0.15},
  dotToPayout: {start: 6.5, duration: 0.4},
  payoutActive: {start: 6.7, duration: 0.3},
  payoutSpinner: 7.0,
  payoutTick: 7.6,
  /** Claim settled pill. */
  settled: {start: 7.8, duration: 0.4},
  /** Dots fade in and out at the ends of their run. */
  dotFade: 0.08,
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 9.5, end: 10.0},
} as const;

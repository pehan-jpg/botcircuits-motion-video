/**
 * Publish scene timing, in seconds. Retime the animation by editing only
 * this object; every frame number in the scene is derived from it.
 *
 * Publish runs 12 seconds, unlike the 8 second compositions, so its length
 * lives here rather than in config.ts.
 */
export const PUBLISH_DURATION_SECONDS = 12;

export const PUBLISH_TIMELINE = {
  /* Part 1: going live */
  /** Agent card fades in with a 12px rise. */
  agentIn: {start: 0.0, end: 0.5},
  /** Eight channel rows appear one after another. */
  rowsIn: {start: 0.5, stagger: 0.08, duration: 0.3},
  /** Publish button: press, then becomes the Published pill. */
  publish: {press: 1.3, pressDuration: 0.1, doneDuration: 0.2},
  /** Channels go live in row order. */
  live: {start: 1.7, stagger: 0.2, line: 0.3, pill: 0.2, counterFade: 0.15},

  /* Transition */
  transition: {
    start: 4.0,
    /** Pale lime veil dissolve, as in Build. */
    veil: 0.45,
    /** Peak veil opacity. Paler than Build's 0.8 because it spans the whole scene. */
    veilPeak: 0.45,
    /** Agent card, lines and unused rows fade and drift left. */
    outgoing: 0.4,
    drift: 12,
    /** The three kept rows morph into mockup cards. */
    morph: {start: 4.2, duration: 0.7},
    /** Card bodies fade in over the last part of the morph. */
    body: 0.3,
  },

  /* Part 2: one customer, three channels */
  /** Context bar drops in, then its lines draw down. */
  contextBar: {start: 4.9, duration: 0.3, drop: 12},
  contextLines: {start: 5.1, duration: 0.3},
  timeLabels: {start: 5.1, duration: 0.3},
  /** Conversations, one after another. */
  conversations: {whatsapp: 5.4, instagram: 7.3, voice: 9.2},
  conversationLength: 1.9,
  /** Typing speed for messages and captions. */
  cps: 45,
  /** Pause after the customer finishes before the agent avatar appears. */
  pause: 0.2,
  /** Agent avatar fade; the agent starts typing after it. */
  avatar: 0.15,
  /** Lime pulse on the context line when the agent replies. */
  contextPulse: 0.6,
  /** Voice: waveform levels and timer. */
  voice: {fadeIn: 0.2, quiet: 0.2, customerLevel: 0.55, quietLevel: 0.06, agentRise: 0.3, timerSeconds: 38},
  /** Waveform fades to flat at the start of the final hold. */
  waveformOut: {start: 11.1, duration: 0.3},
  /** Everything fades to blank white, landing on the last frame. */
  fadeOut: {start: 11.6, end: 12.0},
} as const;

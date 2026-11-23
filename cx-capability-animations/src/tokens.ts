import {Easing} from 'remotion';

/**
 * Design tokens shared by all six capability animations.
 *
 * Lime rule: `lime` and `limeTint` appear only in these places on screen:
 * the typing highlight (limeTint), the finished send button, the
 * "Agent ready" pill and its tick, and the agent orb gradient. The Veil
 * dissolve also uses limeTint as a pale wash. Nothing else is green.
 *
 * Integrate: lime appears only in the Connected pills (limeTint), the
 * travelling pulse dot (lime) and the result highlight (limeTint), plus the
 * shared agent orb.
 */
export const colors = {
  background: '#ffffff',
  surface: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#6b6b66',
  border: '#e8e8e3',
  greyPill: '#f1f1ec',
  lime: '#c4e639',
  limeTint: '#eef5c8',
  /** Connection lines between the agent and its systems. */
  line: '#d9d9d3',
  /** Near black used for the idle send button and the typing caret. */
  charcoal: '#1a1a1a',
} as const;

export const shadows = {
  card: '0 12px 40px rgba(0,0,0,0.06)',
  /** Soft glow around the travelling pulse dot. */
  pulse: '0 0 14px rgba(196,230,57,0.6)',
} as const;

export const radii = {
  card: 20,
  tag: 8,
  highlight: 6,
  pill: 9999,
} as const;

export const fontFamily = "'Inter', sans-serif";

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

/** The single easing curve used for every animated property. */
export const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Icon stroke used for every line icon. */
export const iconStroke = 1.5;

/**
 * Step tag colours, one pair per step type. Every text colour meets a WCAG
 * contrast ratio of at least 4.5 to 1 on its background:
 *   ask 6.08, tool 4.78, if 6.24, elseIf 5.15, tell 5.19.
 * Tool text was darkened from #a85a10 (4.39, failed) to #a05510.
 */
export const tagColours = {
  ask: {background: '#e6effd', text: '#2a56a6'},
  tool: {background: '#fdecd8', text: '#a05510'},
  if: {background: '#ece6fc', text: '#5a3fb0'},
  elseIf: {background: '#fce4ea', text: '#b0304f'},
  tell: {background: '#dff3ef', text: '#1c6f64'},
} as const;

/** Agent orb: gradient stops, highlight, border and glow. */
export const orb = {
  stops: ['#c4e639', '#f4fad2', '#9fe0d2', '#8fbcf5', '#f4fad2', '#c4e639'],
  blur: 4,
  secondLayerOffsetDeg: 120,
  secondLayerOpacity: 0.5,
  highlight: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)',
  border: 'rgba(255,255,255,0.6)',
  glow: '0 0 28px rgba(196,230,57,0.35)',
} as const;

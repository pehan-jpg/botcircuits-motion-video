import {Easing} from 'remotion';

/**
 * Design tokens shared by all six capability animations.
 *
 * Lime rule: `lime` and `limeTint` appear in exactly four places on screen:
 * the typing highlight (limeTint), the finished send button, the
 * "Agent ready" pill and its tick. The Veil dissolve also uses limeTint as a
 * pale wash. Nothing else is green.
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
  /** Near black used for the idle send button and the typing caret. */
  charcoal: '#1a1a1a',
} as const;

export const shadows = {
  card: '0 12px 40px rgba(0,0,0,0.06)',
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

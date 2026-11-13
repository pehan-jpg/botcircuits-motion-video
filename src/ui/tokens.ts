import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {COLORS} from '../theme';

// Product UI tokens (rebuilt from the Console and Procedure editor screenshots).
export const UI_FAMILY = 'Plus Jakarta Sans';
for (const weight of ['400', '500', '600', '700']) {
  loadFont({family: UI_FAMILY, url: staticFile(`fonts/plus-jakarta-sans-latin-${weight}-normal.woff2`), weight});
}
export const UI_FONT = `"${UI_FAMILY}", "Inter", system-ui, sans-serif`;
export const UI_MONO = `"JetBrains Mono", ui-monospace, monospace`;

export const UI = {
  ink: COLORS.inkNavy, // #0D1224
  text2: '#6B7280',
  border: '#E5E7EB',
  card: '#FFFFFF',
  sidebar: '#F8F9FA',
  radius: 14,
  shadow: '0 20px 60px rgba(13,18,36,0.12)',
  consoleLime: '#8FD03C', // focused Console input border (small accent)
  sendGrey: '#E5E7EB',
  // type tags
  run: {bg: '#E6EEFF', fg: '#2F5BEA'},
  iff: {bg: '#EEE8FF', fg: '#6D4AE8'},
  send: {bg: '#FFEDE3', fg: '#E0601C'},
  set: {bg: '#DDF5F2', fg: '#0F8F80'},
  instruction: {bg: '#F1F2F4', fg: '#6B7280'},
  chipMint: '#D8F5E4',
  chipText: '#1E6A45',
  // action glows
  glow: {
    prompt: '#B9C6FF',
    procedure: '#8B5CF6',
    knowledge: '#7EE2B8',
    testing: '#4F7CFF',
    publish: '#FF7A59',
  },
};

/** Minimum on-screen text size check helper (world size x camera scale). */
export const MIN_TEXT = 28;

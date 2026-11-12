import {Easing, interpolate} from 'remotion';
import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {sec} from './timeline';

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
export const COLORS = {
  ink: '#0B0D0C',
  charcoal: '#17191A',
  charcoal2: '#222527',
  slate: '#1B2024',
  white: '#FFFFFF',
  mist: '#F3F5F2',
  muted: '#8A9190',
  // Brand accent. Single source of truth: swap this value to re-brand.
  // Intentionally NOT used anywhere in the problem sequence (scenes 1-3).
  lime: '#C6F432',
  mint: '#D9F7E8',
  // Scene-3 vignette tint (warm, used at low opacity only)
  warm: '#2A1F1A',
  // Light UI (scenes 4+)
  chipMint: '#D8F5E4', // variable chip background
  chipMintText: '#1E6A45', // variable chip text (dark green)
  line: '#E4E7E3', // 1px light grey borders
  lineSoft: '#EEF0ED',
  tagGrey: '#EEF0EE', // RUN / SEND tag
  tagBlue: '#E3E9EF', // "Instruction" tag (pale blue grey)
  tagBlueText: '#4B5B69',
  faint: '#A7ADAB', // light grey numbers
  buttonGrey: '#2E3234', // dark grey Save button
} as const;

/** Colour with alpha, from a #RRGGBB token (so lime is never hardcoded). */
export const alpha = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
// Bundled locally in /public/fonts (OFL) so renders never depend on the network.
export const FONT_SANS_FAMILY = 'Inter';
export const FONT_MONO_FAMILY = 'JetBrains Mono';

for (const weight of ['400', '500', '600', '700']) {
  loadFont({family: FONT_SANS_FAMILY, url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`), weight});
}
for (const weight of ['400', '500']) {
  loadFont({
    family: FONT_MONO_FAMILY,
    url: staticFile(`fonts/jetbrains-mono-latin-${weight}-normal.woff2`),
    weight,
  });
}

export const FONT_SANS = `"${FONT_SANS_FAMILY}", system-ui, sans-serif`;
export const FONT_MONO = `"${FONT_MONO_FAMILY}", ui-monospace, monospace`;

// ---------------------------------------------------------------------------
// Motion: one curve for everything. cubic-bezier(0.22, 1, 0.36, 1), no bounce.
// ---------------------------------------------------------------------------
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * Eased, clamped interpolation. Accepts multi-point keyframes; the easing is
 * applied to each segment independently.
 */
export const ease = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
): number =>
  interpolate(frame, input as number[], output as number[], {
    easing: EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** 0 → 1 progress between two frames, eased. */
export const progress = (frame: number, start: number, duration: number): number =>
  ease(frame, [start, start + duration], [0, 1]);

/** Keyframes authored in SECONDS (converted through sec()), eased per segment. */
export const kf = (frame: number, seconds: readonly number[], values: readonly number[]): number =>
  ease(frame, seconds.map(sec), values);

/** 0 -> 1 between two times in seconds. */
export const tween = (frame: number, from: number, to: number): number => kf(frame, [from, to], [0, 1]);

/** Press: 1 -> 0.96 -> 1 starting at `at` seconds (target scale on click). */
export const press = (frame: number, at: number): number => kf(frame, [at, at + 0.08, at + 0.24], [1, 0.96, 1]);

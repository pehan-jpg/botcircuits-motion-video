import {Easing, interpolate} from 'remotion';
import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

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
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
// Bundled locally in /public/fonts (OFL) so renders never depend on the network.
export const FONT_SANS_FAMILY = 'Inter';
export const FONT_MONO_FAMILY = 'JetBrains Mono';

for (const weight of ['400', '500', '600']) {
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

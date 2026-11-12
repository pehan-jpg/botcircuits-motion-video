import React from 'react';
import {COLORS, FONT_MONO, FONT_SANS, FONT_SANS_FAMILY, FONT_MONO_FAMILY, alpha} from '../theme';
import {measureText} from './measure';

/** Small check drawn as a stroke. */
export const CheckStroke: React.FC<{size: number; draw: number; color?: string; width?: number}> = ({
  size,
  draw,
  color = COLORS.ink,
  width = 2.4,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', overflow: 'visible', flexShrink: 0}}>
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - draw}
      opacity={draw > 0 ? 1 : 0}
    />
  </svg>
);

/** Pale mint variable chip: "Aa" glyph + monospace name, 6px radius. */
export const VariableChip: React.FC<{name: string; fontSize?: number; glow?: number; style?: React.CSSProperties}> = ({
  name,
  fontSize = 20,
  glow = 0,
  style,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: fontSize * 0.4,
      height: fontSize * 1.8,
      padding: `0 ${fontSize * 0.55}px`,
      borderRadius: 6,
      background: COLORS.chipMint,
      color: COLORS.chipMintText,
      fontFamily: FONT_MONO,
      fontSize,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      boxShadow: `0 0 0 ${2 + 6 * glow}px ${alpha(COLORS.lime, 0.35 * glow)}, 0 0 ${28 * glow}px ${alpha(COLORS.lime, 0.55 * glow)}`,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}
  >
    <span style={{fontFamily: FONT_SANS, fontWeight: 600, fontSize: fontSize * 0.78, opacity: 0.75}}>Aa</span>
    {name}
  </span>
);

export const variableChipWidth = (name: string, fontSize = 20): number =>
  measureText(name, `500 ${fontSize}px "${FONT_MONO_FAMILY}"`, fontSize * 0.6) +
  measureText('Aa', `600 ${fontSize * 0.78}px "${FONT_SANS_FAMILY}"`, fontSize * 0.5) +
  fontSize * 0.4 +
  fontSize * 1.1;

/** Rounded type tag (RUN / SEND / Instruction). */
export const Tag: React.FC<{label: string; tone?: 'grey' | 'blue'; fontSize?: number; style?: React.CSSProperties}> = ({
  label,
  tone = 'grey',
  fontSize = 17,
  style,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: fontSize * 2.05,
      padding: `0 ${fontSize * 0.7}px`,
      borderRadius: 8,
      background: tone === 'grey' ? COLORS.tagGrey : COLORS.tagBlue,
      color: tone === 'grey' ? COLORS.ink : COLORS.tagBlueText,
      fontFamily: FONT_SANS,
      fontWeight: tone === 'grey' ? 700 : 600,
      fontSize,
      letterSpacing: tone === 'grey' ? '0.04em' : 0,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {label}
  </span>
);

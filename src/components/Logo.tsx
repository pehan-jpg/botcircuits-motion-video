import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS} from '../theme';

// Logo assets live in /public; their shapes are never drawn in code.
export const LOGO_SRC = staticFile('botcircuits-logo.svg');
export const WORDMARK_SRC = staticFile('botcircuits-wordmark.svg');
/** width / height of the SVG viewBoxes */
export const MARK_ASPECT = 1063 / 1186;
export const WORDMARK_ASPECT = 4429 / 716;
/** Proportions of the official lockup (relative to the mark height). */
export const LOCKUP_RATIO = {wordHeight: 0.605, gap: 0.2};
export const lockupWidth = (markH: number): number =>
  markH * MARK_ASPECT + markH * LOCKUP_RATIO.gap + markH * LOCKUP_RATIO.wordHeight * WORDMARK_ASPECT;

export const LogoMark: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
  <Img src={LOGO_SRC} style={{height, width: height * MARK_ASPECT, display: 'block', ...style}} />
);

export const Wordmark: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
  <Img src={WORDMARK_SRC} style={{height, width: height * WORDMARK_ASPECT, display: 'block', ...style}} />
);

/** Mark + wordmark, laid out with the official proportions. Origin = top-left. */
export const Lockup: React.FC<{markHeight: number; markOpacity?: number; wordOpacity?: number; wordShift?: number}> = ({
  markHeight,
  markOpacity = 1,
  wordOpacity = 1,
  wordShift = 0,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: markHeight * LOCKUP_RATIO.gap, height: markHeight}}>
    <LogoMark height={markHeight} style={{opacity: markOpacity}} />
    <Wordmark
      height={markHeight * LOCKUP_RATIO.wordHeight}
      style={{opacity: wordOpacity, transform: `translateX(${wordShift}px)`}}
    />
  </div>
);

/** The AI agent: always a white orb/avatar with the ink mark. */
export const AgentAvatar: React.FC<{size: number; dark?: boolean; style?: React.CSSProperties}> = ({size, dark = false, style}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: COLORS.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark
        ? `0 0 0 ${Math.max(1.5, size * 0.012)}px ${COLORS.periwinkle}, 0 0 ${size * 0.5}px rgba(255,255,255,0.3)`
        : `0 0 0 ${Math.max(1.5, size * 0.012)}px ${COLORS.periwinkle}, 0 ${size * 0.08}px ${size * 0.25}px rgba(13,18,36,0.18)`,
      flexShrink: 0,
      ...style,
    }}
  >
    <LogoMark height={size * 0.54} />
  </div>
);

/** A human: always ink with white initials (thin white border on dark backgrounds). */
export const HumanAvatar: React.FC<{size: number; initials: string; dark?: boolean}> = ({size, initials, dark = false}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: COLORS.ink,
      color: COLORS.white,
      border: dark ? `2px solid ${COLORS.white}` : 'none',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: size * 0.38,
    }}
  >
    {initials}
  </div>
);

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

/** The AI agent: always lime, with the logo mark. */
export const AgentAvatar: React.FC<{size: number; ring?: boolean; style?: React.CSSProperties}> = ({
  size,
  ring = false,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: COLORS.lime,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: ring ? `0 0 0 ${Math.max(3, size * 0.04)}px ${COLORS.white}, 0 18px 50px rgba(11,13,12,0.18)` : 'none',
      flexShrink: 0,
      ...style,
    }}
  >
    <LogoMark height={size * 0.56} />
  </div>
);

/** A human: always ink with white initials. */
export const HumanAvatar: React.FC<{size: number; initials: string}> = ({size, initials}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: COLORS.ink,
      color: COLORS.white,
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

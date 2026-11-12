import React from 'react';
import {COLORS, alpha} from '../theme';
import {Logo, LogoName} from './logos';
import {CheckStroke} from './Chip';

/**
 * White rounded square holding a full-colour logo (or a drawn glyph).
 * Positioned by its centre. Optional brand-colour glow and ink check badge.
 */
export const LogoTile: React.FC<{
  name?: LogoName;
  cx: number;
  cy: number;
  size?: number;
  scale?: number;
  opacity?: number;
  glow?: number;
  glowColor?: string;
  badge?: number; // 0..1 check badge pop
  badgeDraw?: number;
  children?: React.ReactNode; // custom glyph instead of a logo
  logoScale?: number;
}> = ({name, cx, cy, size = 140, scale = 1, opacity = 1, glow = 0, glowColor = COLORS.white, badge = 0, badgeDraw = 1, children, logoScale = 0.5}) => (
  <div
    style={{
      position: 'absolute',
      left: cx - size / 2,
      top: cy - size / 2,
      width: size,
      height: size,
      opacity,
      transform: `scale(${scale})`,
    }}
  >
    {glow > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: -size * 0.6,
          top: -size * 0.6,
          width: size * 2.2,
          height: size * 2.2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(glowColor, 0.55 * glow)} 0%, ${alpha(glowColor, 0)} 65%)`,
        }}
      />
    ) : null}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: size * 0.26,
        background: COLORS.white,
        boxShadow: `0 ${size * 0.14}px ${size * 0.36}px rgba(13,18,36,0.18), 0 2px 6px rgba(13,18,36,0.08)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children ?? (name ? <Logo name={name} size={size * logoScale} /> : null)}
    </div>
    {badge > 0 ? (
      <div
        style={{
          position: 'absolute',
          right: -size * 0.1,
          top: -size * 0.1,
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: '50%',
          background: COLORS.ink,
          border: `3px solid ${COLORS.white}`,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${badge})`,
        }}
      >
        <CheckStroke size={size * 0.2} draw={badgeDraw} color={COLORS.white} width={3} />
      </div>
    ) : null}
  </div>
);

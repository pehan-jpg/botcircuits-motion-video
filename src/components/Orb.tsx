import React from 'react';
import {COLORS, alpha} from '../theme';
import {ORB} from '../handoff';
import {LogoMark} from './Logo';
import {CheckStroke} from './Chip';

/**
 * The agent orb: solid white disc, BotCircuits mark in ink, thin periwinkle
 * ring. Dark backgrounds get a soft white/violet glow; light backgrounds a
 * soft drop shadow (`light` 0 -> 1 blends between them).
 * `square` 0 -> 1 morphs the circle into a rounded-square tile (scene 6), and
 * `iconMix` cross-fades the mark into `children` (the tile's icon).
 */
export const Orb: React.FC<{
  cx: number;
  cy: number;
  size?: number;
  scale?: number;
  opacity?: number;
  light?: number;
  glow?: number;
  pulse?: number;
  check?: number;
  whiteRing?: number;
  square?: number;
  squareRadius?: number; // radius as a fraction of size at square = 1
  iconMix?: number;
  ringOpacity?: number;
  children?: React.ReactNode;
}> = ({
  cx,
  cy,
  size = ORB.size,
  scale = 1,
  opacity = 1,
  light = 0,
  glow = 1,
  pulse = 0,
  check = 0,
  whiteRing = 0,
  square = 0,
  squareRadius = 0.26,
  iconMix = 0,
  ringOpacity = 1,
  children,
}) => {
  const S = size;
  const radius = S * (0.5 + (squareRadius - 0.5) * square);
  return (
    <div style={{position: 'absolute', left: cx - S / 2, top: cy - S / 2, width: S, height: S, opacity, transform: `scale(${scale})`}}>
      {/* dark-surface glow: white -> violet, no shadow */}
      {(1 - light) * glow > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: -S * 0.8,
            top: -S * 0.8,
            width: S * 2.6,
            height: S * 2.6,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(COLORS.white, 0.3)} 0%, ${alpha(COLORS.spinnerViolet, 0.22)} 38%, ${alpha(COLORS.spinnerViolet, 0)} 66%)`,
            opacity: (1 - light) * glow,
          }}
        />
      ) : null}
      {pulse > 0 && pulse < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            border: `4px solid ${alpha(light > 0.5 ? COLORS.spinnerViolet : COLORS.white, 0.8 * (1 - pulse))}`,
            transform: `scale(${1 + pulse * 0.9})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: COLORS.white,
          boxShadow: [
            `0 0 0 ${2}px ${alpha(COLORS.periwinkle, ringOpacity)}`,
            `0 20px 60px rgba(13,18,36,${0.18 * light})`,
            whiteRing > 0 ? `0 0 0 ${8 * whiteRing}px ${alpha(COLORS.white, 0.95 * whiteRing)}` : '',
          ]
            .filter(Boolean)
            .join(', '),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{position: 'absolute', opacity: 1 - iconMix}}>
          <LogoMark height={S * 0.5} />
        </div>
        {children ? <div style={{position: 'absolute', opacity: iconMix, display: 'flex'}}>{children}</div> : null}
      </div>
      {check > 0 ? (
        <div
          style={{
            position: 'absolute',
            right: -S * 0.02,
            bottom: S * 0.02,
            width: S * 0.3,
            height: S * 0.3,
            borderRadius: '50%',
            background: COLORS.white,
            boxShadow: `0 0 0 2px ${COLORS.periwinkle}, 0 8px 20px rgba(13,18,36,0.25)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${Math.min(1, check * 3)})`,
            opacity: Math.min(1, check * 3),
          }}
        >
          <CheckStroke size={S * 0.19} draw={check} color={COLORS.inkNavy} width={3} />
        </div>
      ) : null}
    </div>
  );
};

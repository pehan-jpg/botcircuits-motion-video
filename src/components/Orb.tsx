import React from 'react';
import {COLORS, alpha} from '../theme';
import {ORB} from '../handoff';
import {LogoMark} from './Logo';
import {CheckStroke} from './Chip';

/**
 * The agent orb: lime disc, BotCircuits mark in ink, thin white ring, soft
 * glow. The only place the logo mark appears in the Build scenes.
 */
export const Orb: React.FC<{
  cx: number;
  cy: number;
  scale?: number;
  opacity?: number;
  glow?: number; // 0..1 extra glow
  whiteGlow?: number; // 0..1 white bloom (scene 7 end)
  pulse?: number; // 0..1 expanding ring pulse
  check?: number; // 0..1 stroke-drawn check badge
}> = ({cx, cy, scale = 1, opacity = 1, glow = 0.5, whiteGlow = 0, pulse = 0, check = 0}) => {
  const S = ORB.size;
  return (
    <div style={{position: 'absolute', left: cx - S / 2, top: cy - S / 2, width: S, height: S, opacity, transform: `scale(${scale})`}}>
      {/* soft glow (white/violet, keeps lime area small) */}
      <div
        style={{
          position: 'absolute',
          left: -S * 0.9,
          top: -S * 0.9,
          width: S * 2.8,
          height: S * 2.8,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(COLORS.white, 0.35 * glow + 0.6 * whiteGlow)} 0%, ${alpha(COLORS.periwinkle, 0.25 * glow)} 30%, rgba(255,255,255,0) 66%)`,
        }}
      />
      {pulse > 0 && pulse < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `4px solid ${alpha(COLORS.white, 0.8 * (1 - pulse))}`,
            transform: `scale(${1 + pulse * 0.9})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: COLORS.lime,
          boxShadow: `0 0 0 ${ORB.ring}px ${COLORS.white}, 0 24px 60px rgba(13,18,36,0.28)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogoMark height={S * 0.5} />
      </div>
      {check > 0 ? (
        <div
          style={{
            position: 'absolute',
            right: -4,
            bottom: 4,
            width: 64,
            height: 64,
            borderRadius: 32,
            background: COLORS.white,
            boxShadow: '0 8px 20px rgba(13,18,36,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${Math.min(1, check * 3)})`,
          }}
        >
          <CheckStroke size={40} draw={check} color={COLORS.ink} width={3} />
        </div>
      ) : null}
    </div>
  );
};

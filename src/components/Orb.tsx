import React from 'react';
import {COLORS, alpha} from '../theme';

/**
 * The recurring orb character, tuned to read on white and on the lilac wash:
 * conic of mint #A8EBC5, lime #D6F26B, sky #9CCBFF with a white core, a 2px
 * ring in rgba(13,18,36,0.10), a subtle inner shadow at the bottom edge and a
 * drop shadow 0 14px 34px rgba(60,120,90,0.25) (scaled for small orbs).
 * `color` 0 = untrained (desaturated grey, same ring and shadow) -> 1 = full.
 */
export const Orb: React.FC<{
  cx: number;
  cy: number;
  size?: number;
  scale?: number;
  opacity?: number;
  color?: number;
  pulse?: number; // 0..1 expanding ring
  frame?: number; // slow rotation of the gradient
  shadow?: boolean;
  blur?: number;
}> = ({cx, cy, size = 200, scale = 1, opacity = 1, color = 1, pulse = 0, frame = 0, shadow = true, blur = 0}) => {
  const S = size;
  const k = Math.min(1, S / 180); // shadow scale for small orbs
  const angle = (frame * 0.6) % 360;
  const ring = Math.max(1.5, Math.min(2, S * 0.02));
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - S / 2,
        top: cy - S / 2,
        width: S,
        height: S,
        opacity,
        transform: `scale(${scale})`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
      }}
    >
      {pulse > 0 && pulse < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `${Math.max(2, S * 0.02)}px solid ${alpha('#3CC37A', 0.5 * (1 - pulse))}`,
            transform: `scale(${1 + pulse * 0.8})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          boxShadow: [
            `0 0 0 ${ring}px rgba(13,18,36,0.10)`,
            shadow ? `0 ${14 * k}px ${34 * k}px rgba(60,120,90,0.25)` : `0 ${4 * k + 1}px ${10 * k + 2}px rgba(60,120,90,0.22)`,
          ].join(', '),
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          filter: color < 0.999 ? `saturate(${color}) brightness(${0.9 + 0.1 * color})` : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `conic-gradient(from ${angle}deg, #A8EBC5, #D6F26B, #9CCBFF, #A8EBC5)`,
          }}
        />
        {/* white core */}
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 40% 36%, ${COLORS.white} 0%, rgba(255,255,255,0.85) 16%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0) 58%)`}} />
        {/* subtle inner shadow at the bottom edge */}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 ${-S * 0.07}px ${S * 0.12}px rgba(40,90,70,0.20)`}} />
      </div>
    </div>
  );
};

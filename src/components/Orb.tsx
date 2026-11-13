import React from 'react';

/**
 * The orb, the one persistent character (scenes 5 to 13). Conic gradient of
 * deep green #0B3B2C, forest #14684A, emerald #23A06B and light jade #6FD3A4,
 * a soft specular highlight at the top left, a 1px rgba(11,59,44,0.35) edge on
 * light backgrounds or a 2px white ring on dark ones, shadow
 * 0 14px 34px rgba(11,59,44,0.35) (scaled for small orbs).
 * `color` 0 = untrained (grey, same edge and shadow) -> 1 = green.
 * `glow` 0..1 = active glow ring in #6FD3A4 at 35%.
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
  dark?: boolean;
  glow?: number;
}> = ({cx, cy, size = 200, scale = 1, opacity = 1, color = 1, pulse = 0, frame = 0, shadow = true, blur = 0, dark = false, glow = 0}) => {
  const S = size;
  const k = Math.min(1, S / 180);
  const angle = (frame * 0.6) % 360;
  const edge = dark ? `0 0 0 2px rgba(255,255,255,0.55)` : `0 0 0 1px rgba(11,59,44,0.35)`;
  const drop = shadow ? `0 ${14 * k}px ${34 * k}px rgba(11,59,44,0.35)` : `0 ${3 * k + 1}px ${8 * k + 2}px rgba(11,59,44,0.28)`;
  const glowRing = glow > 0 ? `0 0 0 ${Math.max(3, S * 0.05)}px rgba(111,211,164,${0.35 * glow})` : '';
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
            border: `${Math.max(2, S * 0.02)}px solid rgba(111,211,164,${0.6 * (1 - pulse)})`,
            transform: `scale(${1 + pulse * 0.8})`,
          }}
        />
      ) : null}
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: [edge, drop, glowRing].filter(Boolean).join(', ')}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', filter: color < 0.999 ? `saturate(${color}) brightness(${1.35 - 0.35 * color})` : undefined}}>
        <div style={{position: 'absolute', inset: 0, background: `conic-gradient(from ${angle}deg, #0B3B2C, #14684A, #23A06B, #6FD3A4, #23A06B, #14684A, #0B3B2C)`}} />
        {/* soft specular highlight, top left */}
        <div style={{position: 'absolute', left: '14%', top: '10%', width: '32%', height: '30%', borderRadius: '50%', background: 'rgba(255,255,255,0.35)', filter: `blur(${Math.max(1, S * 0.05)}px)`}} />
      </div>
    </div>
  );
};

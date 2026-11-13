import React from 'react';
import {COLORS, alpha} from '../theme';

/**
 * The recurring orb character: pastel iridescent fill (conic gradient of
 * periwinkle, peach, blush and sky), white core highlight, thin white ring and
 * a soft shadow. `color` 0 = untrained (desaturated, dim ring) -> 1 = full.
 */
export const Orb: React.FC<{
  cx: number;
  cy: number;
  size?: number;
  scale?: number;
  opacity?: number;
  color?: number;
  pulse?: number; // 0..1 expanding ring
  frame?: number; // slow iridescent rotation
  shadow?: boolean;
  blur?: number;
}> = ({cx, cy, size = 200, scale = 1, opacity = 1, color = 1, pulse = 0, frame = 0, shadow = true, blur = 0}) => {
  const S = size;
  const angle = (frame * 0.6) % 360;
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
            border: `${Math.max(2, S * 0.025)}px solid ${alpha(COLORS.white, 0.85 * (1 - pulse))}`,
            transform: `scale(${1 + pulse * 0.8})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle at 34% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 18%, rgba(255,255,255,0) 46%), conic-gradient(from ${angle}deg, ${COLORS.periwinkle}, ${COLORS.peach}, ${COLORS.blush}, ${COLORS.sky}, ${COLORS.periwinkle})`,
          boxShadow: [
            `0 0 0 ${Math.max(1.5, S * 0.012)}px ${alpha(COLORS.white, 0.5 + 0.5 * color)}`,
            shadow ? `0 ${S * 0.1}px ${S * 0.3}px rgba(13,18,36,0.22)` : '',
            `inset 0 ${-S * 0.06}px ${S * 0.14}px rgba(124,108,240,0.18)`,
          ]
            .filter(Boolean)
            .join(', '),
          filter: color < 0.999 ? `saturate(${color}) brightness(${0.88 + 0.12 * color})` : undefined,
        }}
      />
    </div>
  );
};

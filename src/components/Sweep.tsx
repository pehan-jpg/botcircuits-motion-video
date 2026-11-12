import React from 'react';
import {COLORS, alpha} from '../theme';

/**
 * A single diagonal highlight sweep. Place inside a parent with
 * overflow: hidden. progress 0 -> 1 moves the band across.
 */
export const Sweep: React.FC<{progress: number; width: number; color?: string; strength?: number}> = ({
  progress,
  width,
  color = COLORS.lime,
  strength = 0.45,
}) => {
  if (progress <= 0 || progress >= 1) return null;
  const band = Math.max(120, width * 0.35);
  const x = -band * 1.5 + (width + band * 3) * progress;
  return (
    <div
      style={{
        position: 'absolute',
        top: '-50%',
        left: 0,
        width: band,
        height: '200%',
        background: `linear-gradient(90deg, ${alpha(color, 0)} 0%, ${alpha(color, strength)} 50%, ${alpha(color, 0)} 100%)`,
        transform: `translateX(${x}px) rotate(18deg)`,
        pointerEvents: 'none',
      }}
    />
  );
};

import React from 'react';
import {COLORS} from '../theme';
import {sec} from '../timeline';

/** Three dots pulsing in sequence (opacity + small lift, no bounce). */
export const TypingDots: React.FC<{frame: number; size?: number; gap?: number; color?: string}> = ({
  frame,
  size = 14,
  gap = 10,
  color = COLORS.muted,
}) => {
  const cycle = sec(0.47);
  return (
    <div style={{display: 'flex', gap}}>
      {[0, 1, 2].map((i) => {
        const t = (((frame - i * sec(0.13)) % cycle) + cycle) % cycle;
        const pulse = 0.5 - 0.5 * Math.cos((t / cycle) * Math.PI * 2);
        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              background: color,
              opacity: 0.3 + 0.7 * pulse,
              transform: `translateY(${-size * 0.25 * pulse}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

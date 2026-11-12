import React from 'react';
import {COLORS, ease, alpha} from '../theme';
import {sec} from '../timeline';
import {Pt} from './StrokeLine';

/**
 * Pointer that glides along an eased, curved path (quadratic bezier) and
 * clicks with a ripple. Screen/world coordinates of the parent.
 */
export const Cursor: React.FC<{
  frame: number;
  from: Pt;
  to: Pt;
  moveStart: number; // frames
  moveEnd: number; // frames
  clickAt: number; // frames
  opacity?: number;
  bend?: number; // curve amount (fraction of distance)
  rippleColor?: string;
}> = ({frame, from, to, moveStart, moveEnd, clickAt, opacity = 1, bend = 0.22, rippleColor = COLORS.ink}) => {
  const t = ease(frame, [moveStart, moveEnd], [0, 1]);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const ctrl = {x: (from.x + to.x) / 2 - dy * bend, y: (from.y + to.y) / 2 + dx * bend};
  const u = 1 - t;
  const x = u * u * from.x + 2 * u * t * ctrl.x + t * t * to.x;
  const y = u * u * from.y + 2 * u * t * ctrl.y + t * t * to.y;
  const pressScale = ease(frame, [clickAt, clickAt + sec(0.08), clickAt + sec(0.22)], [1, 0.86, 1]);
  const ripple = ease(frame, [clickAt, clickAt + sec(0.5)], [0, 1]);
  const appear = ease(frame, [moveStart - sec(0.15), moveStart + sec(0.1)], [0, 1]);
  return (
    <>
      {frame >= clickAt ? (
        <div
          style={{
            position: 'absolute',
            left: to.x - 40,
            top: to.y - 40,
            width: 80,
            height: 80,
            borderRadius: 40,
            border: `3px solid ${alpha(rippleColor, 0.55)}`,
            boxSizing: 'border-box',
            opacity: (1 - ripple) * opacity,
            transform: `scale(${0.2 + ripple * 1.4})`,
          }}
        />
      ) : null}
      <svg
        width={44}
        height={52}
        viewBox="0 0 22 26"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          overflow: 'visible',
          opacity: appear * opacity,
          transformOrigin: '2px 2px',
          transform: `translate(${x - 4}px, ${y - 4}px) scale(${pressScale})`,
          filter: 'drop-shadow(0 6px 10px rgba(11,13,12,0.25))',
        }}
      >
        <path
          d="M2 2 L2 21 L7.2 16.4 L10.6 24 L14 22.5 L10.7 15.1 L17.6 15.1 Z"
          fill={COLORS.ink}
          stroke={COLORS.white}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

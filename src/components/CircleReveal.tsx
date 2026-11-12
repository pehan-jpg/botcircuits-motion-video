import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, alpha} from '../theme';
import {WIDTH, HEIGHT} from '../timeline';

/**
 * Circular reveal of full-frame content from (cx, cy), transform only:
 * an outer circle scales up while the content inside is counter-scaled so
 * it stays fixed on screen. Optional white ring at the wipe edge.
 */
export const CircleReveal: React.FC<{cx: number; cy: number; progress: number; ring?: number; children: React.ReactNode}> = ({
  cx,
  cy,
  progress,
  ring = 0,
  children,
}) => {
  if (progress <= 0.0005) return null;
  if (progress >= 0.9995) return <AbsoluteFill>{children}</AbsoluteFill>;
  const R = Math.max(Math.hypot(cx, cy), Math.hypot(WIDTH - cx, cy), Math.hypot(cx, HEIGHT - cy), Math.hypot(WIDTH - cx, HEIGHT - cy)) + 4;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: cx - R,
          top: cy - R,
          width: 2 * R,
          height: 2 * R,
          borderRadius: '50%',
          overflow: 'hidden',
          transform: `scale(${progress})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: -(cx - R),
            top: -(cy - R),
            width: WIDTH,
            height: HEIGHT,
            transformOrigin: `${cx}px ${cy}px`,
            transform: `scale(${1 / progress})`,
          }}
        >
          {children}
        </div>
      </div>
      {ring > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: cx - R,
            top: cy - R,
            width: 2 * R,
            height: 2 * R,
            borderRadius: '50%',
            boxShadow: `inset 0 0 0 ${6 / progress}px ${alpha(COLORS.white, 0.9 * ring)}, 0 0 ${40 / progress}px ${alpha(COLORS.white, 0.5 * ring)}`,
            transform: `scale(${progress})`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

import React from 'react';
import {COLORS} from '../theme';
import {sec} from '../timeline';

const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
};

/**
 * Radial petal spinner: 12 rounded petals, white at the head fading to
 * violet along the trail. converge 0..1 pulls the petals into the orb ring.
 */
export const PetalSpinner: React.FC<{cx: number; cy: number; radius: number; ringRadius: number; frame: number; opacity: number; converge: number}> = ({
  cx,
  cy,
  radius,
  ringRadius,
  frame,
  opacity,
  converge,
}) => {
  const head = Math.floor(frame / sec(0.07)) % 12;
  const r = radius + (ringRadius - radius) * converge;
  return (
    <div style={{position: 'absolute', left: cx, top: cy, opacity}}>
      {Array.from({length: 12}).map((_, i) => {
        const age = (head - i + 12) % 12; // 0 = head
        const t = age / 11;
        const w = 20;
        const h = 56 * (1 - 0.7 * converge);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -w / 2,
              top: -h / 2,
              width: w,
              height: h,
              borderRadius: w / 2,
              background: mix(COLORS.white, COLORS.spinnerViolet, t),
              opacity: (0.15 + 0.85 * (1 - t)) * (1 - converge) + converge,
              transform: `rotate(${i * 30}deg) translateY(${-r}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

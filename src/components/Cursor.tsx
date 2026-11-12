import React from 'react';
import {COLORS, alpha, ease, kf} from '../theme';
import {sec} from '../timeline';

export type CursorKey = {t: number; x: number; y: number};

/** Position along eased, curved segments between waypoints (seconds). */
export const cursorAt = (frame: number, keys: CursorKey[], bend = 0.18) => {
  const s = frame / sec(1);
  if (s <= keys[0].t) return {x: keys[0].x, y: keys[0].y};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (s <= b.t) {
      const t = ease(frame, [sec(a.t), sec(b.t)], [0, 1]);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const c = {x: (a.x + b.x) / 2 - dy * bend, y: (a.y + b.y) / 2 + dx * bend};
      const u = 1 - t;
      return {x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y};
    }
  }
  const z = keys[keys.length - 1];
  return {x: z.x, y: z.y};
};

const Arrow: React.FC = () => (
  <path
    d="M3 2 L3 25.5 L9.2 19.8 L13.2 28.8 L17.3 27.1 L13.3 18.2 L21.8 18.2 Z"
    fill={COLORS.ink}
    stroke={COLORS.white}
    strokeWidth={1.8}
    strokeLinejoin="round"
  />
);

/** Pointing hand: white-stroked silhouette under a black fill. Hotspot at the fingertip (12, 2). */
const HandShapes: React.FC<{fill: string; stroke?: string; sw?: number}> = ({fill, stroke = 'none', sw = 0}) => (
  <g fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
    <rect x="9.6" y="1.6" width="5" height="16" rx="2.5" />
    <rect x="14.2" y="9.6" width="4.4" height="9" rx="2.2" />
    <rect x="18.2" y="10.8" width="4.2" height="8.6" rx="2.1" />
    <rect x="21.8" y="12.6" width="3.8" height="7.8" rx="1.9" />
    <rect x="3.2" y="13.4" width="4.6" height="9.4" rx="2.3" transform="rotate(-38 5.5 18)" />
    <rect x="7.2" y="14.6" width="18.4" height="14" rx="6" />
  </g>
);

/**
 * macOS-style cursor. Moves along curved eased paths, becomes a pointing hand
 * over buttons/tiles, scales to 0.92 on click with a soft ripple at the tip.
 */
export const Cursor: React.FC<{
  frame: number;
  keys: CursorKey[];
  clicks?: number[]; // seconds
  hand?: [number, number][]; // seconds ranges
  opacity?: number;
  bend?: number;
  rippleColor?: string;
}> = ({frame, keys, clicks = [], hand = [], opacity = 1, bend, rippleColor = COLORS.white}) => {
  const p = cursorAt(frame, keys, bend);
  const s = frame / sec(1);
  const h = hand.reduce((m, [a, b]) => Math.max(m, kf(frame, [a, a + 0.1, b - 0.1, b], [0, 1, 1, 0])), 0);
  const press = clicks.reduce((m, c) => Math.min(m, kf(frame, [c, c + 0.07, c + 0.22], [1, 0.92, 1])), 1);
  return (
    <>
      {clicks.map((c) =>
        s >= c && s < c + 0.6 ? (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: p.x - 75,
              top: p.y - 75,
              width: 150,
              height: 150,
              borderRadius: 75,
              background: `radial-gradient(circle, ${alpha(rippleColor, 0)} 40%, ${alpha(rippleColor, 0.55)} 62%, ${alpha(rippleColor, 0)} 72%)`,
              opacity: (1 - kf(frame, [c, c + 0.55], [0, 1])) * opacity,
              transform: `scale(${kf(frame, [c, c + 0.55], [0.2, 1.6])})`,
            }}
          />
        ) : null,
      )}
      <svg
        width={90}
        height={90}
        viewBox="0 0 30 30"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          overflow: 'visible',
          opacity,
          transformOrigin: '0 0',
          transform: `translate(${p.x}px, ${p.y}px) scale(${press})`,
          filter: 'drop-shadow(0 5px 8px rgba(13,18,36,0.35))',
        }}
      >
        <g transform="translate(-3 -2)" opacity={1 - h}>
          <Arrow />
        </g>
        <g transform="translate(-12 -1.6)" opacity={h}>
          <HandShapes fill="none" stroke={COLORS.white} sw={3.2} />
          <HandShapes fill={COLORS.ink} />
        </g>
      </svg>
    </>
  );
};

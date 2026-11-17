import React from 'react';
import {COLORS, alpha, kf, kfIO} from '../theme';
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
      const t = kfIO(frame, [sec(a.t), sec(b.t)], [0, 1]); // ease in and out
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
    strokeWidth={1.2}
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

/** Closed hand (grabbing): fist with curled fingers. */
const FistShapes: React.FC<{fill: string; stroke?: string; sw?: number}> = ({fill, stroke = 'none', sw = 0}) => (
  <g fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
    <rect x="8.2" y="10.4" width="4.4" height="6" rx="2.2" />
    <rect x="12.2" y="9.8" width="4.4" height="6.6" rx="2.2" />
    <rect x="16.2" y="10.4" width="4.2" height="6" rx="2.1" />
    <rect x="19.8" y="11.6" width="3.8" height="5.4" rx="1.9" />
    <rect x="5.2" y="13.6" width="4.4" height="7.4" rx="2.2" transform="rotate(-30 7.4 17)" />
    <rect x="7.2" y="13.4" width="16.6" height="13" rx="5.6" />
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
  grab?: [number, number][]; // closed hand (dragging)
  opacity?: number;
  bend?: number;
  rippleColor?: string;
}> = ({frame, keys, clicks = [], hand = [], grab = [], opacity = 1, bend, rippleColor = COLORS.white}) => {
  const p = cursorAt(frame, keys, bend);
  const s = frame / sec(1);
  const g = grab.reduce((m, [a, b]) => Math.max(m, kf(frame, [a, a + 0.08, b - 0.08, b], [0, 1, 1, 0])), 0);
  const h = Math.max(0, hand.reduce((m, [a, b]) => Math.max(m, kf(frame, [a, a + 0.1, b - 0.1, b], [0, 1, 1, 0])), 0) - g);
  const press = clicks.reduce((m, c) => Math.min(m, kf(frame, [c, c + 0.07, c + 0.22], [1, 0.92, 1])), 1);
  return (
    <>
      {clicks.map((c) =>
        s >= c && s < c + 0.4 ? (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: p.x - 50,
              top: p.y - 50,
              width: 100,
              height: 100,
              borderRadius: 50,
              border: `3px solid ${alpha(rippleColor, 0.45)}`,
              boxSizing: 'border-box',
              opacity: (1 - kf(frame, [c, c + 0.4], [0, 1])) * opacity,
              transform: `scale(${kf(frame, [c, c + 0.4], [0.15, 1])})`,
            }}
          />
        ) : null,
      )}
      <svg
        width={75}
        height={75}
        viewBox="0 0 30 30"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          overflow: 'visible',
          opacity,
          transformOrigin: '0 0',
          transform: `translate(${p.x}px, ${p.y}px) scale(${press})`,
          filter: 'drop-shadow(0 3px 6px rgba(13,18,36,0.2))',
        }}
      >
        <g transform="translate(-3 -2)" opacity={1 - h - g}>
          <Arrow />
        </g>
        <g transform="translate(-12 -1.6)" opacity={h}>
          <HandShapes fill="none" stroke={COLORS.white} sw={2.2} />
          <HandShapes fill={COLORS.ink} />
        </g>
        <g transform="translate(-14 -10)" opacity={g}>
          <FistShapes fill="none" stroke={COLORS.white} sw={2.2} />
          <FistShapes fill={COLORS.ink} />
        </g>
      </svg>
    </>
  );
};

// ---------------------------------------------------------------------------
// Cursor planner: give it the targets (where the tip / fingertip must be, and
// when); it moves from target to target on curved eased paths of 0.5 to 0.8 s,
// fades out during any wait longer than 0.8 s and fades back in near the next
// target 0.3 s before it is needed.
// ---------------------------------------------------------------------------
export type CursorTarget = {t: number; x: number; y: number; click?: boolean; hand?: boolean};
const travel = (a: {x: number; y: number}, b: {x: number; y: number}) => Math.min(0.8, Math.max(0.5, 0.5 + Math.hypot(b.x - a.x, b.y - a.y) / 2400));
export const planCursor = (targets: CursorTarget[]) => {
  const keys: CursorKey[] = [];
  const vis: [number, number][] = []; // visible spans
  let spanStart = 0;
  targets.forEach((tg, i) => {
    const prev = targets[i - 1];
    const near = {x: tg.x + 54, y: tg.y + 46};
    const d = prev ? travel(prev, tg) : 0.5;
    // a wait of 0.8 s or more with no action: fade out, come back near the next target
    if (!prev || tg.t - prev.t - d >= 0.8 - 1e-6) {
      if (prev) {
        keys.push({t: prev.t + 0.35, x: prev.x, y: prev.y});
        vis.push([spanStart, prev.t + 0.35]);
      }
      // reappear near the next target 0.3 s before it is needed, then move in
      keys.push({t: tg.t - 0.5, x: near.x, y: near.y});
      spanStart = tg.t - 0.5;
    } else {
      // move from the previous target (never before it was reached)
      keys.push({t: Math.max(prev.t + 0.02, tg.t - d), x: prev.x, y: prev.y});
    }
    keys.push({t: tg.t, x: tg.x, y: tg.y});
  });
  const last = targets[targets.length - 1];
  keys.push({t: last.t + 0.35, x: last.x, y: last.y});
  vis.push([spanStart, last.t + 0.35]);
  const clicks = targets.filter((t) => t.click).map((t) => t.t);
  const hand = targets.filter((t) => t.hand).map((t) => [t.t - 0.25, t.t + 0.15] as [number, number]);
  const opacity = (frame: number) => vis.reduce((m, [a, b]) => Math.max(m, kf(frame, [a, a + 0.2, b, b + 0.2], [0, 1, 1, 0])), 0);
  return {keys, clicks, hand, opacity};
};

/** A cursor driven by targets (see planCursor). */
export const PlannedCursor: React.FC<{frame: number; targets: CursorTarget[]; opacity?: number; rippleColor?: string; grab?: [number, number][]}> = ({frame, targets, opacity = 1, rippleColor, grab}) => {
  const plan = planCursor(targets);
  return <Cursor frame={frame} keys={plan.keys} clicks={plan.clicks} hand={plan.hand} grab={grab} rippleColor={rippleColor} opacity={opacity * plan.opacity(frame)} />;
};

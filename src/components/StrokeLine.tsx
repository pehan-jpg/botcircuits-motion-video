import React from 'react';
import {COLORS} from '../theme';

export type Pt = {x: number; y: number};
export type Cubic = [Pt, Pt, Pt, Pt];

export const cubicPoint = ([a, b, c, d]: Cubic, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
};

export const cubicPath = ([a, b, c, d]: Cubic): string =>
  `M ${a.x} ${a.y} C ${b.x} ${b.y}, ${c.x} ${c.y}, ${d.x} ${d.y}`;

/** Gentle S-curve between two points (horizontal or vertical bias). */
export const sCurve = (a: Pt, d: Pt, bias: 'h' | 'v' = 'h', k = 0.5): Cubic =>
  bias === 'h'
    ? [a, {x: a.x + (d.x - a.x) * k, y: a.y}, {x: d.x - (d.x - a.x) * k, y: d.y}, d]
    : [a, {x: a.x, y: a.y + (d.y - a.y) * k}, {x: d.x, y: d.y - (d.y - a.y) * k}, d];

/**
 * A line drawn as a stroke (stroke-dashoffset) with an optional travelling dot.
 * Coordinates are in the parent's space; the SVG overflows freely.
 */
export const StrokeLine: React.FC<{
  curve: Cubic;
  draw: number; // 0..1 stroke progress
  dot?: number; // 0..1 position of the travelling dot (or undefined)
  dotOpacity?: number;
  color?: string;
  dotColor?: string;
  width?: number;
  dotSize?: number;
  opacity?: number;
  dashed?: boolean;
}> = ({curve, draw, dot, dotOpacity = 1, color = COLORS.ink, dotColor, width = 2, dotSize = 12, opacity = 1}) => {
  const p = dot === undefined ? null : cubicPoint(curve, dot);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}} width={1} height={1}>
      <path
        d={cubicPath(curve)}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        opacity={draw > 0 ? 1 : 0}
      />
      {p ? (
        <g style={{transform: `translate(${p.x}px, ${p.y}px)`}} opacity={dotOpacity}>
          <circle r={dotSize * 1.1} fill={dotColor ?? color} opacity={0.22} />
          <circle r={dotSize / 2} fill={dotColor ?? color} />
        </g>
      ) : null}
    </svg>
  );
};

/** Dense points along a polyline whose corners are rounded (radius r). */
export const roundedPolyline = (corners: Pt[], r: number, steps = 10): Pt[] => {
  const out: Pt[] = [corners[0]];
  for (let i = 1; i < corners.length - 1; i++) {
    const p0 = corners[i - 1];
    const p1 = corners[i];
    const p2 = corners[i + 1];
    const d1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const d2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    const a = {x: p1.x + ((p0.x - p1.x) / d1) * rr, y: p1.y + ((p0.y - p1.y) / d1) * rr};
    const b = {x: p1.x + ((p2.x - p1.x) / d2) * rr, y: p1.y + ((p2.y - p1.y) / d2) * rr};
    out.push(a);
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      const u = 1 - t;
      out.push({x: u * u * a.x + 2 * u * t * p1.x + t * t * b.x, y: u * u * a.y + 2 * u * t * p1.y + t * t * b.y});
    }
    out.push(b);
  }
  out.push(corners[corners.length - 1]);
  return out;
};

const pointAlong = (pts: Pt[], t: number): Pt => {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const target = lens[lens.length - 1] * Math.min(1, Math.max(0, t));
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] >= target) {
      const seg = lens[i] - lens[i - 1] || 1;
      const k = (target - lens[i - 1]) / seg;
      return {x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k};
    }
  }
  return pts[pts.length - 1];
};

/** Stroke-drawn polyline with an optional travelling dot. */
export const StrokePolyline: React.FC<{
  points: Pt[];
  draw: number;
  dot?: number;
  dotOpacity?: number;
  color?: string;
  dotColor?: string;
  width?: number;
  dotSize?: number;
}> = ({points, draw, dot, dotOpacity = 1, color = COLORS.ink, dotColor, width = 2, dotSize = 12}) => {
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const p = dot === undefined ? null : pointAlong(points, dot);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        opacity={draw > 0 ? 1 : 0}
      />
      {p ? (
        <g style={{transform: `translate(${p.x}px, ${p.y}px)`}} opacity={dotOpacity}>
          <circle r={dotSize * 1.15} fill={dotColor ?? color} opacity={0.25} />
          <circle r={dotSize / 2} fill={dotColor ?? color} stroke={color} strokeWidth={1.5} />
        </g>
      ) : null}
    </svg>
  );
};

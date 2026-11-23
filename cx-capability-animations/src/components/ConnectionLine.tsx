import React from 'react';
import {colors} from '../tokens';

export type Point = {x: number; y: number};

/**
 * Horizontal fan curve between two points: a cubic bezier whose control
 * points pull out horizontally from each end, so lines leave the source and
 * meet the target square to their edges.
 */
export const fanCurve = (from: Point, to: Point, pull = 0.5): [Point, Point, Point, Point] => {
  const dx = (to.x - from.x) * pull;
  return [from, {x: from.x + dx, y: from.y}, {x: to.x - dx, y: to.y}, to];
};

const bezierAt = ([p0, p1, p2, p3]: [Point, Point, Point, Point], t: number): Point => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
};

/**
 * Point at a fraction 0..1 of the curve's arc length, so anything moving
 * along the curve sits exactly on the drawn stroke at an even pace.
 */
export const pointAlong = (curve: [Point, Point, Point, Point], fraction: number, samples = 240): Point => {
  const pts: Point[] = [];
  const lens: number[] = [0];
  for (let i = 0; i <= samples; i++) {
    pts.push(bezierAt(curve, i / samples));
    if (i > 0) {
      const a = pts[i - 1];
      const b = pts[i];
      lens.push(lens[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
    }
  }
  const target = Math.max(0, Math.min(1, fraction)) * lens[samples];
  let i = 1;
  while (i < samples && lens[i] < target) i++;
  const seg = lens[i] - lens[i - 1] || 1;
  const k = (target - lens[i - 1]) / seg;
  return {x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k};
};

export const curvePath = ([p0, p1, p2, p3]: [Point, Point, Point, Point]): string =>
  `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

/**
 * A curved connection drawn on by stroke dashoffset. `draw` runs 0..1.
 * Render inside a full canvas <svg>.
 */
export const ConnectionLine: React.FC<{
  curve: [Point, Point, Point, Point];
  draw: number;
  strokeWidth?: number;
  color?: string;
}> = ({curve, draw, strokeWidth = 1.5, color = colors.line}) =>
  draw <= 0 ? null : (
    <path
      d={curvePath(curve)}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - draw}
    />
  );

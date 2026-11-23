import React from 'react';
import {colors} from '../../tokens';
import {Point, pointAlong} from '../../components/ConnectionLine';

/**
 * Small dot travelling along a curve. `progress` 0..1 is the fraction of
 * the curve's arc length, so the dot sits exactly on the drawn line.
 */
export const FlowDot: React.FC<{
  curve: [Point, Point, Point, Point];
  progress: number;
  opacity: number;
  size?: number;
  color?: string;
}> = ({curve, progress, opacity, size = 6, color = colors.charcoal}) => {
  if (opacity <= 0) return null;
  const at = pointAlong(curve, progress);
  return (
    <div
      style={{
        position: 'absolute',
        left: at.x - size / 2,
        top: at.y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        opacity,
      }}
    />
  );
};

import React from 'react';
import {colors, radii, shadows} from '../tokens';

export type CardProps = {
  width: number;
  height?: number;
  radius?: number;
  padding?: number | string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/**
 * White surface with the shared 1px border and soft card shadow.
 * Height is passed in (computed from content) rather than measured.
 */
export const Card: React.FC<CardProps> = ({
  width,
  height,
  radius = radii.card,
  padding,
  style,
  children,
}) => (
  <div
    style={{
      position: 'relative',
      boxSizing: 'border-box',
      width,
      height,
      padding,
      borderRadius: radius,
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      boxShadow: shadows.card,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

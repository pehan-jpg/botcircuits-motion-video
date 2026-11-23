import React from 'react';
import {colors, fontFamily, fontWeights, radii} from '../tokens';

export type ChipProps = {
  label: React.ReactNode;
  icon?: React.ReactNode;
  fontSize?: number;
  height?: number;
  paddingX?: number;
  gap?: number;
  radius?: number;
  background?: string;
  color?: string;
  style?: React.CSSProperties;
};

/**
 * Pill shaped label. Defaults to the neutral grey pill in secondary text.
 * Every chip, tag and status pill in the series is built from this.
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  fontSize = 14,
  height = 32,
  paddingX = 12,
  gap = 6,
  radius = radii.pill,
  background = colors.greyPill,
  color = colors.textSecondary,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap,
      boxSizing: 'border-box',
      height,
      paddingLeft: paddingX,
      paddingRight: paddingX,
      borderRadius: radius,
      background,
      color,
      fontFamily,
      fontWeight: fontWeights.medium,
      fontSize,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {icon}
    <span>{label}</span>
  </div>
);

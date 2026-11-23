import React from 'react';
import {colors, fontFamily, fontWeights} from '../tokens';

/** Grey pill naming the customer and booking shared across channels. */
export const ContextBar: React.FC<{
  width: number;
  height?: number;
  initials: string;
  name: string;
  detail: string;
}> = ({width, height = 52, initials, name, detail}) => (
  <div
    style={{
      width,
      height,
      boxSizing: 'border-box',
      borderRadius: height / 2,
      background: colors.greyPill,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      fontFamily,
    }}
  >
    <Initials initials={initials} size={32} />
    <span style={{fontSize: 16, fontWeight: fontWeights.semibold, color: colors.text}}>{name}</span>
    <span style={{width: 1, height: 20, background: colors.line}} />
    <span style={{fontSize: 16, fontWeight: fontWeights.regular, color: colors.textSecondary}}>{detail}</span>
  </div>
);

/** Round avatar with initials. */
export const Initials: React.FC<{
  initials: string;
  size?: number;
  background?: string;
  fontSize?: number;
  color?: string;
  border?: boolean;
}> = ({
  initials,
  size = 28,
  background = colors.surface,
  fontSize = Math.round(size * 0.38),
  color = colors.textSecondary,
  border = true,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background,
      border: border ? `1px solid ${colors.border}` : undefined,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize,
      fontWeight: fontWeights.semibold,
      color,
      flexShrink: 0,
    }}
  >
    {initials}
  </div>
);

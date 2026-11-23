import React from 'react';
import {colors} from '../../tokens';

/**
 * Lime tint highlight behind its content, drawn left to right by `reveal`
 * (0..1). The highlight box is the content box plus `pad`, so it covers
 * exactly what it wraps.
 */
export const HighlightReveal: React.FC<{
  reveal: number;
  pad?: number | string;
  radius?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({reveal, pad = 6, radius = 4, children, style}) => (
  <div style={{position: 'relative', padding: pad, ...style}}>
    {reveal > 0 && (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: colors.limeTint,
          clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0 round ${radius}px)`,
        }}
      />
    )}
    <div style={{position: 'relative'}}>{children}</div>
  </div>
);

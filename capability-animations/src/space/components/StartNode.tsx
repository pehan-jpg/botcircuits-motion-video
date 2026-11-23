import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';

/** Grey pill naming what the process starts from. */
export const StartNode: React.FC<{label: string; width?: number; height?: number}> = ({label, width = 150, height = 56}) => (
  <div
    style={{
      width,
      height,
      borderRadius: height / 2,
      background: colors.greyPill,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: 15,
      fontWeight: fontWeights.medium,
      color: colors.text,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </div>
);

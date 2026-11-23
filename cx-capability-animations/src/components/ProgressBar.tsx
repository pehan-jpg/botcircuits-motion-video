import React from 'react';
import {colors} from '../tokens';

/** Thin progress bar. `value` runs 0..1. */
export const ProgressBar: React.FC<{value: number; width: number | string; height?: number}> = ({
  value,
  width,
  height = 6,
}) => (
  <div
    style={{
      position: 'relative',
      width,
      height,
      borderRadius: height / 2,
      background: colors.greyPill,
      overflow: 'hidden',
    }}
  >
    {value > 0 && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${Math.max(0, Math.min(1, value)) * 100}%`,
          borderRadius: height / 2,
          background: colors.lime,
        }}
      />
    )}
  </div>
);

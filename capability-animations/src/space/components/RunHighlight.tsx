import React from 'react';
import {interpolateColors} from 'remotion';

/**
 * One background rectangle that moves between rows during a test run, so
 * two rows are never highlighted at once. `y` and `color` are computed by
 * the caller from the frame; `amber` (0..1) blends to the pause colour.
 */
export const RunHighlight: React.FC<{
  y: number;
  height: number;
  opacity: number;
  amber: number;
  run: string;
  pause: string;
}> = ({y, height, opacity, amber, run, pause}) =>
  opacity <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        height: height - 1,
        background: interpolateColors(amber, [0, 1], [run, pause]),
        opacity,
      }}
    />
  );

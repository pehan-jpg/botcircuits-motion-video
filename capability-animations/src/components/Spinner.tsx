import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../tokens';

/**
 * Loading ring: a quarter arc rotating on a faint track. Rotation is driven
 * only by the frame number.
 */
export const Spinner: React.FC<{
  size?: number;
  strokeWidth?: number;
  turnsPerSecond?: number;
  trackColor?: string;
  arcColor?: string;
}> = ({
  size = 14,
  strokeWidth = 1.5,
  turnsPerSecond = 1.5,
  trackColor = colors.border,
  arcColor = colors.textSecondary,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const angle = ((frame / fps) * turnsPerSecond * 360) % 360;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{display: 'block', flexShrink: 0}}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={arcColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${c / 4} ${c}`}
        transform={`rotate(${angle - 90} ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

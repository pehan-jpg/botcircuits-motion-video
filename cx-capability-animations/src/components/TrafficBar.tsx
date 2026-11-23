import React from 'react';
import {colors, fontFamily, fontWeights} from '../tokens';

/**
 * Two segment traffic split bar with a label over each end. `reveal` (0..1)
 * draws the bar in from the left; `split` is the right (selected) share 0..1.
 */
export const TrafficBar: React.FC<{
  width: number;
  reveal: number;
  split: number;
  leftLabel: string;
  rightLabel: string;
  leftLabelOpacity?: number;
}> = ({width, reveal, split, leftLabel, rightLabel, leftLabelOpacity = 1}) => {
  const H = 12;
  const label: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    fontFamily,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    lineHeight: '18px',
    color: colors.textSecondary,
    whiteSpace: 'nowrap',
  };
  return (
    <div style={{position: 'relative', width, height: 26 + H}}>
      <div style={{...label, left: 0, opacity: reveal * leftLabelOpacity}}>{leftLabel}</div>
      <div style={{...label, right: 0, opacity: reveal}}>{rightLabel}</div>
      <div style={{position: 'absolute', left: 0, top: 26, width: width * reveal, height: H, borderRadius: H / 2, overflow: 'hidden', display: 'flex'}}>
        <div style={{width: width * (1 - split), height: H, background: colors.line, flexShrink: 0}} />
        <div style={{width: width * split, height: H, background: colors.charcoal, flexShrink: 0}} />
      </div>
    </div>
  );
};

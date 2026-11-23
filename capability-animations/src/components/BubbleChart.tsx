import React from 'react';
import {interpolateColors} from 'remotion';
import {mix} from '../motion';
import {colors, fontFamily, fontWeights} from '../tokens';

export type Bubble = {
  label: string;
  share: number;
  /** Hand placed centre, in chart coordinates (no physics). */
  x: number;
  y: number;
};

/**
 * Diameter from share so that circle AREA is proportional to share:
 * d = maxDiameter * sqrt(share / maxShare).
 */
export const bubbleDiameter = (share: number, maxShare: number, maxDiameter: number) =>
  maxDiameter * Math.sqrt(share / maxShare);

/** One topic circle. `alert` 0..1 shifts it to the amber attention style. */
export const BubbleNode: React.FC<{
  label: string;
  share: number;
  diameter: number;
  x: number;
  y: number;
  appear: number;
  alert?: number;
}> = ({label, share, diameter, x, y, appear, alert = 0}) =>
  appear <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x - diameter / 2,
        top: y - diameter / 2,
        width: diameter,
        height: diameter,
        boxSizing: 'border-box',
        borderRadius: '50%',
        background: interpolateColors(alert, [0, 1], [colors.greyPill, colors.amber]),
        border: `${mix(1, 1.5, alert)}px solid ${interpolateColors(alert, [0, 1], [colors.border, colors.amberText])}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontFamily,
        color: interpolateColors(alert, [0, 1], [colors.text, colors.amberText]),
        opacity: appear,
        transform: `translateY(${mix(12, 0, appear)}px)`,
      }}
    >
      <div style={{fontSize: 15, fontWeight: fontWeights.medium, lineHeight: '20px', whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{fontSize: 18, fontWeight: fontWeights.semibold, lineHeight: '22px', fontVariantNumeric: 'tabular-nums'}}>
        {share}%
      </div>
    </div>
  );

/**
 * Packed bubble chart with fixed, hand placed positions. The cluster is
 * centred in the given box from its computed bounds.
 */
export const BubbleChart: React.FC<{
  bubbles: Bubble[];
  width: number;
  height: number;
  maxDiameter: number;
  appear: number[];
  alert?: number[];
}> = ({bubbles, width, height, maxDiameter, appear, alert = []}) => {
  const maxShare = Math.max(...bubbles.map((b) => b.share));
  const sized = bubbles.map((b) => ({...b, d: bubbleDiameter(b.share, maxShare, maxDiameter)}));
  const { dx, dy } = clusterOffset(sized, width, height);
  return (
    <div style={{position: 'relative', width, height}}>
      {sized.map((b, i) => (
        <BubbleNode
          key={b.label}
          label={b.label}
          share={b.share}
          diameter={b.d}
          x={b.x + dx}
          y={b.y + dy}
          appear={appear[i] ?? 0}
          alert={alert[i] ?? 0}
        />
      ))}
    </div>
  );
};

/** Offset that centres the cluster's bounding box in the chart area. */
export const clusterOffset = (sized: (Bubble & {d: number})[], width: number, height: number) => {
  const minX = Math.min(...sized.map((b) => b.x - b.d / 2));
  const maxX = Math.max(...sized.map((b) => b.x + b.d / 2));
  const minY = Math.min(...sized.map((b) => b.y - b.d / 2));
  const maxY = Math.max(...sized.map((b) => b.y + b.d / 2));
  return {dx: width / 2 - (minX + maxX) / 2, dy: height / 2 - (minY + maxY) / 2};
};

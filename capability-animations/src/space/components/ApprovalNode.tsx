import React from 'react';
import {interpolateColors} from 'remotion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {Initials} from '../../components/ContextBar';
import {TickIcon} from '../../components/Icons';

/**
 * Step waiting for a person. Amber while pending; `approved` (0..1) turns
 * it white with the standard border, and the title crossfades to a ticked
 * "Approved" by `labelMix`. `pulse` (0..1) briefly deepens the border.
 */
export const ApprovalNode: React.FC<{
  pendingLabel: string;
  approvedLabel: string;
  initials: string;
  name: string;
  approved: number;
  labelMix: number;
  tick: number;
  pulse: number;
  width?: number;
  height?: number;
}> = ({pendingLabel, approvedLabel, initials, name, approved, labelMix, tick, pulse, width = 160, height = 96}) => {
  const pendingBorder = interpolateColors(pulse, [0, 1], [colors.amberBorder, colors.amberText]);
  const title: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 20,
    fontSize: 15,
    fontWeight: fontWeights.semibold,
    whiteSpace: 'nowrap',
  };
  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        borderRadius: 16,
        background: interpolateColors(approved, [0, 1], [colors.amber, colors.surface]),
        border: `1px solid ${interpolateColors(approved, [0, 1], [pendingBorder, colors.border])}`,
        padding: '18px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily,
      }}
    >
      <div style={{position: 'relative', height: 20}}>
        <div style={{...title, color: colors.amberText, opacity: 1 - labelMix}}>{pendingLabel}</div>
        {labelMix > 0 && (
          <div style={{...title, color: colors.charcoal, opacity: labelMix}}>
            <TickIcon size={16} strokeWidth={1.75} color={colors.charcoal} draw={tick} />
            {approvedLabel}
          </div>
        )}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <Initials initials={initials} size={28} background={colors.border} fontSize={12} color={colors.text} border={false} />
        <span style={{fontSize: 14, color: colors.text, whiteSpace: 'nowrap'}}>{name}</span>
      </div>
    </div>
  );
};

import React from 'react';
import {colors, fontFamily, fontWeights} from '../tokens';
import {TickIcon} from './Icons';

/** Lime tint confirmation pill with a drawn charcoal tick. */
export const RolledOutPill: React.FC<{label: string; tick: number}> = ({label, tick}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      height: 48,
      padding: '0 22px',
      borderRadius: 24,
      background: colors.limeTint,
      color: colors.charcoal,
      fontFamily,
      fontSize: 16,
      fontWeight: fontWeights.medium,
      whiteSpace: 'nowrap',
    }}
  >
    <TickIcon size={18} strokeWidth={1.75} color={colors.charcoal} draw={tick} />
    {label}
  </div>
);

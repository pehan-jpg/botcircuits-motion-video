import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {TickIcon} from '../../components/Icons';

/** Charcoal outcome pill with a white tick. */
export const SettledPill: React.FC<{label: string; tick: number}> = ({label, tick}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: 40,
      padding: '0 18px',
      borderRadius: 20,
      background: colors.charcoal,
      color: '#ffffff',
      fontFamily,
      fontSize: 15,
      fontWeight: fontWeights.medium,
      whiteSpace: 'nowrap',
    }}
  >
    <TickIcon size={16} strokeWidth={1.75} color="#ffffff" draw={tick} />
    {label}
  </div>
);

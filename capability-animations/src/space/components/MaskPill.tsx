import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {ChannelGlyph} from '../../components/ChannelGlyph';

/** Charcoal pill for the masking step. */
export const MaskPill: React.FC<{label: string; width?: number; height?: number}> = ({label, width = 280, height = 64}) => (
  <div
    style={{
      width,
      height,
      borderRadius: height / 2,
      background: colors.charcoal,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      fontFamily,
      fontSize: 15,
      fontWeight: fontWeights.medium,
    }}
  >
    <ChannelGlyph kind="shield" size={18} color="#ffffff" />
    {label}
  </div>
);

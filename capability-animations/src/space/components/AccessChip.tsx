import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {ChannelGlyph} from '../../components/ChannelGlyph';

/** Bordered note with a lock; wraps to two lines if needed. */
export const AccessChip: React.FC<{text: string; width: number}> = ({text, width}) => (
  <div
    style={{
      width,
      minHeight: 44,
      boxSizing: 'border-box',
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 16px',
      fontFamily,
      fontSize: 14,
      fontWeight: fontWeights.medium,
      lineHeight: '20px',
      color: colors.text,
    }}
  >
    <ChannelGlyph kind="lock" size={16} />
    <span>{text}</span>
  </div>
);

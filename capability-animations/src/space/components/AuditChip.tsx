import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {ChannelGlyph} from '../../components/ChannelGlyph';

/** Grey rule chip with a lock. */
export const AuditChip: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      height: 48,
      padding: '0 22px',
      borderRadius: 24,
      background: colors.greyPill,
      fontFamily,
      fontSize: 15,
      fontWeight: fontWeights.medium,
      color: colors.text,
      whiteSpace: 'nowrap',
    }}
  >
    <ChannelGlyph kind="lock" size={16} />
    {text}
  </div>
);

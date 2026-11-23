import React from 'react';
import {colors, fontFamily} from '../../tokens';
import {ChannelGlyph, ChannelKind} from '../../components/ChannelGlyph';

/** Quiet run note: glyph and text on a pale grey band. */
export const NoticeRow: React.FC<{glyph: ChannelKind; text: string; height?: number}> = ({glyph, text, height = 48}) => (
  <div
    style={{
      height,
      borderRadius: 12,
      background: colors.traceFill,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 16px',
      fontFamily,
      fontSize: 15,
      color: colors.textSecondary,
    }}
  >
    <ChannelGlyph kind={glyph} size={18} color={colors.textSecondary} />
    {text}
  </div>
);

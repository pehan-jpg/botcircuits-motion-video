import React from 'react';
import {interpolateColors} from 'remotion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {ChannelGlyph, ChannelKind} from '../../components/ChannelGlyph';

/**
 * Inline source reference: glyph, label and a numbered badge. Grey until
 * `active` (0..1) turns it charcoal with white text.
 */
export const CitationChip: React.FC<{kind: ChannelKind; label: string; number: number; active: number; opacity: number}> = ({
  kind,
  label,
  number,
  active,
  opacity,
}) => {
  const fg = interpolateColors(active, [0, 1], [colors.text, '#ffffff']);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 28,
        padding: '0 6px 0 10px',
        borderRadius: 10,
        background: interpolateColors(active, [0, 1], [colors.greyPill, colors.charcoal]),
        color: fg,
        fontFamily,
        fontSize: 13,
        fontWeight: fontWeights.medium,
        lineHeight: '28px',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        opacity,
      }}
    >
      <ChannelGlyph kind={kind} size={16} color={fg} />
      {label}
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: interpolateColors(active, [0, 1], [colors.charcoal, '#ffffff']),
          color: interpolateColors(active, [0, 1], ['#ffffff', colors.charcoal]),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: fontWeights.semibold,
          lineHeight: 1,
        }}
      >
        {number}
      </span>
    </span>
  );
};

import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {ChannelIconBox, ChannelKind} from '../../components/ChannelGlyph';

export const TRIGGER_ROW = {height: 96, padX: 20} as const;

/** One trigger: grey glyph tile, name and detail. `active` outlines it. */
export const TriggerRow: React.FC<{width: number; kind: ChannelKind; name: string; detail: string; active?: number}> = ({
  width,
  kind,
  name,
  detail,
  active = 0,
}) => (
  <div
    style={{
      position: 'relative',
      width,
      height: TRIGGER_ROW.height,
      boxSizing: 'border-box',
      borderBottom: `1px solid ${colors.border}`,
      fontFamily,
    }}
  >
    {active > 0 && (
      <div style={{position: 'absolute', inset: '8px 10px', borderRadius: 12, border: `1.5px solid ${colors.charcoal}`, opacity: active}} />
    )}
    <div style={{position: 'absolute', inset: `0 ${TRIGGER_ROW.padX}px`, display: 'flex', alignItems: 'center', gap: 14}}>
      <ChannelIconBox kind={kind} size={44} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 3}}>
        <div style={{fontSize: 16, fontWeight: fontWeights.semibold, lineHeight: '20px', color: colors.text, whiteSpace: 'nowrap'}}>{name}</div>
        <div style={{fontSize: 14, lineHeight: '18px', color: colors.textSecondary, whiteSpace: 'nowrap'}}>{detail}</div>
      </div>
    </div>
  </div>
);

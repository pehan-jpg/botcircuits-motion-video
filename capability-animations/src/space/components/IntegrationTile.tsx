import React from 'react';
import {colors, fontFamily, fontWeights, shadows} from '../../tokens';
import {ChannelIconBox, ChannelKind} from '../../components/ChannelGlyph';

export const TILE = {width: 600, height: 84, padX: 20, radius: 16} as const;

/**
 * Connected system tile: grey glyph tile, name, detail and a status pill on
 * the right. Extra content (such as tool chips) can sit in a reserved area
 * below the main row via `children`, with the tile height set by `height`.
 */
export const IntegrationTile: React.FC<{
  kind: ChannelKind;
  name: string;
  detail: string;
  status: React.ReactNode;
  height?: number;
  children?: React.ReactNode;
}> = ({kind, name, detail, status, height = TILE.height, children}) => (
  <div
    style={{
      position: 'relative',
      width: TILE.width,
      height,
      boxSizing: 'border-box',
      borderRadius: TILE.radius,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      boxShadow: shadows.card,
      fontFamily,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: TILE.padX - 1,
        right: TILE.padX - 1,
        top: -1,
        height: TILE.height,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <ChannelIconBox kind={kind} size={44} />
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
        <div style={{fontSize: 18, fontWeight: fontWeights.semibold, lineHeight: '22px', letterSpacing: '-0.01em', color: colors.text, whiteSpace: 'nowrap'}}>
          {name}
        </div>
        <div style={{fontSize: 14, lineHeight: '18px', color: colors.textSecondary, whiteSpace: 'nowrap'}}>{detail}</div>
      </div>
      {status}
    </div>
    {children && <div style={{position: 'absolute', left: TILE.padX + 44 + 14 - 1, top: TILE.height - 6}}>{children}</div>}
  </div>
);

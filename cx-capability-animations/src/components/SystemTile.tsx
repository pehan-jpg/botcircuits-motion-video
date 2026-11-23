import React from 'react';
import {colors, fontFamily, fontWeights, radii, shadows} from '../tokens';
import {StatusPill, StatusPillProps} from './StatusPill';

export const SYSTEM_TILE = {
  width: 520,
  height: 96,
  radius: 16,
  padX: 24,
  iconBox: 44,
  iconBoxRadius: 12,
  icon: 22,
  iconGap: 16,
  nameSize: 22,
  detailSize: 16,
} as const;

export type SystemTileProps = {
  icon: React.FC<{size?: number}>;
  name: string;
  /** Default secondary line. */
  detail: string;
  /** Optional replacement secondary line, crossfaded in by `resultMix`. */
  result?: string;
  /** 0..1 crossfade from `detail` to `result`. */
  resultMix?: number;
  /** 0..1 opacity of the lime tint highlight behind `result`. */
  resultHighlight?: number;
  status: StatusPillProps;
  style?: React.CSSProperties;
};

/**
 * One connected system: grey icon box, name, secondary line and a status
 * pill on the right. Purely presentational; all state comes in as numbers.
 */
export const SystemTile: React.FC<SystemTileProps> = ({
  icon: Icon,
  name,
  detail,
  result,
  resultMix = 0,
  resultHighlight = 0,
  status,
  style,
}) => (
  <div
    style={{
      position: 'relative',
      boxSizing: 'border-box',
      width: SYSTEM_TILE.width,
      height: SYSTEM_TILE.height,
      borderRadius: SYSTEM_TILE.radius,
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      boxShadow: shadows.card,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: SYSTEM_TILE.padX,
      paddingRight: SYSTEM_TILE.padX,
      fontFamily,
      ...style,
    }}
  >
    <div
      style={{
        width: SYSTEM_TILE.iconBox,
        height: SYSTEM_TILE.iconBox,
        borderRadius: SYSTEM_TILE.iconBoxRadius,
        background: colors.greyPill,
        color: colors.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={SYSTEM_TILE.icon} />
    </div>
    <div style={{marginLeft: SYSTEM_TILE.iconGap, display: 'flex', flexDirection: 'column', gap: 2, flex: 1}}>
      <div
        style={{
          fontSize: SYSTEM_TILE.nameSize,
          fontWeight: fontWeights.semibold,
          color: colors.text,
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
      <div
        style={{
          position: 'relative',
          height: Math.round(SYSTEM_TILE.detailSize * 1.4),
          fontSize: SYSTEM_TILE.detailSize,
          fontWeight: fontWeights.regular,
          color: colors.textSecondary,
          lineHeight: 1.4,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{position: 'absolute', left: 0, top: 0, opacity: 1 - resultMix}}>{detail}</span>
        {result && resultMix > 0 && (
          <span style={{position: 'absolute', left: 0, top: 0, opacity: resultMix}}>
            <span
              style={{
                position: 'absolute',
                left: -6,
                right: -6,
                top: -1,
                bottom: -1,
                borderRadius: radii.highlight,
                background: colors.limeTint,
                opacity: resultHighlight,
              }}
            />
            <span style={{position: 'relative'}}>{result}</span>
          </span>
        )}
      </div>
    </div>
    <StatusPill {...status} />
  </div>
);

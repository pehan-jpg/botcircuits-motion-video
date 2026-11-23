import React from 'react';
import {mix} from '../motion';
import {colors, fontFamily, fontWeights, shadows} from '../tokens';
import {ChannelIconBox, ChannelKind} from './ChannelGlyph';
import type {Rect} from './Veil';

export const CHANNEL_ROW = {
  height: 72,
  radius: 14,
  padX: 14,
  iconGap: 14,
  nameSize: 18,
  /** Header band height once morphed into a mockup card. */
  headerHeight: 72,
  cardRadius: 20,
  cardPadX: 20,
} as const;

export type ChannelRowProps = {
  kind: ChannelKind;
  name: string;
  /** Optional secondary line under the name. */
  detail?: string;
  /** Dashed outline (for the "More channels" row). */
  dashed?: boolean;
  /** Status pill on the right edge. */
  status?: React.ReactNode;
  /** Row rectangle. */
  from: Rect;
  /** Mockup card rectangle. */
  to?: Rect;
  /**
   * 0..1 morph from row to card. The same element interpolates its left,
   * top, width, height and radius, and its header contents ride along, so
   * the row visibly becomes the card.
   */
  morph?: number;
  /** Card body, revealed under the header band. */
  body?: React.ReactNode;
  bodyOpacity?: number;
  style?: React.CSSProperties;
};

export const ChannelRow: React.FC<ChannelRowProps> = ({
  kind,
  name,
  detail,
  dashed = false,
  status,
  from,
  to = from,
  morph = 0,
  body,
  bodyOpacity = 0,
  style,
}) => {
  const x = mix(from.x, to.x, morph);
  const y = mix(from.y, to.y, morph);
  const width = mix(from.width, to.width, morph);
  const height = mix(from.height, to.height, morph);
  const radius = mix(from.radius, to.radius, morph);
  const padX = mix(CHANNEL_ROW.padX, CHANNEL_ROW.cardPadX, morph);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        boxSizing: 'border-box',
        borderRadius: radius,
        background: colors.surface,
        border: dashed ? `1.5px dashed ${colors.line}` : `1px solid ${colors.border}`,
        boxShadow: dashed ? undefined : shadows.card,
        overflow: 'hidden',
        fontFamily,
        ...style,
      }}
    >
      {body && bodyOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: -1,
            top: CHANNEL_ROW.headerHeight - 1,
            width: to.width,
            height: to.height - CHANNEL_ROW.headerHeight,
            borderTop: `1px solid ${colors.border}`,
            boxSizing: 'border-box',
            opacity: bodyOpacity,
          }}
        >
          {body}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: padX - 1,
          right: padX - 1,
          top: -1,
          height: CHANNEL_ROW.headerHeight,
          display: 'flex',
          alignItems: 'center',
          gap: CHANNEL_ROW.iconGap,
        }}
      >
        <ChannelIconBox kind={kind} />
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0}}>
          <div
            style={{
              fontSize: CHANNEL_ROW.nameSize,
              fontWeight: fontWeights.semibold,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              color: colors.text,
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </div>
          {detail && (
            <div
              style={{
                fontSize: 15,
                fontWeight: fontWeights.regular,
                lineHeight: 1.3,
                color: colors.textSecondary,
                whiteSpace: 'nowrap',
              }}
            >
              {detail}
            </div>
          )}
        </div>
        {status}
      </div>
    </div>
  );
};

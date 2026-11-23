import React from 'react';
import {interpolateColors} from 'remotion';
import {colors, fontFamily, fontWeights} from '../tokens';
import {ChannelIconBox, ChannelKind} from './ChannelGlyph';

export const CONVERSATION_ROW = {height: 88, padX: 20, tile: 44, gap: 14} as const;

/**
 * One live conversation: channel tile, name, one line snippet, and on the
 * right either a ticking duration or a status badge, then a lime live dot.
 */
export const ConversationRow: React.FC<{
  width: number;
  kind: ChannelKind;
  name: string;
  snippet: string;
  /** Replacement snippet, crossfaded in by `snippetMix`. */
  altSnippet?: string;
  snippetMix?: number;
  duration: string;
  durationOpacity?: number;
  /** Badge shown in place of the duration. */
  badge?: React.ReactNode;
  /** 0..1 attention outline and pale amber fill. */
  highlight?: number;
  style?: React.CSSProperties;
}> = ({
  width,
  kind,
  name,
  snippet,
  altSnippet,
  snippetMix = 0,
  duration,
  durationOpacity = 1,
  badge,
  highlight = 0,
  style,
}) => {
  const snippetStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    fontSize: 15,
    fontWeight: fontWeights.regular,
    lineHeight: '20px',
    color: colors.textSecondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  return (
    <div
      style={{
        position: 'relative',
        width,
        height: CONVERSATION_ROW.height,
        boxSizing: 'border-box',
        borderBottom: `1px solid ${colors.border}`,
        fontFamily,
        ...style,
      }}
    >
      {highlight > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: '6px 10px',
            borderRadius: 12,
            background: colors.amberRowFill,
            border: `1.5px solid ${interpolateColors(highlight, [0, 1], [colors.amberRowFill, colors.charcoal])}`,
            opacity: highlight,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: `0 ${CONVERSATION_ROW.padX}px`,
          display: 'flex',
          alignItems: 'center',
          gap: CONVERSATION_ROW.gap,
        }}
      >
        <ChannelIconBox kind={kind} size={CONVERSATION_ROW.tile} />
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3}}>
          <div style={{fontSize: 16, fontWeight: fontWeights.semibold, lineHeight: '20px', color: colors.text, whiteSpace: 'nowrap'}}>
            {name}
          </div>
          <div style={{position: 'relative', height: 20}}>
            <div style={{...snippetStyle, opacity: 1 - snippetMix}}>{snippet}</div>
            {altSnippet && snippetMix > 0 && <div style={{...snippetStyle, opacity: snippetMix}}>{altSnippet}</div>}
          </div>
        </div>
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 52}}>
          <span
            style={{
              fontSize: 14,
              fontWeight: fontWeights.medium,
              color: colors.textSecondary,
              fontVariantNumeric: 'tabular-nums',
              opacity: durationOpacity,
            }}
          >
            {duration}
          </span>
          {badge && <div style={{position: 'absolute', right: 0, top: '50%', marginTop: -14}}>{badge}</div>}
        </div>
        <div style={{width: 6, height: 6, borderRadius: '50%', background: colors.lime, flexShrink: 0}} />
      </div>
    </div>
  );
};

/** mm:ss from whole seconds. */
export const mmss = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {Chip} from '../../components/Chip';
import {ChannelGlyph, ChannelKind} from '../../components/ChannelGlyph';
import {HighlightReveal} from './HighlightReveal';

export const PREVIEW = {width: 296, height: 250, header: 44, pad: 14} as const;

/** Source preview frame: glyph and title header, then a body. */
export const PreviewCard: React.FC<{kind: ChannelKind; title: string; children: React.ReactNode}> = ({kind, title, children}) => (
  <div
    style={{
      width: PREVIEW.width,
      height: PREVIEW.height,
      boxSizing: 'border-box',
      borderRadius: 16,
      border: `1px solid ${colors.border}`,
      background: '#fafaf7',
      overflow: 'hidden',
      fontFamily,
    }}
  >
    <div
      style={{
        height: PREVIEW.header,
        boxSizing: 'border-box',
        borderBottom: `1px solid ${colors.border}`,
        padding: `0 ${PREVIEW.pad}px`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <ChannelGlyph kind={kind} size={16} />
      <span style={{fontSize: 14, fontWeight: fontWeights.semibold, color: colors.text, whiteSpace: 'nowrap'}}>{title}</span>
    </div>
    <div style={{padding: PREVIEW.pad}}>{children}</div>
  </div>
);

const Bar: React.FC<{width: string | number; mt?: number}> = ({width, mt = 0}) => (
  <div style={{width, height: 8, borderRadius: 4, background: colors.border, marginTop: mt}} />
);

/** Document page: grey text bars around one highlighted passage. */
export const DocumentPreview: React.FC<{passage: string; reveal: number}> = ({passage, reveal}) => (
  <div>
    <Bar width="92%" />
    <Bar width="70%" mt={10} />
    <HighlightReveal reveal={reveal} style={{marginTop: 12, marginLeft: -6, marginRight: -6}}>
      <div style={{fontSize: 14, lineHeight: '20px', color: colors.text}}>{passage}</div>
    </HighlightReveal>
    <Bar width="88%" mt={12} />
    <Bar width="95%" mt={10} />
    <Bar width="60%" mt={10} />
  </div>
);

/** Mini table with one highlighted row. */
export const TablePreview: React.FC<{columns: string[]; rows: string[][]; highlightRow: number; reveal: number}> = ({
  columns,
  rows,
  highlightRow,
  reveal,
}) => {
  const grid = '1.4fr 1fr 0.7fr';
  const cell: React.CSSProperties = {display: 'grid', gridTemplateColumns: grid, alignItems: 'center', padding: '0 10px'};
  return (
    <div>
      <div style={{...cell, height: 22, fontSize: 12, fontWeight: fontWeights.medium, color: colors.textSecondary}}>
        {columns.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      {rows.map((r, i) => {
        const content = (
          <div style={{...cell, height: 36, fontSize: 13, color: colors.text, padding: 0}}>
            {r.map((v, k) => (
              <span key={k}>{v}</span>
            ))}
          </div>
        );
        return i === highlightRow ? (
          <HighlightReveal key={r[0]} reveal={reveal} pad="0 10px" radius={6}>
            {content}
          </HighlightReveal>
        ) : (
          <div key={r[0]} style={{padding: '0 10px', borderTop: i > 0 && i !== highlightRow + 1 ? `1px solid ${colors.border}` : undefined}}>
            {content}
          </div>
        );
      })}
    </div>
  );
};

/** Scanned page with a highlighted total, and a "text read" chip. */
export const ImagePreview: React.FC<{total: string; reveal: number; chip: string; chipIn: number}> = ({total, reveal, chip, chipIn}) => (
  <div>
    <div
      style={{
        boxSizing: 'border-box',
        height: 128,
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        padding: '14px 14px 0',
      }}
    >
      <Bar width="55%" />
      <Bar width="85%" mt={10} />
      <Bar width="75%" mt={10} />
      <HighlightReveal reveal={reveal} pad="4px 6px" style={{marginTop: 12, marginLeft: -6, display: 'inline-block'}}>
        <div style={{fontSize: 14, fontWeight: fontWeights.medium, lineHeight: '20px', color: colors.text, whiteSpace: 'nowrap'}}>{total}</div>
      </HighlightReveal>
    </div>
    <div style={{marginTop: 12, opacity: chipIn}}>
      <Chip label={chip} icon={<ChannelGlyph kind="eye" size={14} />} fontSize={12} height={26} paddingX={10} gap={6} color={colors.text} />
    </div>
  </div>
);

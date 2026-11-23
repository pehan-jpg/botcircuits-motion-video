import React from 'react';
import {mix} from '../motion';
import {colors, fontFamily, fontWeights} from '../tokens';
import {Chip} from './Chip';

export const CONTEXT_CARD = {pad: 20, head: 44, chipGap: 12, chip: 28} as const;
export const contextCardHeight = CONTEXT_CARD.pad * 2 + CONTEXT_CARD.head + CONTEXT_CARD.chipGap + CONTEXT_CARD.chip;

/** Summary attached when a person takes a conversation: who, and the facts. */
export const ContextCard: React.FC<{
  avatar: React.ReactNode;
  title: string;
  subtitle: string;
  chips: string[];
  /** 0..1 appearance of each chip. */
  chipIn: number[];
}> = ({avatar, title, subtitle, chips, chipIn}) => (
  <div
    style={{
      boxSizing: 'border-box',
      height: contextCardHeight,
      padding: CONTEXT_CARD.pad,
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      fontFamily,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 12, height: CONTEXT_CARD.head}}>
      {avatar}
      <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <div style={{fontSize: 16, fontWeight: fontWeights.semibold, lineHeight: '20px', color: colors.text}}>{title}</div>
        <div style={{fontSize: 15, fontWeight: fontWeights.regular, lineHeight: '20px', color: colors.textSecondary}}>{subtitle}</div>
      </div>
    </div>
    <div style={{display: 'flex', gap: 8, marginTop: CONTEXT_CARD.chipGap}}>
      {chips.map((c, i) => (
        <div key={c} style={{opacity: chipIn[i], transform: `translateY(${mix(6, 0, chipIn[i])}px)`}}>
          <Chip label={c} fontSize={14} height={CONTEXT_CARD.chip} paddingX={12} />
        </div>
      ))}
    </div>
  </div>
);

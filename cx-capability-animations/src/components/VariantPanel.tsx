import React from 'react';
import {colors, fontFamily, fontWeights} from '../tokens';
import {Chip} from './Chip';
import {Counter} from './Counter';

/**
 * One side of an A/B test: title, metric label, rolling percentage and a
 * bar that fills to the same value. `winner` (0..1) adds the lime border
 * and the uplift chip.
 */
export const VariantPanel: React.FC<{
  width: number;
  height: number;
  title: string;
  label: string;
  value: number;
  fill: string;
  winner?: number;
  winnerChip?: string;
  style?: React.CSSProperties;
}> = ({width, height, title, label, value, fill, winner = 0, winnerChip, style}) => (
  <div
    style={{
      position: 'relative',
      width,
      height,
      boxSizing: 'border-box',
      padding: 36,
      borderRadius: 16,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      fontFamily,
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}
  >
    {winner > 0 && (
      <div
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 16,
          border: `1.5px solid ${colors.lime}`,
          opacity: winner,
        }}
      />
    )}
    <div style={{fontSize: 20, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>{title}</div>
    <div style={{marginTop: 28}}>
      <Counter
        value={value}
        suffix="%"
        label={label}
        align="left"
        labelSize={16}
        numberSize={72}
        numberWidth={150}
        labelGap={10}
        adornment={
          winnerChip && winner > 0 ? (
            <div style={{opacity: winner}}>
              <Chip label={winnerChip} fontSize={15} height={32} paddingX={12} background={colors.limeTint} color={colors.charcoal} />
            </div>
          ) : undefined
        }
      />
    </div>
    <div style={{marginTop: 'auto', height: 10, borderRadius: 5, background: colors.greyPill, overflow: 'hidden'}}>
      <div style={{width: `${Math.max(0, Math.min(100, value))}%`, height: 10, borderRadius: 5, background: fill}} />
    </div>
  </div>
);

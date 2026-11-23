import React from 'react';
import {colors, fontFamily, fontWeights} from '../tokens';

export type CounterProps = {
  /** Current value; rounded to a whole number every frame so it rolls. */
  value: number;
  suffix?: string;
  label: string;
  /** Replacement label, crossfaded in by `labelMix`. */
  altLabel?: string;
  labelMix?: number;
  /** 0..1 opacity of the lime tint highlight behind the number. */
  highlight?: number;
};

/** Right aligned label above a large number with tabular figures. */
export const Counter: React.FC<CounterProps> = ({
  value,
  suffix = '',
  label,
  altLabel,
  labelMix = 0,
  highlight = 0,
}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily}}>
    <div
      style={{
        position: 'relative',
        height: 20,
        width: 200,
        fontSize: 14,
        fontWeight: fontWeights.regular,
        lineHeight: '20px',
        color: colors.textSecondary,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{position: 'absolute', right: 0, top: 0, opacity: 1 - labelMix}}>{label}</span>
      {altLabel && labelMix > 0 && (
        <span style={{position: 'absolute', right: 0, top: 0, opacity: labelMix}}>{altLabel}</span>
      )}
    </div>
    <div style={{position: 'relative', marginTop: 2}}>
      {highlight > 0 && (
        <div
          style={{
            position: 'absolute',
            left: -10,
            right: -10,
            top: 0,
            bottom: 0,
            borderRadius: 8,
            background: colors.limeTint,
            opacity: highlight,
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          fontSize: 40,
          fontWeight: fontWeights.semibold,
          lineHeight: '48px',
          letterSpacing: '-0.02em',
          color: colors.text,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {Math.round(value)}
        {suffix}
      </div>
    </div>
  </div>
);

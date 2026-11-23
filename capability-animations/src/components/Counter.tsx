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
  /** Layout options; defaults are the Simulate header counter. */
  align?: 'left' | 'right';
  numberSize?: number;
  labelSize?: number;
  /** Fixed width for the number so it never jitters as digits change. */
  numberWidth?: number;
  /** Content placed beside the number (for example a chip). */
  adornment?: React.ReactNode;
  labelGap?: number;
  /** Optional number formatting (for example thousands separators). */
  format?: (n: number) => string;
  /** Hide the label row entirely. Defaults to shown. */
  showLabel?: boolean;
  numberWeight?: number;
  numberColor?: string;
  numberLetterSpacing?: string;
};

/** Right aligned label above a large number with tabular figures. */
export const Counter: React.FC<CounterProps> = ({
  value,
  suffix = '',
  label,
  altLabel,
  labelMix = 0,
  highlight = 0,
  align = 'right',
  numberSize = 40,
  labelSize = 14,
  numberWidth,
  adornment,
  labelGap = 2,
  format = (n: number) => String(n),
  showLabel = true,
  numberWeight = fontWeights.semibold,
  numberColor = colors.text,
  numberLetterSpacing = '-0.02em',
}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : 'flex-start', fontFamily}}>
    {showLabel && (<div
      style={{
        position: 'relative',
        height: Math.round(labelSize * 1.43),
        width: align === 'right' ? 200 : 360,
        fontSize: labelSize,
        fontWeight: fontWeights.regular,
        lineHeight: `${Math.round(labelSize * 1.43)}px`,
        color: colors.textSecondary,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{position: 'absolute', [align]: 0, top: 0, opacity: 1 - labelMix}}>{label}</span>
      {altLabel && labelMix > 0 && (
        <span style={{position: 'absolute', [align]: 0, top: 0, opacity: labelMix}}>{altLabel}</span>
      )}
    </div>)}
    <div style={{position: 'relative', marginTop: showLabel ? labelGap : 0, display: 'flex', alignItems: 'center', gap: 16}}>
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
          width: numberWidth,
          fontSize: numberSize,
          fontWeight: numberWeight,
          lineHeight: `${Math.round(numberSize * 1.2)}px`,
          letterSpacing: numberLetterSpacing,
          color: numberColor,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {format(Math.round(value))}
        {suffix}
      </div>
      {adornment}
    </div>
  </div>
);

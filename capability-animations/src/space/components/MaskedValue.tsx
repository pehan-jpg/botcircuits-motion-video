import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';

/** Grey chip standing in for a hidden value. */
export const MaskChip: React.FC<{label: string}> = ({label}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 32,
      padding: '0 12px',
      borderRadius: 10,
      background: colors.greyPill,
      color: colors.text,
      fontFamily,
      fontSize: 15,
      fontWeight: fontWeights.medium,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

/** Real value that crossfades into its grey masked chip by `mask` (0..1). */
export const MaskedValue: React.FC<{value: string; masked: string; mask: number}> = ({value, masked, mask}) => (
  <div style={{position: 'relative', height: 32, display: 'flex', alignItems: 'center'}}>
    <span style={{fontFamily, fontSize: 17, fontWeight: fontWeights.medium, color: colors.text, whiteSpace: 'nowrap', opacity: 1 - mask}}>{value}</span>
    {mask > 0 && (
      <span style={{position: 'absolute', left: 0, top: 0, opacity: mask}}>
        <MaskChip label={masked} />
      </span>
    )}
  </div>
);

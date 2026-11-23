import React from 'react';
import {colors, fontFamily, fontWeights} from '../tokens';

/**
 * "N live" with a vertical roll between values. `steps[k]` (0..1) rolls
 * from values[k] to values[k + 1]; the outgoing number slides up and out
 * while the next slides up into place.
 */
export const LiveCounter: React.FC<{values: number[]; steps: number[]; suffix?: string}> = ({
  values,
  steps,
  suffix = ' live',
}) => {
  const H = 22;
  // The active step is the last one that has started.
  let k = 0;
  for (let i = 0; i < steps.length; i++) if (steps[i] > 0) k = i;
  const p = steps[k] ?? 0;
  const current = values[k];
  const next = values[k + 1] ?? current;
  const text: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    top: 0,
    height: H,
    lineHeight: `${H}px`,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  };
  return (
    <div style={{display: 'flex', alignItems: 'center', fontFamily, fontSize: 16, fontWeight: fontWeights.medium, color: colors.text}}>
      <div style={{position: 'relative', height: H, width: 22, overflow: 'hidden'}}>
        <span style={{...text, transform: `translateY(${-p * H}px)`, opacity: 1 - p}}>{current}</span>
        {p > 0 && <span style={{...text, transform: `translateY(${(1 - p) * H}px)`, opacity: p}}>{next}</span>}
      </div>
      <span style={{whiteSpace: 'pre'}}>{suffix}</span>
    </div>
  );
};

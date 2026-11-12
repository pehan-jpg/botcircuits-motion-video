import React from 'react';
import {ease} from '../theme';
import {f30} from '../timeline';

/**
 * Vertical "roll" between a list of values. Each value change slides the old
 * value up and out while the new one slides up from below, with a fade.
 * Characters are split into columns so only changed characters roll.
 */
export const Roll: React.FC<{
  values: readonly string[];
  /** Absolute frame at which each value becomes current. */
  at: readonly number[];
  frame: number;
  duration?: number;
  /** Height of one line (px). */
  lineHeight: number;
  /** Per-column stagger so digits cascade slightly. */
  stagger?: number;
  style?: React.CSSProperties;
  /** Fixed character cell width (monospace). */
  charWidth: number;
}> = ({values, at, frame, duration = f30(10), lineHeight, stagger = f30(1), style, charWidth}) => {
  let idx = -1;
  for (let i = 0; i < at.length; i++) if (frame >= at[i]) idx = i;
  if (idx < 0) return null;
  const current = values[idx];
  const previous = idx > 0 ? values[idx - 1] : '';
  const cols = Math.max(current.length, previous.length);
  // right-align both strings so units stay in place
  const cur = current.padStart(cols, ' ');
  const prev = previous.padStart(cols, ' ');

  return (
    <span style={{display: 'inline-flex', height: lineHeight, overflow: 'hidden', ...style}}>
      {Array.from({length: cols}).map((_, c) => {
        const same = cur[c] === prev[c];
        const p = same ? 1 : ease(frame, [at[idx] + c * stagger, at[idx] + c * stagger + duration], [0, 1]);
        return (
          <span
            key={c}
            style={{
              position: 'relative',
              display: 'inline-block',
              width: charWidth,
              height: lineHeight,
            }}
          >
            {!same ? (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  lineHeight: `${lineHeight}px`,
                  opacity: 1 - p,
                  transform: `translateY(${-p * lineHeight * 0.8}px)`,
                }}
              >
                {prev[c]}
              </span>
            ) : null}
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                lineHeight: `${lineHeight}px`,
                opacity: p,
                transform: `translateY(${(1 - p) * lineHeight * 0.8}px)`,
              }}
            >
              {cur[c]}
            </span>
          </span>
        );
      })}
    </span>
  );
};

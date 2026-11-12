import React from 'react';
import {random} from 'remotion';
import {COLORS} from '../theme';
import {sec} from '../timeline';

/**
 * Character schedule with +/-1 frame jitter per character.
 * Character i lands at start + i * perChar + jitter_i (jitter in {-1, 0, 1}),
 * kept monotonic. Returns how many characters are visible at `frame`.
 */
export const typedCount = (frame: number, start: number, length: number, perChar: number, seed = 'type'): number => {
  let last = -Infinity;
  let count = 0;
  for (let i = 0; i < length; i++) {
    const jitter = Math.round(random(`${seed}-${i}`) * 2 - 1);
    const t = Math.max(last, start + i * perChar + (i === 0 ? 0 : jitter));
    last = t;
    if (frame >= t) count = i + 1;
    else break;
  }
  return count;
};

/** Frame at which the last character lands (for sequencing what comes after). */
export const typingEnd = (start: number, length: number, perChar: number): number =>
  Math.ceil(start + (length - 1) * perChar + 1);

/**
 * Typed text with a stable layout: untyped characters are present but
 * transparent, so wrapping and widths never jump while typing.
 */
export const TypingText: React.FC<{
  text: string;
  frame: number;
  start: number;
  perChar: number;
  seed?: string;
  style?: React.CSSProperties;
  /** Render a part of the text with its own style (e.g. a {variable}). */
}> = ({text, frame, start, perChar, seed, style}) => {
  const n = typedCount(frame, start, text.length, perChar, seed ?? text);
  return (
    <span style={{whiteSpace: 'pre', ...style}}>
      {text.slice(0, n)}
      <span style={{opacity: 0}}>{text.slice(n)}</span>
    </span>
  );
};

/** Lime caret: solid while typing, then a soft 1 s blink. */
export const Caret: React.FC<{frame: number; height: number; typingUntil?: number; color?: string; opacity?: number}> = ({
  frame,
  height,
  typingUntil = -1,
  color = COLORS.lime,
  opacity = 1,
}) => {
  const period = sec(1);
  const half = period / 2;
  const fade = sec(0.08);
  let value = 1;
  if (frame > typingUntil) {
    const p = (((frame - typingUntil) % period) + period) % period;
    if (p < half - fade) value = 1;
    else if (p < half) value = (half - p) / fade;
    else if (p < period - fade) value = 0;
    else value = (p - (period - fade)) / fade;
  }
  return (
    <span
      style={{
        display: 'inline-block',
        width: Math.max(3, height * 0.08),
        height,
        borderRadius: 2,
        background: color,
        marginLeft: 3,
        verticalAlign: 'middle',
        opacity: value * opacity,
      }}
    />
  );
};

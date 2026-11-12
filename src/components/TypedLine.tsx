import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, tween} from '../theme';
import {sec} from '../timeline';
import {Caret, typedCount, typingEnd} from './TypingText';
import {Lockup, LogoMark, lockupWidth} from './Logo';

const PER_CHAR = 60 / 18; // ~18 characters per second at 60 fps

/** Total duration needed by <TypedLine> for a given text (frames). */
export const typedLineDuration = (text: string, startAt = 0.4): number => {
  if (!text) return sec(startAt + 0.8 + 1.5);
  const end = typingEnd(sec(startAt), text.length, PER_CHAR);
  return end + sec(1.0) /* two blinks */ + sec(0.6) /* logo in */ + sec(1.5) /* hold */;
};

/**
 * End-card line: typed on plain white (Inter medium ~96px, ink, centred,
 * blinking caret, +/-1 frame jitter). After typing the caret blinks twice,
 * then the logo mark fades in below with a 16px rise. Last 1.5 s still.
 * Empty text -> logo + wordmark only.
 */
export const TypedLine: React.FC<{text: string; startAt?: number}> = ({text, startAt = 0.4}) => {
  const f = useCurrentFrame();
  if (!text) {
    const p = tween(f, startAt, startAt + 0.6);
    const markH = 120;
    return (
      <AbsoluteFill style={{background: COLORS.white, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: p, transform: `translateY(${(1 - p) * 16}px)`, width: lockupWidth(markH)}}>
          <Lockup markHeight={markH} />
        </div>
      </AbsoluteFill>
    );
  }
  const start = sec(startAt);
  const end = typingEnd(start, text.length, PER_CHAR);
  const n = typedCount(f, start, text.length, PER_CHAR, 'tagline');
  const blinkDone = end + sec(1.0);
  const logo = tween(f, blinkDone / sec(1), blinkDone / sec(1) + 0.6);
  return (
    <AbsoluteFill style={{background: COLORS.white, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56}}>
        <div style={{fontFamily: FONT_SANS, fontWeight: 500, fontSize: 96, letterSpacing: '-0.02em', color: COLORS.ink, whiteSpace: 'pre'}}>
          {text.slice(0, n)}
          <span style={{display: 'inline-block', width: 0, verticalAlign: 'middle'}}>
            <Caret frame={f} height={96 * 1.05} typingUntil={end} color={COLORS.ink} opacity={f >= blinkDone ? 0 : 1} />
          </span>
          <span style={{opacity: 0}}>{text.slice(n)}</span>
        </div>
        <div style={{opacity: logo, transform: `translateY(${(1 - logo) * 16}px)`}}>
          <LogoMark height={64} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

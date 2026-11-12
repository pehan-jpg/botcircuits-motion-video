import React from 'react';
import {COLORS, FONT_SANS, FONT_SANS_FAMILY, alpha, ease, tween} from '../theme';
import {FIELD} from '../handoff';
import {sec} from '../timeline';
import {Caret, typedCount} from './TypingText';
import {measureText} from './measure';

const FONT = `500 ${FIELD.fontSize}px "${FONT_SANS_FAMILY}"`;
const CHIP = 96; // room reserved on the right for the Enter key chip

/** Greedy word wrap of the full prompt (so lines never reflow while typing). */
export const wrapLines = (text: string): string[] => {
  const max = FIELD.width - FIELD.padX * 2 - CHIP - 12;
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measureText(next, FONT, FIELD.fontSize * 0.55) > max) {
      lines.push(cur + ' ');
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
};

const ReturnGlyph: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={COLORS.inkNavy} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 5v7a3 3 0 0 1-3 3H5" />
    <path d="M9 11l-4 4 4 4" />
  </svg>
);

/**
 * One-time input field (scenes 4-5), world coords centred on FIELD. Wraps to
 * extra lines and grows in height (200 ms ease-out) when a new line begins,
 * so the whole sentence stays visible.
 */
export const FieldInput: React.FC<{
  frame: number;
  text?: string;
  typeStart?: number;
  perChar?: number;
  typingUntil?: number;
  focus?: number;
  enterIn?: number;
  enterPress?: number;
  liftAt?: number; // seconds
  collapse?: number;
  opacity?: number;
  rise?: number;
  seed?: string;
}> = ({frame, text = '', typeStart = 0, perChar = 3, typingUntil = -1, focus = 0, enterIn = 0, enterPress = 0, liftAt, collapse = 0, opacity = 1, rise = 0, seed}) => {
  const {width: W, height: H0, radius, padX, fontSize, lineHeight} = FIELD;
  const n = text ? typedCount(frame, typeStart, text.length, perChar, seed ?? text) : 0;
  const lines = text ? wrapLines(text) : [''];
  // height grows as each new line starts
  let start = 0;
  let extra = 0;
  lines.forEach((l, i) => {
    if (i > 0) {
      // frame at which the first char of line i is typed
      let fr = typeStart;
      while (fr < typeStart + text.length * (perChar + 2) && typedCount(fr, typeStart, text.length, perChar, seed ?? text) <= start) fr++;
      extra += ease(frame, [fr, fr + sec(0.2)], [0, 1]);
    }
    start += l.length;
  });
  const H = H0 + extra * lineHeight;
  const sx = 1 + (28 / W - 1) * collapse;
  const sy = 1 + (28 / H - 1) * collapse;
  let consumed = 0;
  let wordIdx = 0;
  const caretLine = (() => {
    let acc = 0;
    for (let i = 0; i < lines.length; i++) {
      if (n <= acc + lines[i].length && (n < acc + lines[i].length || i === lines.length - 1)) return i;
      acc += lines[i].length;
    }
    return lines.length - 1;
  })();
  const showCaret = liftAt === undefined || frame < liftAt * sec(1);
  return (
    <div style={{position: 'absolute', left: FIELD.cx - W / 2, top: FIELD.cy - H / 2, width: W, height: H, opacity, transform: `translateY(${rise}px)`}}>
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 50,
          top: H / 2 - 50,
          width: 100,
          height: 100,
          borderRadius: 50,
          background: `radial-gradient(circle, ${COLORS.white} 0%, ${COLORS.white} 22%, ${alpha(COLORS.periwinkle, 0.7)} 38%, rgba(255,255,255,0) 70%)`,
          opacity: Math.min(1, collapse * 2),
          transform: `scale(${0.4 + 0.8 * collapse})`,
        }}
      />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${sx}, ${sy})`, opacity: 1 - Math.max(0, (collapse - 0.7) / 0.3)}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            background: COLORS.white,
            boxShadow: `0 30px 80px rgba(13,18,36,0.18), 0 0 0 ${4 * focus}px ${alpha(COLORS.periwinkle, 0.9 * focus)}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: padX,
            top: (H0 - lineHeight) / 2,
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize,
            lineHeight: `${lineHeight}px`,
            color: COLORS.inkNavy,
            whiteSpace: 'pre',
          }}
        >
          {lines.map((line, li) => {
            const lineStart = consumed;
            consumed += line.length;
            const visible = Math.max(0, Math.min(line.length, n - lineStart));
            if (li > 0 && visible === 0 && li > caretLine) return null;
            const parts = line.slice(0, visible).split(/(\s+)/);
            return (
              <div key={li} style={{height: lineHeight}}>
                {parts.map((w, i) => {
                  if (!w) return null;
                  if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
                  const k = wordIdx++;
                  const p = liftAt === undefined ? 0 : tween(frame, liftAt + k * 0.012, liftAt + k * 0.012 + 0.18);
                  return (
                    <span key={i} style={{display: 'inline-block', opacity: 1 - p, transform: `translateY(${-70 * p}px) scale(${1 - 0.45 * p})`}}>
                      {w}
                    </span>
                  );
                })}
                {li === caretLine && showCaret ? (
                  <span style={{display: 'inline-block', width: 0}}>
                    <Caret frame={frame} height={fontSize * 1.1} typingUntil={typingUntil} color={COLORS.inkNavy} />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 24,
            top: (H - 84) / 2,
            width: 92,
            height: 84,
            borderRadius: 20,
            background: COLORS.tagGrey,
            border: `1px solid ${COLORS.line}`,
            boxShadow: `0 ${4 - 4 * enterPress}px 0 ${COLORS.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: enterIn,
            transform: `translateY(${enterPress * 4 + (1 - enterIn) * 12}px) scale(${1 - 0.08 * enterPress})`,
          }}
        >
          <ReturnGlyph size={42} />
        </div>
      </div>
    </div>
  );
};

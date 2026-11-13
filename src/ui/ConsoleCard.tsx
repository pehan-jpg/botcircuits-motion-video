import React from 'react';
import {COLORS, alpha, ease} from '../theme';
import {sec} from '../timeline';
import {UI, UI_FONT, UI_FAMILY} from './tokens';
import {AGENT, CONSOLE_CARD} from '../v7';
import {Caret, typedCount} from '../components/TypingText';
import {wrapText} from '../components/measure';

export const SUGGESTIONS = ['What can you build for this agent?', 'Review my agent and suggest improvements', 'Add a card status lookup from our API'];
export const CONSOLE_INPUT = {x: 100, y: 372, width: 1080, fontSize: 30, lineHeight: 42, padX: 28, padY: 24, send: 56};
const FONT = `500 ${CONSOLE_INPUT.fontSize}px "${UI_FAMILY}"`;
const TEXT_W = CONSOLE_INPUT.width - CONSOLE_INPUT.padX * 2 - CONSOLE_INPUT.send - 20;

/** Lime four-point sparkle (small accent). */
export const Sparkle: React.FC<{size: number; color?: string}> = ({size, color = UI.consoleLime}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M10 3l1.6 4.9L16.5 9.5l-4.9 1.6L10 16l-1.6-4.9L3.5 9.5l4.9-1.6z" />
    <path d="M18 13l.8 2.2 2.2.8-2.2.8L18 19l-.8-2.2-2.2-.8 2.2-.8z" />
  </svg>
);

/** The dark Console pill with the lime sparkle. */
export const ConsolePill: React.FC<{width?: number; height?: number}> = ({width = 80, height = 40}) => (
  <div style={{width, height, borderRadius: height / 2, background: UI.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Sparkle size={height * 0.72} />
  </div>
);

export const LIFT_STAGGER = 0.04;
export const LIFT_DUR = 0.3;
/** Seconds from liftAt until the last word of `text` has lifted off. */
export const liftDuration = (text: string) => (text.split(/\s+/).filter(Boolean).length - 1) * LIFT_STAGGER + LIFT_DUR;

export const inputLines = (text: string) => wrapText(text, FONT, TEXT_W, 16);

/** Height of the input at a frame: grows (200 ms ease) as each new line starts. */
export const inputHeight = (frame: number, text: string, typeStart: number, perChar: number) => {
  const I = CONSOLE_INPUT;
  const lines = inputLines(text);
  let acc = 0;
  let h = I.lineHeight + I.padY * 2;
  lines.forEach((l, i) => {
    if (i > 0) {
      // frame at which the first character of line i is typed
      let fr = typeStart;
      while (fr < typeStart + text.length * (perChar + 2) && typedCount(fr, typeStart, text.length, perChar, 'console') <= acc) fr++;
      h += ease(frame, [fr, fr + sec(0.2)], [0, I.lineHeight]);
    }
    acc += l.length + 1;
  });
  return h;
};

/**
 * Console card (1280x760). Local coords; positioned by CONSOLE_CARD.
 * The pill is drawn by the caller (shared element across scenes 4 and 5).
 */
export const ConsoleCard: React.FC<{
  frame: number;
  text: string;
  typeStart: number;
  perChar: number;
  focus: number;
  sendPress: number;
  liftAt?: number;
  sendOpacity?: number;
  hideInput?: boolean;
}> = ({frame, text, typeStart, perChar, focus, sendPress, liftAt, sendOpacity = 1, hideInput = false}) => {
  const C = CONSOLE_CARD;
  const I = CONSOLE_INPUT;
  const n = typedCount(frame, typeStart, text.length, perChar, 'console');
  const lines = inputLines(text);
  const H = inputHeight(frame, text, typeStart, perChar);
  const grow = H - (I.lineHeight + I.padY * 2);
  const hasText = n > 0;
  const sugOut = Math.min(1, grow / I.lineHeight) * 0.5 + (liftAt !== undefined && frame > sec(liftAt - 0.1) ? ease(frame, [sec(liftAt - 0.1), sec(liftAt + 0.2)], [0, 0.5]) : 0);
  let consumed = 0;
  let wordIdx = 0;
  const caretLine = (() => {
    let acc = 0;
    for (let i = 0; i < lines.length; i++) {
      if (n <= acc + lines[i].length || i === lines.length - 1) return i;
      acc += lines[i].length + 1;
    }
    return 0;
  })();
  return (
    <div data-safe="console card" style={{position: 'absolute', left: C.cx - C.width / 2, top: C.cy - C.height / 2, width: C.width, height: C.height, fontFamily: UI_FONT, color: UI.ink}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 28, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: UI.shadow}} />
      <div style={{position: 'absolute', left: 44, top: 26, width: 60, height: 60, borderRadius: 16, background: UI.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Sparkle size={36} />
      </div>
      <div style={{position: 'absolute', left: 124, top: 22, fontSize: 28, fontWeight: 600}}>Console</div>
      <div style={{position: 'absolute', left: 124, top: 58, fontSize: 22, color: UI.text2, display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap'}}>
        {AGENT}
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 112, height: 1, background: UI.border}} />
      <div style={{position: 'absolute', left: 60, top: 192, fontSize: 56, fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>What can I help you build?</div>
      <div style={{position: 'absolute', left: 60, top: 274, width: 1100, fontSize: 24, lineHeight: '34px', color: UI.text2}}>
        Describe what {AGENT} should do. I'll set up instructions, tools, procedures, knowledge and integrations.
      </div>
      {/* input (grows to fit the typed text) */}
      <div
        style={{
          position: 'absolute',
          visibility: hideInput ? 'hidden' : 'visible',
          left: I.x,
          top: I.y,
          width: I.width,
          height: H,
          borderRadius: 24,
          background: COLORS.white,
          border: `2px solid ${focus > 0.5 ? UI.consoleLime : UI.border}`,
          boxShadow: `0 0 0 ${6 * focus}px ${alpha(UI.consoleLime, 0.16 * focus)}, 0 0 ${28 * focus}px ${alpha(UI.consoleLime, 0.3 * focus)}`,
          boxSizing: 'border-box',
        }}
      >
        <div style={{position: 'absolute', left: I.padX, top: I.padY - 2, width: TEXT_W, fontSize: I.fontSize, lineHeight: `${I.lineHeight}px`, fontWeight: 500, whiteSpace: 'pre'}}>
          {!hasText ? (
            <span style={{color: '#9CA3AF', position: 'relative'}}>
              <span style={{position: 'absolute', left: -6, top: 0}}>
                <Caret frame={frame} height={I.fontSize * 1.1} typingUntil={focus > 0.5 ? -1 : 1e9} color={UI.ink} opacity={focus} />
              </span>
              Ask Copilot to build {AGENT}…
            </span>
          ) : (
            lines.map((line, li) => {
              const start = consumed;
              consumed += line.length + 1;
              const vis = Math.max(0, Math.min(line.length, n - start));
              if (vis === 0 && li > caretLine) return null;
              const parts = line.slice(0, vis).split(/(\s+)/);
              return (
                <div key={li}>
                  {parts.map((w, i) => {
                    if (!w) return null;
                    if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
                    const k = wordIdx++;
                    // reading order, 0.04 s apart: each word rises 40 px straight up, blurs and fades
                    const p = liftAt === undefined ? 0 : ease(frame, [sec(liftAt + k * LIFT_STAGGER), sec(liftAt + k * LIFT_STAGGER + LIFT_DUR)], [0, 1]);
                    return (
                      <span key={i} style={{display: 'inline-block', opacity: 1 - p, transform: `translateY(${-40 * p}px)`, filter: p > 0.01 ? `blur(${6 * p}px)` : undefined}}>
                        {w}
                      </span>
                    );
                  })}
                  {li === caretLine && (liftAt === undefined || frame < sec(liftAt)) ? (
                    <span style={{display: 'inline-block', width: 0}}>
                      <Caret frame={frame} height={I.fontSize * 1.1} typingUntil={typeStart + text.length * perChar + 2} color={UI.ink} />
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 18,
            bottom: (I.lineHeight + I.padY * 2 - I.send) / 2,
            width: I.send,
            height: I.send,
            borderRadius: I.send / 2,
            background: hasText ? UI.ink : UI.sendGrey,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: sendOpacity,
            transform: `scale(${1 - 0.08 * sendPress})`,
          }}
        >
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={hasText ? COLORS.white : '#9CA3AF'} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </div>
      </div>
      {/* suggestions: slide down and fade as the input grows */}
      {SUGGESTIONS.map((t, i) => (
        <div
          key={t}
          style={{
            position: 'absolute',
            left: 120,
            top: I.y + H + 26 + i * 54,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 24,
            color: '#374151',
            whiteSpace: 'nowrap',
            opacity: Math.max(0, 1 - sugOut * 2 - i * 0.25 * Math.min(1, grow / I.lineHeight)),
            transform: `translateY(${sugOut * 40}px)`,
          }}
        >
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={1.8}>
            <path d="M12 4c4.7 0 8 2.9 8 6.6S16.7 17 12 17c-.9 0-1.8-.1-2.6-.3L5 19l1-3.4C4.8 14.4 4 12.6 4 10.6 4 6.9 7.3 4 12 4z" />
          </svg>
          {t}
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import {COLORS, alpha, tween} from '../theme';
import {UI, UI_FONT, UI_FAMILY} from './tokens';
import {CONSOLE_CARD} from '../v7';
import {Caret, typedCount} from '../components/TypingText';
import {measureText} from '../components/measure';

export const SUGGESTIONS = [
  'What can you build for this agent?',
  'Review my agent and suggest improvements',
  'Add an order status lookup from our API',
  'Create a returns procedure',
];
export const CONSOLE_INPUT = {x: 70, y: 410, width: 1160, height: 120, fontSize: 36, lineHeight: 48, padX: 32, send: 64};
const FONT = `500 ${CONSOLE_INPUT.fontSize}px "${UI_FAMILY}"`;

/** Lime four-point sparkle (small accent). */
export const Sparkle: React.FC<{size: number; color?: string}> = ({size, color = UI.consoleLime}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M10 3l1.6 4.9L16.5 9.5l-4.9 1.6L10 16l-1.6-4.9L3.5 9.5l4.9-1.6z" />
    <path d="M18 13l.8 2.2 2.2.8-2.2.8L18 19l-.8-2.2-2.2-.8 2.2-.8z" />
  </svg>
);

/** The dark Console pill with the lime sparkle. */
export const ConsolePill: React.FC<{width?: number; height?: number}> = ({width = 88, height = 44}) => (
  <div style={{width, height, borderRadius: height / 2, background: UI.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Sparkle size={height * 0.72} />
  </div>
);

export const wrapInput = (text: string) => {
  const max = CONSOLE_INPUT.width - CONSOLE_INPUT.padX * 2 - CONSOLE_INPUT.send - 24;
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const n = cur ? `${cur} ${w}` : w;
    if (cur && measureText(n, FONT, 20) > max) {
      out.push(cur + ' ');
      cur = w;
    } else cur = n;
  }
  if (cur) out.push(cur);
  return out;
};

/**
 * The Console card, rebuilt from the screenshot ("Playbooks" -> "Procedure").
 * Local coords; positioned by CONSOLE_CARD. The pill is drawn by the caller
 * (it is a shared element across scenes 4 and 5).
 */
export const ConsoleCard: React.FC<{
  frame: number;
  text: string;
  typeStart: number; // frames
  perChar: number;
  focus: number;
  sendPress: number;
  suggestionsOut: number;
  liftAt?: number; // seconds
  sendOpacity?: number;
  bodyOpacity?: number;
}> = ({frame, text, typeStart, perChar, focus, sendPress, suggestionsOut, liftAt, sendOpacity = 1, bodyOpacity = 1}) => {
  const C = CONSOLE_CARD;
  const I = CONSOLE_INPUT;
  const n = typedCount(frame, typeStart, text.length, perChar, 'console');
  const lines = wrapInput(text);
  let shownLines = 1;
  let acc = 0;
  lines.forEach((l, i) => {
    if (n > acc) shownLines = i + 1;
    acc += l.length;
  });
  const grow = (shownLines - 1) * I.lineHeight;
  const hasText = n > 0;
  let consumed = 0;
  let wordIdx = 0;
  return (
    <div style={{position: 'absolute', left: C.cx - C.width / 2, top: C.cy - C.height / 2, width: C.width, height: C.height, fontFamily: UI_FONT, color: UI.ink}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 28, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: UI.shadow, opacity: bodyOpacity}} />
      <div style={{opacity: bodyOpacity}}>
        {/* header */}
        <div style={{position: 'absolute', left: 44, top: 26, width: 72, height: 72, borderRadius: 18, background: UI.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Sparkle size={44} />
        </div>
        <div style={{position: 'absolute', left: 136, top: 22, fontSize: 36, fontWeight: 600}}>Console</div>
        <div style={{position: 'absolute', left: 136, top: 66, fontSize: 28, color: UI.text2, display: 'flex', alignItems: 'center', gap: 14}}>
          BotCircuits Website Agent
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={UI.text2} strokeWidth={2}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <div style={{position: 'absolute', right: 44, top: 30, height: 64, padding: '0 26px', borderRadius: 16, border: `1px solid ${UI.border}`, display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 500}}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={UI.ink} strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, height: 1, background: UI.border}} />
        {/* heading */}
        <div style={{position: 'absolute', left: 70, top: 214, fontSize: 64, fontWeight: 700, letterSpacing: '-0.02em'}}>What can I help you build?</div>
        <div style={{position: 'absolute', left: 70, top: 306, width: 1120, fontSize: 31, lineHeight: '44px', color: UI.text2}}>
          Describe what BotCircuits Website Agent should do. I'll set up instructions, tools, procedures, knowledge and integrations.
        </div>
      </div>
      {/* input */}
      <div
        style={{
          position: 'absolute',
          left: I.x,
          top: I.y,
          width: I.width,
          height: I.height + grow,
          borderRadius: 24,
          background: COLORS.white,
          border: `2px solid ${focus > 0.5 ? UI.consoleLime : UI.border}`,
          boxShadow: `0 0 0 ${6 * focus}px ${alpha(UI.consoleLime, 0.18 * focus)}, 0 0 ${30 * focus}px ${alpha(UI.consoleLime, 0.35 * focus)}`,
          boxSizing: 'border-box',
          opacity: bodyOpacity,
        }}
      >
        <div style={{position: 'absolute', left: I.padX, top: (I.height - I.lineHeight) / 2 - 2, fontSize: I.fontSize, lineHeight: `${I.lineHeight}px`, fontWeight: 500, whiteSpace: 'pre'}}>
          {!hasText ? (
            <span style={{color: '#9CA3AF', position: 'relative'}}>
              <span style={{position: 'absolute', left: -6, top: 0}}>
                <Caret frame={frame} height={I.fontSize * 1.1} typingUntil={focus > 0.5 ? -1 : 1e9} color={UI.ink} opacity={focus} />
              </span>
              Ask Copilot to build BotCircuits Website Agent…
            </span>
          ) : (
            lines.map((line, li) => {
              const start = consumed;
              consumed += line.length;
              const vis = Math.max(0, Math.min(line.length, n - start));
              if (li >= shownLines) return null;
              const parts = line.slice(0, vis).split(/(\s+)/);
              return (
                <div key={li}>
                  {parts.map((w, i) => {
                    if (!w) return null;
                    if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
                    const k = wordIdx++;
                    const p = liftAt === undefined ? 0 : tween(frame, liftAt + k * 0.01, liftAt + k * 0.01 + 0.2);
                    return (
                      <span key={i} style={{display: 'inline-block', opacity: 1 - p, transform: `translateY(${-80 * p}px) scale(${1 - 0.4 * p})`}}>
                        {w}
                      </span>
                    );
                  })}
                  {li === shownLines - 1 && (liftAt === undefined || frame < liftAt * 60) ? (
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
            right: 22,
            bottom: (I.height - I.send) / 2,
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
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={hasText ? COLORS.white : '#9CA3AF'} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </div>
      </div>
      {/* suggestions */}
      {SUGGESTIONS.map((t, i) => {
        const p = suggestionsOut > 0 ? tween(frame, 3.9 + i * 0.05, 4.25 + i * 0.05) : 0;
        return (
          <div
            key={t}
            style={{
              position: 'absolute',
              left: 96,
              top: I.y + I.height + grow + 34 + i * 60,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              fontSize: 31,
              color: '#374151',
              opacity: (1 - p) * bodyOpacity,
              transform: `translateY(${p * 40}px)`,
            }}
          >
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={1.8}>
              <path d="M12 4c4.7 0 8 2.9 8 6.6S16.7 17 12 17c-.9 0-1.8-.1-2.6-.3L5 19l1-3.4C4.8 14.4 4 12.6 4 10.6 4 6.9 7.3 4 12 4z" />
            </svg>
            {t}
          </div>
        );
      })}
    </div>
  );
};

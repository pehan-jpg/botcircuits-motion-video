import React from 'react';
import {COLORS, FONT_SANS, FONT_SANS_FAMILY, alpha, tween} from '../theme';
import {FIELD} from '../handoff';
import {Caret, typedCount} from './TypingText';
import {measureText} from './measure';

const FONT = `500 ${FIELD.fontSize}px "${FONT_SANS_FAMILY}"`;

/** Return-key glyph (no text label). */
const ReturnGlyph: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={COLORS.ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 5v7a3 3 0 0 1-3 3H5" />
    <path d="M9 11l-4 4 4 4" />
  </svg>
);

/**
 * The one-time input field (scenes 4-5). World coords, centred on FIELD.
 * Long text scrolls left inside the field so the caret stays in view.
 */
export const FieldInput: React.FC<{
  frame: number;
  text?: string;
  typeStart?: number; // frames
  perChar?: number;
  typingUntil?: number; // frames (caret blinks after)
  focus?: number; // 0..1 focus ring
  enterIn?: number; // 0..1 enter chip
  enterPress?: number; // 0..1
  liftAt?: number; // seconds; words lift off from here
  collapse?: number; // 0..1 field -> glowing dot
  opacity?: number;
  rise?: number; // px
  seed?: string;
}> = ({frame, text = '', typeStart = 0, perChar = 3, typingUntil = -1, focus = 0, enterIn = 0, enterPress = 0, liftAt, collapse = 0, opacity = 1, rise = 0, seed}) => {
  const {width: W, height: H, radius, padX, fontSize} = FIELD;
  const n = text ? typedCount(frame, typeStart, text.length, perChar, seed ?? text) : 0;
  const typed = text.slice(0, n);
  const chipW = 96;
  const visible = W - padX * 2 - chipW * enterIn - 10;
  const typedW = measureText(typed, FONT, fontSize * 0.55);
  const offset = Math.max(0, typedW + 12 - visible);
  const words = typed.split(/(\s+)/);
  const sx = 1 + (28 / W - 1) * collapse;
  const sy = 1 + (28 / H - 1) * collapse;
  let wordIdx = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: FIELD.cx - W / 2,
        top: FIELD.cy - H / 2,
        width: W,
        height: H,
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      {/* glowing dot that remains when the field collapses */}
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 40,
          top: H / 2 - 40,
          width: 80,
          height: 80,
          borderRadius: 40,
          background: `radial-gradient(circle, ${COLORS.white} 0%, ${COLORS.white} 22%, ${alpha(COLORS.periwinkle, 0.7)} 38%, rgba(255,255,255,0) 70%)`,
          opacity: Math.min(1, collapse * 2),
          transform: `scale(${0.4 + 0.8 * collapse})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${sx}, ${sy})`,
          opacity: 1 - Math.max(0, (collapse - 0.7) / 0.3),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            background: COLORS.white,
            boxShadow: `0 30px 80px rgba(13,18,36,0.18), 0 0 0 ${4 * focus}px ${alpha(COLORS.periwinkle, 0.9 * focus)}`,
          }}
        />
        <div style={{position: 'absolute', left: padX, right: padX + chipW * enterIn, top: 0, height: H, overflow: 'hidden'}}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: H,
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'pre',
              fontFamily: FONT_SANS,
              fontWeight: 500,
              fontSize,
              color: COLORS.ink,
              transform: `translateX(${-offset}px)`,
            }}
          >
            {words.map((w, i) => {
              if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
              const k = wordIdx++;
              const p = liftAt === undefined ? 0 : tween(frame, liftAt + k * 0.014, liftAt + k * 0.014 + 0.18);
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity: 1 - p,
                    transform: `translateY(${-70 * p}px) scale(${1 - 0.45 * p})`,
                  }}
                >
                  {w}
                </span>
              );
            })}
            {liftAt === undefined || frame < liftAt * 60 ? (
              <Caret frame={frame} height={fontSize * 1.1} typingUntil={typingUntil} color={COLORS.ink} />
            ) : null}
          </div>
        </div>
        {/* Enter key chip */}
        <div
          style={{
            position: 'absolute',
            right: 22,
            top: (H - 76) / 2,
            width: 84,
            height: 76,
            borderRadius: 18,
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
          <ReturnGlyph size={38} />
        </div>
      </div>
    </div>
  );
};

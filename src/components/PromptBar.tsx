import React from 'react';
import {COLORS, FONT_MONO, FONT_SANS} from '../theme';
import {Caret, typedCount} from './TypingText';
import {IconReturn} from './Icons';

/** Big (unscaled) geometry of the Console prompt bar. */
export const PROMPT = {width: 1360, height: 120, radius: 40, fontSize: 30, padX: 44};

export type PromptBarState = {
  cx: number;
  cy: number;
  scale: number;
  opacity: number;
  /** Rise offset for entrances (px, screen space). */
  dy?: number;
  /** Extra horizontal stretch (morph into a wider element). */
  stretch?: number;
};

/**
 * The BotCircuits Console prompt bar: the recurring anchor of scenes 4-7.
 * Positioned by its centre so the big -> slim morph is a pure transform.
 */
export const PromptBar: React.FC<{
  state: PromptBarState;
  frame: number;
  text?: string;
  typeStart?: number;
  perChar?: number;
  /** Frame at which typing ends (caret starts blinking after it). */
  typingUntil?: number;
  /** 0..1 how pressed the Enter key chip is. */
  enterPress?: number;
  /** Fades the typed text out (after submit). */
  textOpacity?: number;
  seed?: string;
}> = ({state, frame, text = '', typeStart = 0, perChar = 2, typingUntil = -1, enterPress = 0, textOpacity = 1, seed}) => {
  const n = text ? typedCount(frame, typeStart, text.length, perChar, seed ?? text) : 0;
  const {width: W, height: H} = PROMPT;
  return (
    <div
      style={{
        position: 'absolute',
        left: state.cx - W / 2,
        top: state.cy - H / 2,
        width: W,
        height: H,
        opacity: state.opacity,
        transform: `translateY(${state.dy ?? 0}px) scale(${state.scale * (state.stretch ?? 1)}, ${state.scale})`,
        transformOrigin: '50% 50%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: PROMPT.radius,
          background: COLORS.white,
          border: `1px solid ${COLORS.line}`,
          boxShadow: '0 28px 70px rgba(11,13,12,0.10), 0 4px 14px rgba(11,13,12,0.05)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: PROMPT.padX,
          top: 0,
          height: H,
          right: 220,
          display: 'flex',
          alignItems: 'center',
          fontFamily: FONT_SANS,
          fontSize: PROMPT.fontSize,
          color: COLORS.ink,
          whiteSpace: 'pre',
          overflow: 'hidden',
        }}
      >
        {textOpacity > 0.001 ? <span style={{opacity: textOpacity}}>{text.slice(0, n)}</span> : null}
        <Caret frame={frame} height={PROMPT.fontSize * 1.25} typingUntil={typingUntil} />
      </div>
      {/* Enter key chip */}
      <div
        style={{
          position: 'absolute',
          right: 30,
          top: (H - 60) / 2,
          height: 60,
          padding: '0 20px',
          borderRadius: 16,
          background: COLORS.tagGrey,
          border: `1px solid ${COLORS.line}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: COLORS.ink,
          fontFamily: FONT_MONO,
          fontSize: 20,
          transform: `translateY(${enterPress * 3}px) scale(${1 - enterPress * 0.08})`,
          boxShadow: `0 ${3 - enterPress * 3}px 0 ${COLORS.line}`,
        }}
      >
        <IconReturn size={22} />
        Enter
        <div
          style={{position: 'absolute', inset: 0, borderRadius: 16, background: COLORS.ink, opacity: enterPress * 0.12}}
        />
      </div>
    </div>
  );
};

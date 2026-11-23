import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {progress} from '../motion';
import {colors, radii} from '../tokens';

export type CaretOptions = {
  /** Caret colour and width. */
  color?: string;
  width?: number;
  height?: number;
  /** Blink rate in Hz while idle (before and after typing). */
  hz?: number;
  /**
   * Phase offset in seconds applied to the idle blink, so the first blink
   * can land inside a short entrance window.
   */
  phase?: number;
};

export type TypedTextProps = {
  text: string;
  /** Frame on which the first character appears. */
  startFrame: number;
  /** Characters per second. */
  cps: number;
  /** Put the most recently typed word on a lime tint highlight. */
  highlight?: boolean;
  /** Seconds after the next word starts before a highlight begins to fade. */
  highlightHold?: number;
  /** Seconds a highlight takes to fade in and out. */
  highlightFadeIn?: number;
  highlightFadeOut?: number;
  caret?: CaretOptions | false;
  style?: React.CSSProperties;
};

type Word = {text: string; startChar: number; isSpace: boolean};

const tokenize = (text: string): Word[] => {
  const words: Word[] = [];
  const re = /(\s+)|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    words.push({text: m[0], startChar: m.index, isSpace: Boolean(m[1])});
  }
  return words;
};

/** Number of characters typed `typingFrames` after `startFrame`. */
export const charsTyped = (
  frame: number,
  startFrame: number,
  cps: number,
  fps: number,
  length: number,
): number => {
  if (frame < startFrame) return 0;
  const elapsed = (frame - startFrame) / fps;
  return Math.min(length, Math.floor(elapsed * cps) + 1);
};

/** Frame at which character `index` appears. */
const charFrame = (index: number, startFrame: number, cps: number, fps: number) =>
  startFrame + Math.ceil((index / cps) * fps);

/**
 * Text that types on at a fixed rate. Each word sits on a lime tint
 * highlight while it is the newest word, which fades a set time after the
 * next word starts (or after typing ends, for the last word).
 */
export const TypedText: React.FC<TypedTextProps> = ({
  text,
  startFrame,
  cps,
  highlight = true,
  highlightHold = 0.3,
  highlightFadeIn = 0.08,
  highlightFadeOut = 0.2,
  caret = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typed = charsTyped(frame, startFrame, cps, fps, text.length);
  const words = tokenize(text);
  const endFrame = charFrame(text.length, startFrame, cps, fps);

  const solidWords = words.filter((w) => !w.isSpace);

  const highlightOpacity = (w: Word): number => {
    const idx = solidWords.indexOf(w);
    const begin = charFrame(w.startChar, startFrame, cps, fps);
    const next = solidWords[idx + 1];
    const nextBegin = next ? charFrame(next.startChar, startFrame, cps, fps) : endFrame;
    const fadeStart = nextBegin + highlightHold * fps;
    const fadeIn = progress(frame, begin, begin + highlightFadeIn * fps);
    const fadeOut = progress(frame, fadeStart, fadeStart + highlightFadeOut * fps);
    return fadeIn * (1 - fadeOut);
  };

  let caretEl: React.ReactNode = null;
  if (caret) {
    const {
      color = colors.charcoal,
      width = 2,
      height = '1.15em',
      hz = 1,
      phase = 0,
    } = caret;
    const typing = frame >= startFrame && frame < endFrame;
    const ref = frame < startFrame ? 0 : endFrame / fps;
    const t = frame / fps - ref + phase;
    const cycle = ((t * hz) % 1 + 1) % 1;
    const visible = typing || cycle < 0.5;
    caretEl = (
      <span
        style={{
          display: 'inline-block',
          width,
          height,
          marginLeft: 2,
          background: color,
          verticalAlign: 'text-bottom',
          transform: 'translateY(0.12em)',
          opacity: visible ? 1 : 0,
        }}
      />
    );
  }

  return (
    <span style={{whiteSpace: 'pre', ...style}}>
      {words.map((w, i) => {
        const shown = Math.max(0, Math.min(w.text.length, typed - w.startChar));
        if (shown <= 0) return null;
        const part = w.text.slice(0, shown);
        if (w.isSpace || !highlight) return <span key={i}>{part}</span>;
        const o = highlightOpacity(w);
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block'}}>
            <span
              style={{
                position: 'absolute',
                left: -4,
                right: -4,
                top: '0.02em',
                bottom: '-0.02em',
                borderRadius: radii.highlight,
                background: colors.limeTint,
                opacity: o,
              }}
            />
            <span style={{position: 'relative'}}>{part}</span>
          </span>
        );
      })}
      {caretEl}
    </span>
  );
};

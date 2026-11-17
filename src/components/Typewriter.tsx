import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { INK } from "../constants";
import { hash01 } from "../anim";

export const CHAR_FADE_S = 0.07;
const COMMA_PAUSE_S = 0.14;
const STOP_PAUSE_S = 0.26;
const JITTER = 0.1;
const CARET_HZ = 1.1;
const CARET_FADE_DELAY_S = 0.3;
const CARET_FADE_S = 0.12;

/** Start time in seconds of each character, relative to the start of typing. */
export const typewriterSchedule = (text: string, cps: number): number[] => {
  const times: number[] = [];
  let t = 0;
  for (let i = 0; i < text.length; i++) {
    times.push(t);
    const jitter = (hash01(i + 1) * 2 - 1) * JITTER;
    t += (1 / cps) * (1 + jitter);
    if (text[i] === ",") t += COMMA_PAUSE_S;
    if (text[i] === ".") t += STOP_PAUSE_S;
  }
  return times;
};

/** Seconds until the last character is fully visible. */
export const typewriterDuration = (text: string, cps: number): number => {
  const s = typewriterSchedule(text, cps);
  return s[s.length - 1] + CHAR_FADE_S;
};

export type TypewriterState = {
  opacities: number[];
  /** Index of the char the caret sits after; -1 means before the first char. */
  caretAfter: number;
  caretOpacity: number;
};

/** Shared, pure typewriter function. Deterministic for any frame. */
export const getTypewriterState = (
  text: string,
  frame: number,
  startFrame: number,
  fps: number,
  cps: number,
): TypewriterState => {
  const t = (frame - startFrame) / fps;
  const schedule = typewriterSchedule(text, cps);
  const opacities = schedule.map((s) => Math.min(1, Math.max(0, (t - s) / CHAR_FADE_S)));
  let caretAfter = -1;
  schedule.forEach((s, i) => {
    if (t >= s) caretAfter = i;
  });
  const end = typewriterDuration(text, cps);
  const blinkOn = t < 0 ? 0 : ((t * CARET_HZ) % 1) < 0.5 ? 1 : 0;
  const fadeOut = Math.min(1, Math.max(0, (t - end - CARET_FADE_DELAY_S) / CARET_FADE_S));
  const caretOpacity = t < 0 ? 0 : 0.7 * blinkOn * (1 - fadeOut);
  return { opacities, caretAfter, caretOpacity };
};

export type TypewriterProps = {
  text: string;
  startFrame: number;
  cps: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  /** Pre-measured fixed box width. The box never resizes while typing. */
  boxWidth: number;
  lineHeight?: number;
  color?: string;
  /** Wrap a range of characters (e.g. "Space") to attach an underline. */
  decorate?: { from: number; to: number; render: () => React.ReactNode };
  boxRef?: React.Ref<HTMLDivElement>;
  charDataAttr?: string;
};

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  startFrame,
  cps,
  fontFamily,
  fontSize,
  fontWeight,
  boxWidth,
  lineHeight = 1.45,
  color = INK,
  decorate,
  boxRef,
  charDataAttr = "data-tw-char",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const state = getTypewriterState(text, frame, startFrame, fps, cps);

  const caret = (
    <span
      aria-hidden
      style={{
        position: "absolute",
        left: state.caretAfter < 0 ? -1 : "100%",
        marginLeft: state.caretAfter < 0 ? 0 : 3,
        top: "50%",
        width: 2,
        height: fontSize * 0.86,
        transform: "translateY(-50%)",
        background: color,
        opacity: state.caretOpacity,
        borderRadius: 1,
      }}
    />
  );

  const renderChar = (i: number) => {
    const ch = text[i];
    const hostsCaret = state.caretAfter === i || (state.caretAfter < 0 && i === 0);
    return (
      <span
        key={i}
        {...{ [charDataAttr]: i }}
        style={{ position: "relative", whiteSpace: "pre" }}
      >
        <span style={{ opacity: state.opacities[i] }}>{ch}</span>
        {hostsCaret ? caret : null}
      </span>
    );
  };

  const chars: React.ReactNode[] = [];
  for (let i = 0; i < text.length; i++) {
    if (decorate && i === decorate.from) {
      const inner: React.ReactNode[] = [];
      for (let j = decorate.from; j < decorate.to; j++) inner.push(renderChar(j));
      chars.push(
        <span key={`d${i}`} style={{ position: "relative" }}>
          {inner}
          {decorate.render()}
        </span>,
      );
      i = decorate.to - 1;
      continue;
    }
    chars.push(renderChar(i));
  }

  return (
    <div
      ref={boxRef}
      data-guard="title-box"
      style={{
        width: boxWidth,
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        color,
        whiteSpace: "nowrap",
        textAlign: "left",
        position: "relative",
      }}
    >
      {chars}
    </div>
  );
};

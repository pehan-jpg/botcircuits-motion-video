import React from "react";
import { random } from "remotion";
import { INK } from "../constants";

/** Shared typing rules. All times are in seconds. */
export const TYPE_RULES = {
  charFade: 0.07,
  jitter: 0.1,
  commaPause: 0.14,
  stopPause: 0.26,
  caretWidth: 2,
  caretOpacity: 0.7,
  caretBlinkHz: 1.1,
  caretHoldAfterLast: 0.3,
  caretFade: 0.15,
} as const;

export type TypeSchedule = {
  /** Start time of each character, in seconds from the typing start. */
  starts: number[];
  /** Time the last character starts. */
  lastStart: number;
  /** Time the last character is fully visible. */
  done: number;
  /** Time the caret has fully faded. */
  caretGone: number;
};

/**
 * Deterministic typing schedule. Each gap is 1/cps with a jitter of plus or
 * minus 10 percent seeded from the character index, plus punctuation pauses.
 */
export const typeSchedule = (text: string, cps: number): TypeSchedule => {
  const chars = Array.from(text);
  const starts: number[] = [];
  let t = 0;
  chars.forEach((ch, i) => {
    starts.push(t);
    const jitter = (random(`typewriter-${i}`) * 2 - 1) * TYPE_RULES.jitter;
    let gap = (1 / cps) * (1 + jitter);
    if (ch === ",") gap += TYPE_RULES.commaPause;
    if (ch === ".") gap += TYPE_RULES.stopPause;
    t += gap;
  });
  const lastStart = starts[starts.length - 1] ?? 0;
  return {
    starts,
    lastStart,
    done: lastStart + TYPE_RULES.charFade,
    caretGone: lastStart + TYPE_RULES.caretHoldAfterLast + TYPE_RULES.caretFade,
  };
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Caret opacity at time t (seconds from typing start); t may be negative. */
export const caretOpacity = (t: number, schedule: TypeSchedule, leadIn = 0) => {
  if (t < -leadIn) return 0;
  const fadeStart = schedule.lastStart + TYPE_RULES.caretHoldAfterLast;
  const fade = 1 - clamp01((t - fadeStart) / TYPE_RULES.caretFade);
  const typing = t >= 0 && t <= schedule.lastStart + 0.05;
  // Solid while characters arrive, a soft 1.1 Hz blink otherwise.
  const phase = typing ? 0 : (t - (t < 0 ? -leadIn : schedule.lastStart));
  const wave = 0.5 + 0.5 * Math.cos(2 * Math.PI * TYPE_RULES.caretBlinkHz * phase);
  const blink = typing ? 1 : clamp01((wave - 0.25) * 4);
  return TYPE_RULES.caretOpacity * blink * fade;
};

export const Typewriter: React.FC<{
  text: string;
  /** Seconds since typing started (negative before it starts). */
  time: number;
  schedule: TypeSchedule;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  color?: string;
  caretColor?: string;
  /** Seconds the caret is shown before the first character. */
  caretLeadIn?: number;
  /** Marks characters for the guard (title only). */
  charGuard?: string;
  style?: React.CSSProperties;
}> = ({
  text,
  time,
  schedule,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  color = INK,
  caretColor = INK,
  caretLeadIn = 0,
  charGuard,
  style,
}) => {
  const chars = Array.from(text);
  const started = schedule.starts.filter((s) => time >= s).length;
  const caretAlpha = caretOpacity(time, schedule, caretLeadIn);
  const caretIndex = Math.max(0, started - 1);
  const caretAfter = started > 0;
  const caretHeight = Math.round(fontSize * 1.04);

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight: `${lineHeight}px`,
        color,
        whiteSpace: "pre",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const o = clamp01((time - schedule.starts[i]) / TYPE_RULES.charFade);
        return (
          <span key={i} style={{ position: "relative" }}>
            {/* Opacity sits on an inner span so the caret never inherits it. */}
            <span data-guard-char={charGuard} style={{ opacity: o }}>
              {ch}
            </span>
            {i === caretIndex && caretAlpha > 0 ? (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  // Zero layout width: the caret never pushes text around.
                  left: caretAfter ? "calc(100% + 3px)" : -5,
                  top: "50%",
                  width: TYPE_RULES.caretWidth,
                  height: caretHeight,
                  marginTop: -caretHeight / 2,
                  borderRadius: 1,
                  background: caretColor,
                  opacity: caretAlpha,
                }}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};

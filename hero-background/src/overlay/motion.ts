import type React from "react";
import { Easing, interpolate, spring } from "remotion";
import { MOTION } from "./config";

type Bezier = readonly [number, number, number, number];

export const bezier = (b: Bezier) => Easing.bezier(b[0], b[1], b[2], b[3]);
export const revealEase = bezier(MOTION.revealEasing);
export const progressEase = bezier(MOTION.progressEasing);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 over `duration` frames from `start`, eased with the reveal curve. */
export const ramp = (frame: number, start: number, duration: number, easing = revealEase) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });

/** Overdamped spring 0 → 1 that settles in exactly `duration` frames. */
export const springIn = (frame: number, start: number, fps: number, duration: number) =>
  spring({ frame: frame - start, fps, config: MOTION.spring, durationInFrames: duration });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Scale dip used for button presses. */
export const pressScale = (frame: number, at: number) =>
  interpolate(
    frame,
    [at, at + MOTION.press.downFrames, at + MOTION.press.downFrames + MOTION.press.upFrames],
    [1, MOTION.press.scale, 1],
    { ...clamp, easing: revealEase },
  );

/** Only emit a blur filter when it is visible, so resting text stays crisp. */
export const blurFilter = (px: number) => (px > 0.05 ? `blur(${px.toFixed(2)}px)` : undefined);

export type EnterFrom = "right" | "bottom";

/**
 * Card entrance / exit / idle float. `transform` goes on the card container;
 * `fade` (opacity + blur) goes directly on each glass surface, because an
 * ancestor with opacity or filter would disable the surface's backdrop-filter.
 */
export const cardMotion = (
  frame: number,
  fps: number,
  enter: number,
  exit: number,
  from: EnterFrom,
  /** Phase origin of the idle float, so stacked surfaces float together. */
  floatFrom = enter,
) => {
  const visible = frame >= enter && frame < exit + MOTION.exit.frames;
  const p = springIn(frame, enter, fps, MOTION.enter.frames);
  const q = springIn(frame, exit, fps, MOTION.exit.frames);
  const offset = MOTION.enter.translatePx * (1 - p);
  const float = MOTION.float.amplitudePx * Math.sin(((frame - floatFrom) / MOTION.float.periodFrames) * Math.PI * 2);
  const x = from === "right" ? offset : 0;
  const y = (from === "bottom" ? offset : 0) + MOTION.exit.translatePx * q + float;

  const transform: React.CSSProperties = {
    translate: `${x.toFixed(2)}px ${y.toFixed(2)}px`,
    scale: String(lerp(MOTION.enter.scaleFrom, 1, p)),
  };
  const fade = {
    opacity: p * (1 - q),
    filter: blurFilter(MOTION.enter.blurPx * (1 - p) + MOTION.exit.blurPx * q),
  };
  return { visible, transform, fade };
};

/** Fade + small vertical slide for content swaps inside a card. */
export const swap = (frame: number, inAt: number, outAt: number | null, duration = 10, distance = 14) => {
  const i = ramp(frame, inAt, duration);
  const o = outAt === null ? 0 : ramp(frame, outAt, duration);
  return {
    opacity: i * (1 - o),
    translate: `0px ${(distance * (1 - i) - distance * o).toFixed(2)}px`,
    filter: blurFilter(3 * (1 - i) + 3 * o),
  } satisfies React.CSSProperties;
};

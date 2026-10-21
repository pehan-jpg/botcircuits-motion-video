import type React from "react";
import { Easing, interpolate, spring } from "remotion";
import { MOTION, STACK } from "./config";

type Bezier = readonly [number, number, number, number];

export const bezier = (b: Bezier) => Easing.bezier(b[0], b[1], b[2], b[3]);
export const revealEase = bezier(MOTION.revealEasing);
export const progressEase = bezier(MOTION.progressEasing);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 over `duration` frames from `start`, eased with the reveal curve. */
export const ramp = (frame: number, start: number, duration: number, easing = revealEase) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });

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

/** The stack spring (no fixed duration): drives rises, glides and height growth. */
export const stackSpring = (frame: number, start: number, fps: number) =>
  spring({ frame: frame - start, fps, config: MOTION.spring });

const exitSpring = (frame: number, start: number, fps: number) =>
  spring({ frame: frame - start, fps, config: MOTION.exitSpring, durationInFrames: MOTION.exit.frames });

/**
 * Entrance / exit state of one stack element. `fade` (opacity + blur) goes directly on the
 * glass surface, because an ancestor with opacity or filter would disable its backdrop-filter.
 */
export const itemMotion = (frame: number, fps: number, enter: number, exit: number) => {
  const p = stackSpring(frame, enter, fps);
  const q = exitSpring(frame, exit, fps);
  return {
    visible: frame >= enter && frame < exit + MOTION.exit.frames,
    /** Presence 0 → 1: how much of its slot the element occupies. */
    p,
    fade: {
      opacity: p * (1 - q),
      filter: blurFilter(MOTION.enter.blurPx * (1 - p) + MOTION.exit.blurPx * q),
    },
    scale: lerp(MOTION.enter.scaleFrom, 1, p),
    /** Own vertical motion: rises from `risePx` below its slot, drifts up on exit. */
    ownY: STACK.risePx * (1 - p) + MOTION.exit.translatePx * q,
  };
};

export type ItemMotion = ReturnType<typeof itemMotion>;

/** Shared idle float so the whole stack breathes together. */
export const floatY = (frame: number, from: number) =>
  MOTION.float.amplitudePx * Math.sin(((frame - from) / MOTION.float.periodFrames) * Math.PI * 2);

/**
 * Layout of a bottom-anchored stack, for elements listed top → bottom.
 * `offset`: distance of each element's bottom edge above the stack bottom. Every element below
 * pushes the ones above it up by its presence × (height + gap), so a card rising into the bottom
 * slot glides everything above it upward with the same spring.
 * `clipTop`: how much of an element's top is hidden so it never overlaps the element above while
 * the space is still opening; it emerges upward out of its slot instead.
 */
export const stackLayout = (items: { p: number; h: number; ownY: number }[]) => {
  const offsets = items.map(() => 0);
  let acc = 0;
  for (let i = items.length - 1; i >= 0; i--) {
    offsets[i] = acc;
    acc += items[i].p * (items[i].h + STACK.gap);
  }
  return items.map((item, i) => {
    if (i === 0) return { offset: offsets[i], clipTop: 0 };
    const top = offsets[i] - item.ownY + item.h;
    const allowed = offsets[i - 1] - items[i - 1].ownY - STACK.gap;
    return { offset: offsets[i], clipTop: Math.min(item.h, Math.max(0, top - allowed)) };
  });
};

/** Height of a card that grows upward: base height plus each growth eased in with the stack spring. */
export const grownHeight = (frame: number, fps: number, base: number, growth: { at: number; grow: number }[]) =>
  base + growth.reduce((sum, g) => sum + g.grow * stackSpring(frame, g.at, fps), 0);

/** Container transform for a stack element. */
export const stackTransform = (y: number, scale: number): React.CSSProperties => ({
  translate: `0px ${y.toFixed(2)}px`,
  scale: String(scale),
});

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

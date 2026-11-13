import type React from "react";
import { Easing, interpolate } from "remotion";
import { EASE_CURVE, MOTION, STACK, STACK_CONTAINER_HEIGHT } from "./config";

type Bezier = readonly [number, number, number, number];

export const bezier = (b: Bezier) => Easing.bezier(b[0], b[1], b[2], b[3]);

/** The single curve used for every position change (and the eased fades). */
export const ease = bezier(EASE_CURVE);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 over `duration` seconds from `start`, on the single ease-out curve. */
export const easeIn01 = (t: number, start: number, duration: number) =>
  interpolate(t, [start, start + duration], [0, 1], { ...clamp, easing: ease });

/** 0 → 1 over `duration` seconds from `start`, linear (used for opacity fades). */
export const linear01 = (t: number, start: number, duration: number) => interpolate(t, [start, start + duration], [0, 1], clamp);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Vertical offset for an in-flow element, applied as a layout offset (position: relative + top)
 * rather than a transform. Headless Chrome sometimes captured transform-only (compositor) updates
 * a frame late, which showed up as stale positions and missing text; a layout offset forces a
 * fresh paint on every frame. Never scale.
 */
export const translateY = (y: number): React.CSSProperties => ({ position: "relative", top: `${y.toFixed(3)}px` });

/* ---------- Stack items ---------- */

export type StackItem = {
  /** Entrance start (s). */
  enter: number;
  /** Current height (px), animated for cards that grow. */
  height: number;
};

export type ItemState = { y: number; opacity: number; textOpacity: number };

/**
 * Layout of a bottom-anchored stack at time t, items listed top → bottom. A new item starts
 * (own height + 24px) below its slot and rises into it while every item above scrolls up by
 * (its height + 12px) on the same curve over the same 0.4 s, so the stack moves as one.
 * Returns each item's y (px, down positive, bottom edge relative to the stack bottom) and opacities.
 */
export const stackLayout = (t: number, items: StackItem[]): ItemState[] => {
  const m = MOTION.enter;
  const e = items.map((it) => easeIn01(t, it.enter, m.duration));
  let below = 0;
  const out: ItemState[] = items.map(() => ({ y: 0, opacity: 0, textOpacity: 0 }));
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    out[i] = {
      y: -below + (it.height + m.extraDropPx) * (1 - e[i]),
      opacity: linear01(t, it.enter, m.opacityDuration),
      textOpacity: linear01(t, it.enter + m.textDelay, m.textFade),
    };
    below += e[i] * (it.height + STACK.gap);
  }
  return out;
};

/** Whole-stack exit: scrolls up 40px on the same curve while fading to 0. No stagger. */
export const stackExit = (t: number, exitStart: number) => {
  const x = easeIn01(t, exitStart, MOTION.exit.duration);
  return { y: -MOTION.exit.liftPx * x, opacity: 1 - x };
};

/** Whether a scene's stack is on screen at time t. */
export const stackVisible = (t: number, firstEnter: number, exitStart: number) =>
  t >= firstEnter && t < exitStart + MOTION.exit.duration;

/** The query dims to 80% once the card arrives. */
export const queryDim = (t: number, cardEnter: number) => lerp(1, MOTION.dim.to, easeIn01(t, cardEnter, MOTION.dim.duration));

/** Height of a growing card: base plus each growth, eased over 0.3 s. */
export const grownHeight = (t: number, base: number, growth: { at: number; grow: number }[]) =>
  base + growth.reduce((sum, g) => sum + g.grow * easeIn01(t, g.at, MOTION.grow.duration), 0);

/** A new row inside a growing card: opacity 0 → 1 and an 8px rise over 0.3 s, no blur. */
export const rowAppear = (t: number, at: number | null): React.CSSProperties => {
  if (at === null) return {};
  const k = easeIn01(t, at, MOTION.grow.duration);
  return { opacity: k, ...translateY(MOTION.grow.rowRisePx * (1 - k)) };
};

/**
 * Opacity-only crossfade for content that swaps in place: the outgoing state fades out over
 * 8 frames (30 fps) and the incoming one fades in over 8 frames starting 4 frames later.
 * `inAt` = when the swap bringing this content starts (null = present from the start);
 * `outAt` = when the swap replacing it starts (null = stays).
 */
export const crossfade = (t: number, inAt: number | null, outAt: number | null): React.CSSProperties => {
  const c = MOTION.crossfade;
  const i = inAt === null ? 1 : linear01(t, inAt + c.overlap, c.duration);
  const o = outAt === null ? 0 : linear01(t, outAt, c.duration);
  return { opacity: i * (1 - o) };
};

/**
 * The stack's soft edge, applied to each card in container coordinates (a mask on the container
 * itself switches off the cards' backdrop blur in Chrome). `top` is the card's top edge within
 * the container, so every card fades through the same 56px top and 40px bottom bands.
 */
export const softEdgeMask = (top: number): React.CSSProperties => {
  const h = STACK_CONTAINER_HEIGHT;
  const g = `linear-gradient(to bottom, transparent ${(-top).toFixed(2)}px, black ${(STACK.maskTopPx - top).toFixed(2)}px, black ${(
    h - STACK.maskBottomPx - top
  ).toFixed(2)}px, transparent ${(h - top).toFixed(2)}px)`;
  return { maskImage: g, WebkitMaskImage: g };
};

/** Current time in seconds (the composition fps can be 60 or 30). */
export const timeOf = (frame: number, fps: number) => frame / fps;

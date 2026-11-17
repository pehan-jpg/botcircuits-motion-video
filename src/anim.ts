import { interpolate, Easing } from "remotion";
import { EASE, MAX_OVERSHOOT } from "./constants";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Eased 0..1 progress between two frames. */
export const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = EASE,
): number => interpolate(frame, [start, end], [0, 1], { ...CLAMP, easing });

export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Pop in: scale 0.86 -> 1.03 -> 1 (3 percent overshoot, under the 4 percent cap)
 * and opacity 0 -> 1 over the first half.
 */
export const pop = (frame: number, start: number, duration: number) => {
  const peak = 1.03;
  if (peak > MAX_OVERSHOOT) {
    throw new Error("Overshoot exceeds the 4 percent rule");
  }
  const mid = start + duration * 0.6;
  const scale =
    frame < mid
      ? interpolate(frame, [start, mid], [0.86, peak], { ...CLAMP, easing: EASE })
      : interpolate(frame, [mid, start + duration], [peak, 1], {
          ...CLAMP,
          easing: Easing.inOut(Easing.quad),
        });
  const opacity = interpolate(frame, [start, start + duration * 0.5], [0, 1], CLAMP);
  return { scale, opacity };
};

/** Deterministic 0..1 hash from an integer seed (never Math.random). */
export const hash01 = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

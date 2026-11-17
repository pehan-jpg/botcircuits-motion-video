import { interpolate } from "remotion";
import { EASE } from "./constants";

/** Clamped, eased interpolation between two frames. */
export const tween = (
  frame: number,
  range: [number, number],
  out: [number, number] = [0, 1],
  easing: (t: number) => number = EASE,
) =>
  interpolate(frame, range, out, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

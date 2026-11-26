import { Easing, interpolate } from "remotion";

/** All timings in frames at 60fps. */
export const timing = {
  inDuration: 36,
  outDuration: 30,
  headerStagger: 5,
  contentStart: 26,
  contentStagger: 11,
  itemDuration: 22,
};

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeIn = Easing.bezier(0.55, 0, 0.75, 0.2);

/** 0→1 progress of an element that starts at `start` and lasts `duration`. */
export const progress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

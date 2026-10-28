import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE_IN } from "./theme";

type EasingFn = (t: number) => number;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds to frames, as used everywhere in this project.
export const toFrames = (seconds: number, fps: number) =>
  Math.round(seconds * fps);

// Timeline helpers bound to the current frame.
export const useTimeline = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0 to 1 progress of a move that starts at `at` seconds and lasts `duration`.
  const p = (at: number, duration: number, easing: EasingFn = EASE_IN) => {
    const a = toFrames(at, fps);
    const b = Math.max(a + 1, toFrames(at + duration, fps));
    return interpolate(frame, [a, b], [0, 1], { ...clamp, easing });
  };

  // Seconds elapsed since `at` (can be negative).
  const since = (at: number) => frame / fps - at;

  return { frame, fps, t: frame / fps, p, since };
};

export const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

// Number of characters typed at `cps` since `at`.
export const typedCount = (since: number, cps: number) =>
  Math.max(0, Math.floor(since * cps));

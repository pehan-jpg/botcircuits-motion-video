import {interpolate} from 'remotion';
import {ease} from './tokens';

/**
 * Eased 0..1 progress between two frames using the shared curve.
 * Clamped on both sides so values hold before and after the window.
 */
export const progress = (frame: number, start: number, end: number): number => {
  if (end <= start) return frame >= end ? 1 : 0;
  return interpolate(frame, [start, end], [0, 1], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

/** Linear interpolation helper. */
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

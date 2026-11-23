/**
 * Canvas and timing constants shared by all six capability animations.
 * Change these in one place to retarget every composition.
 */
export const WIDTH = 1600;
export const HEIGHT = 1000;
export const FPS = 60;
export const DURATION_SECONDS = 8;
export const DURATION_IN_FRAMES = FPS * DURATION_SECONDS; // 480

/** Convert seconds to a frame number at the shared frame rate. */
export const sec = (seconds: number): number => Math.round(seconds * FPS);

import {ease} from './theme';
import {WIDTH, HEIGHT} from './timeline';
import {STACK_CENTER} from './layout';

export type Camera = {
  /** World point placed at the centre of the screen. */
  x: number;
  y: number;
  scale: number;
  /** Degrees. */
  rotation: number;
};

// Keyframes in absolute frames. Each segment is eased with the global curve.
const X = {f: [0, 120, 138, 270, 300, 430, 466], v: [700, 700, 780, 780, 760, 760, STACK_CENTER.x]};
const Y = {
  f: [0, 120, 138, 270, 300, 330, 344, 370, 384, 430, 466],
  v: [273, 273, 440, 800, 1040, 1040, 1250, 1250, 1400, 1400, STACK_CENTER.y],
};
const S = {f: [0, 120, 138, 270, 300, 430, 466], v: [1, 1.12, 0.95, 1.06, 1.16, 1.2, 1]};
const R = {f: [0, 270, 300, 466], v: [0, 0, 1.5, 0]};

export const getCamera = (frame: number): Camera => ({
  x: ease(frame, X.f, X.v),
  y: ease(frame, Y.f, Y.v),
  scale: ease(frame, S.f, S.v),
  rotation: ease(frame, R.f, R.v),
});

/** CSS transform for a world container with transform-origin 0 0. */
export const cameraTransform = (c: Camera): string =>
  `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) rotate(${c.rotation}deg) scale(${c.scale}) translate(${-c.x}px, ${-c.y}px)`;

/** Reference camera used as the parallax origin. */
export const CAMERA_ORIGIN: Camera = {x: 700, y: 273, scale: 1, rotation: 0};

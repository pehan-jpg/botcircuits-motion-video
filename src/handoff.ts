// ---------------------------------------------------------------------------
// Hand-off contract between the Build scenes (4-8). Each morphing object is
// defined once here, so the last frame of a scene and the first frame of the
// next use the same numbers. Screen px unless noted.
// ---------------------------------------------------------------------------
import {Camera} from './camera';
import {sec} from './timeline';
import {PILL} from './layout';

export {PILL};

export const BUILD_DURATIONS = {
  scene04: sec(5),
  scene05: sec(9),
  scene06: sec(9),
  scene07: sec(6),
  scene08: sec(7),
} as const;

/** Backdrop images (fallbacks are procedural). */
export const BACKDROPS = {
  sky5a: 'backdrops/bd-5a-periwinkle-sky.jpg',
  night5b: 'backdrops/bd-5b-night-violet.jpg',
  peach6: 'backdrops/bd-6-peach-clouds.jpg',
  dusk8: 'backdrops/bd-8-dusk-sky.jpg',
} as const;

/** Scene 4 lockup (oversized, centred). */
export const LOCKUP = {markH: 198, cx: 960, cy: 520};

/** One-time input field (scenes 4-5), WORLD coords. */
export const FIELD = {cx: 960, cy: 540, width: 1500, height: 140, radius: 28, fontSize: 60, lineHeight: 76, padX: 60};
/** Scene 4 ends on a wide shot; scene 5 starts from it and pushes in. */
export const CAM_S4_END: Camera = {x: 960, y: 540, scale: 0.6, rotation: 0};
/** Periwinkle sky timeline: appears at scene-4 3.1 s, until scene-5 ~4.6 s. */
export const SKY5A_START_S4 = 3.1;
export const SKY5A_SPAN = 7;

/** The agent orb (white). Base diameter; scenes scale it. */
export const ORB = {size: 200};
/** Scene 5 ends with the orb (260px) in the left third, camera at identity. */
export const ORB_S5_END = {cx: 640, cy: 540, scale: 1.3};
/** Scenes 6 -> 7: the orb sits dead centre at 0.8. */
export const ORB_CENTER = {cx: 960, cy: 540, scale: 0.8};

/** Night backdrop starts at scene-5 4.2 s. */
export const NIGHT_START_S5 = 4.2;

/**
 * Scene 7 marquee: two rows of 160px logo tiles, rotated -4deg about the
 * frame centre, scrolling in opposite directions. Slot i of a row sits at
 * x = MARQUEE.x0 + i * MARQUEE.step (+ the row's scroll shift).
 */
export const MARQUEE = {rows: [330, 770], x0: -840, step: 210, size: 160, rotate: -4, slots: 19};
/** Where the four scene-6 nodes land in the marquee (row, slot). */
export const NODE_SLOTS = {
  ask: {row: 0, slot: 6, logo: 'salesforce'},
  verify: {row: 1, slot: 7, logo: 'zendesk'},
  block: {row: 0, slot: 10, logo: 'stripe'},
  confirm: {row: 1, slot: 11, logo: 'notion'},
} as const;
/** Screen position of a marquee slot (rotation applied) for a given row shift. */
export const marqueeSlot = (row: number, slot: number, shift = 0) => {
  const x = MARQUEE.x0 + slot * MARQUEE.step + shift;
  const y = MARQUEE.rows[row];
  const a = (MARQUEE.rotate * Math.PI) / 180;
  const dx = x - 960;
  const dy = y - 540;
  return {x: 960 + dx * Math.cos(a) - dy * Math.sin(a), y: 540 + dx * Math.sin(a) + dy * Math.cos(a)};
};
/** Row scroll shift at scene-7 time t (starts at rest, then ~110 px/s). */
export const marqueeShift = (row: number, t: number) => {
  const ramp = Math.min(1, Math.max(0, t));
  const d = 110 * (t <= 1 ? (ramp * ramp) / 2 : t - 0.5);
  return row === 0 ? -d : d;
};

/**
 * Comet wipe 7 -> 8: starts at scene-7 5.5 s, lasts 1.5 s (ends at scene-8 1.0 s).
 * The orb travels from the centre (0.8) to the left third (1.0).
 */
export const COMET = {startS7: 5.5, duration: 1.5, from: {x: 960, y: 540, scale: 0.8}, to: {x: 640, y: 420, scale: 1}};

// ---------------------------------------------------------------------------
// HAND-OFF TO SCENE 9: the WhatsApp card at the last frame of scene 8. It has
// expanded to fill the frame and becomes the chat window of scene 9.
// ---------------------------------------------------------------------------
export const WHATSAPP_CARD_FINAL = {
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  borderRadius: 0,
  background: '#FFFFFF',
  /** WhatsApp logo at the last frame (centre + size). */
  logo: {centerX: 960, centerY: 540, size: 180},
  /** Notification badge (now "0") at the last frame. */
  badge: {centerX: 1800, centerY: 120, size: 72},
} as const;

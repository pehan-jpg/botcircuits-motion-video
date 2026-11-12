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
  scene05: sec(8),
  scene06: sec(6),
  scene07: sec(6),
  scene08: sec(6),
} as const;

/** Backdrop images (fallbacks are procedural). */
export const BACKDROPS = {
  sky5a: 'backdrops/bd-5a-periwinkle-sky.jpg',
  night5b: 'backdrops/bd-5b-night-violet.jpg',
  peach6: 'backdrops/bd-6-peach-clouds.jpg',
} as const;

/** Scene 4 lockup (oversized, centred). */
export const LOCKUP = {markH: 198, cx: 960, cy: 520};

/** One-time input field (scenes 4-5), WORLD coords. */
export const FIELD = {cx: 960, cy: 540, width: 1300, height: 120, radius: 28, fontSize: 64, padX: 56};
/** Scene 4 ends on a wide shot; scene 5 starts from it and pushes in. */
export const CAM_S4_END: Camera = {x: 960, y: 540, scale: 0.6, rotation: 0};
/** Periwinkle sky timeline: appears at scene-4 3.1 s, until scene-5 ~4.6 s. */
export const SKY5A_START_S4 = 3.1;
export const SKY5A_SPAN = 7;

/** The agent orb. */
export const ORB = {size: 220, ring: 3};
/** Scene 5 ends with the orb in the left third (camera at identity). */
export const ORB_S5_END = {cx: 640, cy: 540, scale: 1};
/** Scenes 6 -> 7 -> 8: the orb sits dead centre at 0.8. */
export const ORB_CENTER = {cx: 960, cy: 540, scale: 0.8};

/** Night backdrop starts at scene-5 4.2 s. */
export const NIGHT_START_S5 = 4.2;

// ---------------------------------------------------------------------------
// HAND-OFF TO SCENE 9: the WhatsApp tile at the last frame of scene 8. It has
// expanded to fill the frame and becomes the chat window of scene 9.
// ---------------------------------------------------------------------------
export const WHATSAPP_TILE_FINAL = {
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  borderRadius: 0,
  /** WhatsApp logo inside the tile at the last frame (centre + size). */
  logo: {centerX: 960, centerY: 540, size: 168},
  /** Notification badge (now "0") at the last frame. */
  badge: {centerX: 1800, centerY: 120, size: 72},
} as const;

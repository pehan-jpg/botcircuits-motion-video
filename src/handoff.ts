// ---------------------------------------------------------------------------
// Hand-off contract between the Build scenes (4-8). Every morphing object is
// defined here once, so the last frame of one scene and the first frame of
// the next use the very same numbers. All values are screen px unless noted.
// ---------------------------------------------------------------------------
import {Camera} from './camera';
import {sec} from './timeline';
import {PILL} from './layout';

export {PILL};

/** Build-stage scene durations. */
export const BUILD_DURATIONS = {
  scene04: sec(5),
  scene05: sec(8),
  scene06: sec(6),
  scene07: sec(6),
  scene08: sec(6),
} as const;

/** BotCircuits lockup: oversized in scene 4, then parked top-left. */
export const LOCKUP_BIG = {markH: 198, cx: 960, cy: 510};
export const LOCKUP_SMALL = {markH: 52, left: 80, top: 56};

/** Console prompt bar (centre + scale; geometry in components/PromptBar). */
export const PROMPT_BIG = {cx: 960, cy: 830};
export const PROMPT_S4_END_SCALE = 1.03; // slow camera push in scene 4
export const PROMPT_SLIM = {cx: 960, cy: 96, scale: 0.66};

/** Agent card in scene 5 (WORLD coords) and scene 5's final camera. */
export const AGENT_CARD = {left: 550, top: 390, width: 820, height: 260};
export const AGENT_CARD_AVATAR = {cx: 108, cy: 130, size: 120}; // card-local
export const AGENT_CARD_TITLE = {left: 196, cy: 98, fontSize: 44}; // card-local
export const AGENT_CARD_CHIP = {left: 196, top: 140};
export const CAM_S5_END: Camera = {x: 1030, y: 520, scale: 1.2, rotation: 0};

/** Agent chip (top-left from scene 6). Width depends on the measured name. */
export const AGENT_NAME = 'Card Support Agent';
export const AGENT_CHIP = {left: 80, cy: 98, height: 84, avatar: 60, pad: 12, gap: 16, fontSize: 26, padRight: 30};
/** Agent chip parked on the left in scene 7 (centre + scale). */
export const AGENT_CHIP_S7 = {cx: 420, cy: 500, scale: 1.15};

/** Procedure page frame in WORLD coords (scene 6 camera ends at identity). */
export const PAGE = {x: 60, y: 150, width: 1800, height: 850};
export const PAGE_CENTER = {x: PAGE.x + PAGE.width / 2, y: PAGE.y + PAGE.height / 2};
/** Page transform at the end of scene 6 and as a card in scene 7. */
export const PAGE_S6_END = {cx: 560, cy: 610, scale: 0.5, opacity: 0.85};
export const PAGE_S7_CARD = {cx: 420, cy: 760, scale: 0.3};

// ---------------------------------------------------------------------------
// HAND-OFF TO SCENE 9: the agent avatar at the last frame of scene 8.
// ---------------------------------------------------------------------------
export const AGENT_NODE = {avatarCx: 960, avatarCy: 330, avatarSize: 160}; // scene-8 world
export const CAM_S8_END: Camera = {x: 960, y: 330, scale: 1.3, rotation: 0};
export const AGENT_AVATAR_FINAL = {
  centerX: 960,
  centerY: 540,
  size: 208, // 160 * 1.3
  x: 856,
  y: 436,
} as const;

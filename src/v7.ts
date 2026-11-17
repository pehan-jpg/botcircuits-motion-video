// ---------------------------------------------------------------------------
// v7 Build stage timeline (scenes 4-9). Scenes overlap by 0.5 s; each scene's
// start is relative to the start of scene 4 (absolute 16 s in FullVideo).
// ---------------------------------------------------------------------------
import {sec} from './timeline';
import {Camera} from './camera';
import {BEAT_LEN, SCENE_LEN} from './pacing';

export const OVERLAP = 0.5;
/** Overlap next to a TextBeat (both sides). */
export const BEAT_OVERLAP = 0.4;
/** Build stage in order: scenes and the seven TextBeats (b1..b7). */
const ORDER = [
  ['s4', SCENE_LEN.s4], ['b1', BEAT_LEN.b1], ['s5', SCENE_LEN.s5], ['b2', BEAT_LEN.b2], ['s6', SCENE_LEN.s6], ['b3', BEAT_LEN.b3],
  ['s7', SCENE_LEN.s7], ['b4', BEAT_LEN.b4], ['s8', SCENE_LEN.s8], ['b5', BEAT_LEN.b5], ['s9', SCENE_LEN.s9], ['s10', SCENE_LEN.s10],
  ['b6', BEAT_LEN.b6], ['s11', SCENE_LEN.s11], ['b7', BEAT_LEN.b7], ['s12', SCENE_LEN.s12], ['s13', SCENE_LEN.s13],
] as const;
export type BuildKey = (typeof ORDER)[number][0];
export const BUILD_KEYS = ORDER.map(([k]) => k) as BuildKey[];
const DUR = Object.fromEntries(ORDER) as Record<BuildKey, number>;
const ovBetween = (a: string, b: string) => (a[0] === 'b' || b[0] === 'b' ? BEAT_OVERLAP : OVERLAP);
const start = {} as Record<BuildKey, number>;
const ov = {} as Record<BuildKey, {in: number; out: number}>;
(() => {
  let t = 0;
  ORDER.forEach(([k, d], i) => {
    const inLen = i === 0 ? 0 : ovBetween(ORDER[i - 1][0], k);
    const outLen = i === ORDER.length - 1 ? 0 : ovBetween(k, ORDER[i + 1][0]);
    start[k] = i === 0 ? 0 : t - inLen;
    ov[k] = {in: inLen || OVERLAP, out: outLen || OVERLAP};
    t = start[k] + d;
  });
})();
export const BUILD7 = {dur: DUR, start, ov};
export const BUILD7_TOTAL = start.s13 + DUR.s13;
export const BUILD7_FRAMES = {
  start: Object.fromEntries(Object.entries(start).map(([k, v]) => [k, sec(v)])) as Record<BuildKey, number>,
  dur: Object.fromEntries(Object.entries(DUR).map(([k, v]) => [k, sec(v)])) as Record<BuildKey, number>,
  total: sec(BUILD7_TOTAL),
};

// ---------------------------------------------------------------------------
// Stage world (scenes 5-8). Chat card on the left, app window on the right,
// far enough apart that each view shows ONE card fully, with the other card
// fully out of frame (no clipped cards). Both views are unzoomed (1.0).
// ---------------------------------------------------------------------------
export const SAFE = 96; // px safe margin on every side
export const CHAT = {x: 0, y: 110, width: 640, height: 860, radius: 32};
export const SHELL = {x: 1340, y: 100, width: 1500, height: 880, sidebar: 300, header: 88};
export const CONTENT = {x: SHELL.x + SHELL.sidebar, y: SHELL.y + SHELL.header, width: SHELL.width - SHELL.sidebar, height: SHELL.height - SHELL.header};
/** Camera that frames the chat card. */
export const CHAT_VIEW: Camera = {x: CHAT.x + CHAT.width / 2, y: 540, scale: 1, rotation: 0};
/** Camera that frames the whole app window (78% of frame width). */
export const CONFIG_VIEW: Camera = {x: SHELL.x + SHELL.width / 2, y: 540, scale: 1, rotation: 0};
export const AGENT = 'Card Services Agent';

/** Console card (scene 5) and its pill, shared from scene 4 (screen px). */
export const CONSOLE_CARD = {cx: 960, cy: 540, width: 1280, height: 760};
export const PILL_S5 = {cx: 960 - 1280 / 2 + 60 + 40, cy: 540 - 760 / 2 + 136 + 20, width: 80, height: 40};

/** S8 -> S9: the dark Publish button (screen px). */
export const PUBLISH_BTN = {cx: 1110, cy: 700, width: 340, height: 96};

// ---------------------------------------------------------------------------
// HAND-OFF TO SCENE 10: the WhatsApp card at the last frame of scene 9.
// ---------------------------------------------------------------------------
/** Last frame of scene 9: the WhatsApp logo alone, centred, on WhatsApp green. */
export const WHATSAPP_FINAL = {
  background: '#25D366',
  logo: {centerX: 960, centerY: 540, size: 200, color: '#FFFFFF'},
} as const;

/** S7 -> S8: where the cursor is (screen px) at the start of scene 8, travelling toward "Simulator". */
export const CURSOR_S7_END = {x: 760, y: 820};

/** S10/S11: centred phone-style chat and call cards (screen px). */
export const CENTER_CARD = {x: 540, y: 540 - 430, width: 640, height: 860}; // left of the 9:02 AM clock
/** S10: where the WhatsApp header glyph sits (screen px, centre) and its size. */
export const WA_HEADER_GLYPH = {cx: CENTER_CARD.x + 52, cy: CENTER_CARD.y + 48, size: 44};
/** S11 -> S12: the call card collapses into Daniel's conversation row (screen px, at CONFIG_VIEW). */
export const DANIEL_ROW = {x: 510 + 32, y: 188 + 28 + 1 * 108, width: 400, height: 96};
/** S12 -> S13: the loop ring at the frame centre (screen px). */
export const LOOP_RING = {cx: 960, cy: 540, r: 150, orb: 120};
